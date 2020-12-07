const mysql = require("mysql2");
// const fs = require("fs");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const dBConfig = require("./config/db.config.js");
const authConfig = require("./config/auth.config.js");
const PORT = 3080;

const passportJWTOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: authConfig.SECRET,
    ignoreExpiration: false,
    passReqToCallback: false,
};

const corsOptions = {
    origin: "http://localhost:3000"
};

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

const app = express();
// app.use(express.static("public"));
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get("/", function (req, res) {
    res.send('App Works!');
});

app.post("/api/auth/signin", function (req, res) {
    const sql = "SELECT * FROM `users` WHERE `username` = ?";
    pool.query(sql, [req.body.username], function(err, user) {
        if (err)
            throw err;
        if (user == null || user.length !== 1) {
            return res.status(401).json({ success: false, message: "Could not find user" });
        }
        if (bcrypt.compareSync(req.body.password, user[0].pwd_hash)) {
            const payload = {
                sub: user.id,
                iat: Date.now()
            };
            const token = jwt.sign(payload, authConfig.SECRET, {
                expiresIn: "1h"
            });
            res.status(200).json({
                success: true,
                accessToken: `Bearer ${token}`
            });
        } 
        else
            res.status(401).json({ success: false, message: "You entered the wrong password" });
    });
});

app.get("/api/users", 
    passport.authenticate("jwt", { failureRedirect: "/login", session: false }),
    function (req, res) {
        const sql = "SELECT * FROM `users`";
        pool.query(sql, function (err, result) {
            if (err)
                throw err;
            res.json(result);
        });
    }
);

/* app.get("/api/users/:userId", function (req, res) {

}); */

app.post("/api/users", (req, res) => {
    const username = req.body.user.username;
    const pwd = req.body.user.password;
    const first = req.body.user.first_name;
    const last = req.body.user.last_name;
    const sql = "INSERT INTO users (username, password, first_name, last_name) VALUES (?, ?, ?, ?)";
    pool.query(sql, [username, pwd, first, last], function (err, result) {
        if (err)
            throw err;
    });
    res.json("User Added");
});

/* app.put("/users/:userId", (req, res) => {

}); */

app.delete("/api/users/:userId", (req, res) => {
    const sql = "DELETE FROM users WHERE user_id=?";
    pool.query(sql, [req.body.userId], function (err, result) {
        if (err)
            throw err;
    });
    res.json("User Deleted");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


/* function init() {
    const sqlStatements = fs.readFileSync("init.sql").toString().split(");");
    sqlStatements.pop();
    for (statement of sqlStatements) {
        pool.query(`${statement});`, function (err, result) {
            if (err)
                throw err;
        });
    }
} */