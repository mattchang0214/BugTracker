const checkAdmin = () => (req, res, next) => {
    if (req.user[0].is_admin !== 1)
        return res.sendStatus(403);
    return next();
}

module.exports = { checkAdmin };