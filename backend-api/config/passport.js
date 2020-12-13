const mysql = require("mysql2");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const authConfig = require("./auth.config.js");
const dBConfig = require("./db.config.js");

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

const passportJWTOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: authConfig.SECRET,
    ignoreExpiration: false,
    passReqToCallback: false,
};

module.exports = function(passport) {
    passport.use(new JwtStrategy(passportJWTOptions, 
        function (jwt_payload, callback) {
            const sql = "SELECT * FROM `users` WHERE `user_id` = ?";
            pool.query(sql, [jwt_payload.sub], function (err, user) {
                if (err != null)
                    return callback(err);
                if (user != null)
                    return callback(null, user);
                return callback(null, false);
            });
        }
    ));
}