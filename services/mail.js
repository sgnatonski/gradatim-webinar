const dots = require("dot").process({ path: "./services/mailtemplates" });
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    }
});

async function sendResetMail(id, email) {
    var content = dots.reset({ id: id });
    await transport.sendMail({
        from: process.env.EMAIL_FROM, // sender address
        to: email, // list of receivers
        subject: "Reset hasła", // Subject line
        html: content
    });
}

module.exports = {
    sendResetMail
}
