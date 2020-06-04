const mysql = require('mysql');
const crypto = require('crypto');

const sqlConnStr = process.env.DB_CONN

async function login(form) {
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection(sqlConnStr)
        connection.connect();
        connection.query('SELECT * FROM `accounts` WHERE email = ?', [form.email], (error, results, fields) => {
            connection.end();
            if (error) return reject(error);
            if (results && results.length) {
                var salt = results[0].salt
                if (!salt) return reject();
                var pass = crypto.pbkdf2Sync(form.password, salt, 10000, 64, 'sha512').toString('base64');
                if (pass == results[0].password)
                    resolve(results[0])
                else resolve(null)
            }
        });
    })
}

async function reset(form) {
    var newSalt = crypto.randomBytes(64).toString('hex');
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection(sqlConnStr)
        connection.connect();
        connection.query('UPDATE `accounts` SET password = "", salt = ? WHERE email = ?', [newSalt, form.email], (error, results, fields) => {
            connection.end();
            if (error) return reject(error);
            resolve(newSalt)
        });
    })
}

async function setPassword(id, form) {
    var newSalt = crypto.randomBytes(64).toString('hex');
    var newPassword = crypto.pbkdf2Sync(form.password, newSalt, 10000, 64, 'sha512').toString('base64');
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection(sqlConnStr)
        connection.connect();
        connection.query('UPDATE `accounts` SET password = ?, salt = ? WHERE password = "" and salt = ?', [newPassword, newSalt, id], (error, results, fields) => {
            connection.end();
            if (error) return reject(error);
            resolve()
        });
    })
}

async function register(form) {
    var newSalt = crypto.randomBytes(64).toString('hex');
    var newPassword = crypto.pbkdf2Sync(form.password, newSalt, 10000, 64, 'sha512').toString('base64');
    var account = {
        "firstName": form.firstName,
        "lastName": form.lastName,
        "occupation": form.occupation || form.regType,
        "pwz": form.pwz || form.onetimecode,
        "email": form.email,
        "password": newPassword,
        "salt": newSalt,
        "statute": form.statute,
        "marketingConsent": form.marketingConsent
    }

    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection(sqlConnStr)
        connection.connect();
        connection.query('INSERT INTO accounts SET ?', account, (error, results, fields) => {
            if (error) {
                connection.end();
                return reject(error);
            }
            if (form.onetimecode) {
                connection.query('UPDATE onetimecodes SET owner = ?, ownOn = ? where value = ?', [results.insertId, new Date().toISOString(), form.onetimecode], (error2, results2, fields2) => {
                    connection.end();
                    if (error2) return reject(error2);

                    resolve(account)
                });
            } else {
                connection.end();
                resolve(account)
            }
        });
    })
}

async function getInfo(date) {
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection(sqlConnStr);
        connection.connect();
        connection.query('SELECT * FROM webinars WHERE validFrom <= ? and validTo >= ? and isdeleted = 0', [date, date], function (error, results, fields) {
            connection.end();
            if (error) return reject(error);
            if (results && results.length)
                resolve(results[0].info)
            else resolve(null)
        });
    })
}

async function getLink(date) {
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection(sqlConnStr);
        connection.connect();
        connection.query('SELECT * FROM webinars WHERE validFrom <= ? and validTo >= ? and isdeleted = 0', [date, date], function (error, results, fields) {
            connection.end();
            if (error) return reject(error);
            if (results && results.length) {
                resolve({ link: results[0].link, id: results[0].id })
            }
            else resolve(null)
        });
    })
}

async function logAccess(email, webinarid) {
    var log = {
        accountid: undefined,
        webinarid: webinarid,
        timestamp: new Date().toISOString()
    };
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection(sqlConnStr);
        connection.connect();
        connection.query('SELECT * FROM `accounts` WHERE email = ?', [email], (error, results, fields) => {
            if (error) return reject(error);
            if (results && results.length) {
                log.accountid = results[0].id;
                connection.query('INSERT INTO webinarlog SET ?', log, function (error2, results2, fields2) {
                    connection.end();
                    if (error2) return reject(error2);
                    resolve()
                });
            }
        });
    })
}

async function isCodeValid(code) {
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection(sqlConnStr);
        connection.connect();
        connection.query('SELECT * FROM onetimecodes WHERE owner is null and isdeleted = 0 and value = ?', [code], function (error, results, fields) {
            connection.end();
            if (error) return reject(error);
            if (results && results.length)
                resolve(!!results[0].value)
            else resolve(null)
        });
    })
}

async function isMailUnique(email) {
    return new Promise((resolve, reject) => {
        var connection = mysql.createConnection(sqlConnStr);
        connection.connect();
        connection.query('SELECT * FROM `accounts` WHERE email = ?', [email], (error, results, fields) => {
            connection.end();
            if (error) return reject(error);
            return resolve(results.length === 0);
        });
    })
}

module.exports = {
    login,
    register,
    reset,
    setPassword,
    getInfo,
    getLink,
    logAccess,
    isCodeValid,
    isMailUnique
}