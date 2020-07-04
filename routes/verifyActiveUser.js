const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({error: 'Access Denied'});
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        if (!verified.data.active) return res.status(401).json({error: 'User isn\'t active'});
        next();
    } catch (err) {
        res.status(400).json({error: 'Invalid Token'});
    }
};