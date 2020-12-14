// const fs = require("fs");
const passport = require("passport");
require('./config/passport')(passport);
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisePool } = require("./util/mysql.js");
const authConfig = require("./config/auth.config.js");
const myMiddleware = require("./util/middleware.js")
const PORT = 3080;

const corsOptions = {
    origin: "http://localhost:3000"
};

const app = express();
// app.use(express.static("public"));
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", function (req, res) {
    res.send("Hello. How can I help you?");
});

app.post("/api/auth/signin", 
    myMiddleware.catchAsyncErr(async function (req, res) {
        const sql = "SELECT * FROM `users` WHERE `username` = ?";
        const [user] = await promisePool.execute(sql, [req.body.username]);
        if (user == null || user.length !== 1) {
            return res.status(401).json({ success: false, message: "Could not find user" });
        }
        const match = await bcrypt.compare(req.body.password, user[0].pwd_hash);
        if (match) {
            const payload = {
                sub: user[0].user_id,
                iat: Date.now()
            };
            const token = jwt.sign(payload, authConfig.SECRET, {
                expiresIn: "1h"
            });
            return res.json({
                success: true,
                accessToken: `Bearer ${token}`
            });
        } 
        return res.status(401).json({ success: false, message: "You entered the wrong password" });
    })
);

app.get("/api/users", 
    passport.authenticate("jwt", { session: false }),
    myMiddleware.checkAdmin(),
    myMiddleware.catchAsyncErr(async function (req, res) {
        const sql = "SELECT * FROM `users`";
        const [result] = await promisePool.execute(sql);
        res.json(result);
    })
);

app.get("/api/users/:userId", 
    passport.authenticate("jwt", { session: false }),
    myMiddleware.checkUser(),
    myMiddleware.catchAsyncErr(async function (req, res) {
        const sql = "SELECT `username`, `first_name`, `last_name`, `is_admin` FROM `users` WHERE `user_id` = ?";
        const [result] = await promisePool.execute(sql, [req.params.userId]);
        res.json(result);
    })
);

app.post("/api/users", 
    myMiddleware.catchAsyncErr(async function (req, res) {
        const username = req.body.user.username;
        const pwd = await bcrypt.hash(req.body.user.password, authConfig.SALTROUNDS);
        const first = req.body.user.first_name;
        const last = req.body.user.last_name;
        const sql = "INSERT INTO users (username, pwd_hash, first_name, last_name) VALUES (?, ?, ?, ?)";
        promisePool.execute(sql, [username, pwd, first, last]);
        res.json("User Added");
    })
);

/* app.put("/users/:userId",
    passport.authenticate("jwt", { session: false }),
    myMiddleware.checkUser(),
    function (req, res) {
        const sql = "UPDATE `users` SET WHERE `user_id` = ?";
        pool.query(sql, [req.params.userId], function (err, result) {
            if (err)
                return res.sendStatus(500);
            res.json(result);
        });
    }
); */

app.delete("/api/users/:userId",
    passport.authenticate("jwt", { session: false }),
    myMiddleware.checkUser(),
    myMiddleware.catchAsyncErr(async function (req, res) {
        const sql = "DELETE FROM `users` WHERE `user_id` = ?";
        promisePool.execute(sql, [req.params.userId]);
        res.json("User Deleted");
    })
);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


/* function init() {
    const sqlStatements = fs.readFileSync("init.sql").toString().split(");");
    sqlStatements.pop();
    for (statement of sqlStatements) {
        pool.query(`${statement});`, function (err, result) {
            if (err) {
                throw err;
            }
        });
    }
} */
