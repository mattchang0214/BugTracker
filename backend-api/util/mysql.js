const mysql = require("mysql2");
const dBConfig = require("../config/db.config.js");

const pool = mysql.createPool({
    host: dBConfig.HOST,
    user: dBConfig.USER,
    password: dBConfig.PASSWORD,
    database: dBConfig.DB,
    connectionLimit: dBConfig.pool.MAX,
    // acquireTimeout: config.pool.ACQUIRE,
    connectTimeout: dBConfig.pool.IDLE,
    waitForConnections: dBConfig.pool.WAIT,
    queueLimit: dBConfig.pool.QUEUE
});

const promisePool = pool.promise();

module.exports = { promisePool };