if (!process.env.JWT_SECRET) {
    const dotenv = require('dotenv');
    dotenv.config();
}

const Koa = require('koa');
const serve = require('koa-static')
const mount = require('koa-mount');
const bodyParser = require('koa-bodyparser');
const jwtCheck = require('koa-jwt');
const cors = require('koa-cors');
const jwt = require('jsonwebtoken');
const form = require('./lib/validation/form')
const { login, register, reset, setPassword, getInfo, getLink, logAccess, isCodeValid, isMailUnique } = require('./services/db')
const { sendResetMail } = require('./services/mail')

if (typeof (PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}

const app = new Koa();

const secret = process.env.JWT_SECRET

var cookieOptions = {
    domain: process.env.COOKIE_DOMAIN,
    path: '/',
    httpOnly: false,
    secure: false,
    overwrite: true,
    maxAge: 8 * 60 * 60 * 1000
}

var staticDir = process.env.NODE_ENV === 'production' ? '/public' : '/front/build'

app.use(serve(__dirname + staticDir))
app.use(mount('/join', serve(__dirname + staticDir)))
app.use(mount('/login', serve(__dirname + staticDir)))
app.use(mount('/register', serve(__dirname + staticDir)))
app.use(mount('/reset', serve(__dirname + staticDir)))
app.use(mount('/password', serve(__dirname + staticDir)))
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser());
app.use(async (ctx, next) => {
    if (ctx.method === 'POST' && ctx.url === '/login') {
        var valid = await form.login.isValid(ctx.request.body);
        if (valid) {
            try {
                var account = await login(ctx.request.body)
                if (account) {
                    var token = jwt.sign({
                        firstName: account.firstName,
                        lastName: account.lastName,
                        email: account.email
                    }, secret, { expiresIn: '8h' });
                    ctx.body = await getInfo(new Date().toISOString());
                    ctx.cookies.set('webinar-token', token, cookieOptions);
                } else {
                    ctx.response.status = 401;
                }
            } catch (err) {
                console.log(err)
                ctx.response.status = 500;
            }
        }
        else {
            ctx.response.status = 400;
        }
    } else {
        await next()
    }
});
app.use(async (ctx, next) => {
    if (ctx.method === 'POST' && ctx.url === '/reset') {
        var valid = await form.reset.isValid(ctx.request.body);
        if (valid) {
            var id = await reset(ctx.request.body)
            await sendResetMail(id, ctx.request.body.email)
            ctx.response.status = 200;
        }
        else {
            ctx.response.status = 400;
        }
    } else {
        await next()
    }
});
app.use(async (ctx, next) => {
    if (ctx.method === 'POST' && ctx.url.startsWith('/password')) {
        var valid = await form.newPassword.isValid(ctx.request.body);
        if (valid) {
            try {
                await setPassword(ctx.query.id, ctx.request.body)
                ctx.response.status = 200;
            } catch (err) {
                console.log(err)
                ctx.response.status = 500;
            }
        }
        else {
            ctx.response.status = 400;
        }
    } else {
        await next()
    }
});
app.use(async (ctx, next) => {
    if (ctx.method === 'POST' && ctx.url === '/register') {
        var valid = await form.register.isValid(ctx.request.body, { context: { isCodeValid: isCodeValid, isMailUnique: isMailUnique } });
        if (valid) {
            try {
                var account = await register(ctx.request.body)
                var token = jwt.sign({
                    firstName: account.firstName,
                    lastName: account.lastName,
                    email: account.email
                }, secret, { expiresIn: '8h' });
                ctx.cookies.set('webinar-token', token, cookieOptions);
                ctx.body = await getInfo(new Date().toISOString());
            } catch (err) {
                console.log(err)
                ctx.response.status = 500;
            }
        }
        else {
            ctx.response.status = 400;
        }
    } else {
        await next()
    }
});
app.use(async (ctx, next) => {
    if (ctx.method === 'GET' && ctx.url.startsWith('/validcode')) {
        try {
            ctx.response.status = (await isCodeValid(ctx.query.code) ? 200 : 400);
        } catch (err) {
            console.log(err)
            ctx.response.status = 500;
        }
    } else {
        await next()
    }
});
app.use(async (ctx, next) => {
    if (ctx.method === 'GET' && ctx.url.startsWith('/validmail')) {
        try {
            ctx.response.status = (await isMailUnique(ctx.query.mail) ? 200 : 400);
        } catch (err) {
            console.log(err)
            ctx.response.status = 500;
        }
    } else {
        await next()
    }
});

app.use(jwtCheck({ secret: secret, cookie: 'webinar-token' }));

// Protected middleware
app.use(async ctx => {
    if (ctx.url.match(/^\/webinar-link/)) {
        try {
            var date = new Date().toISOString()
            var link = await getLink(date)
            if (link && link.link) {
                await logAccess(ctx.state.user.email, link.id);
                ctx.body = link.link;
            }
            else {
                ctx.response.status = 204;
            }
        } catch (err) {
            console.log(err)
            ctx.response.status = 500;
        }
    }
});

if (typeof (PhusionPassenger) !== 'undefined') {
    app.listen('passenger');
} else {
    app.listen(process.env.NODE_ENV === 'production' ? undefined : 3005);
}