const mysql = require('promise-mysql');
module.exports = {
    con: mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DB,
    port: process.env.PORT
    })
    };