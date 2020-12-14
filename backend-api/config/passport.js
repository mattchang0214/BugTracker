const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { promisePool } = require("../util/mysql.js");
const authConfig = require("./auth.config.js");

const passportJWTOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: authConfig.SECRET,
    ignoreExpiration: false,
    passReqToCallback: false,
};

module.exports = function (passport) {
    passport.use(new JwtStrategy(passportJWTOptions, 
        async function (jwt_payload, callback) {
            const sql = "SELECT * FROM `users` WHERE `user_id` = ?";
            try {
                const [user] = await promisePool.execute(sql, [jwt_payload.sub]);
                if (user != null && user.length > 0) {
                    return callback(null, user[0]);
                }
                return callback(null, false);
            }
            catch (err) {
                return callback(err);
            }
        }
    ));
}