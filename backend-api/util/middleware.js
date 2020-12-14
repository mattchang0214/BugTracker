const catchAsyncErr = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(() => {
        next();
        res.sendStatus(500);
    });
};

const checkAdmin = () => (req, res, next) => {
    if (req.user.is_admin !== 1) {
        return res.sendStatus(403);
    }
    return next();
};

const checkUser = () => (req, res, next) => {
    if (req.user.is_admin !== 1 && req.user.user_id != req.params.userId) {
        return res.sendStatus(403);
    }
    return next();
};

module.exports = { catchAsyncErr, checkAdmin, checkUser };