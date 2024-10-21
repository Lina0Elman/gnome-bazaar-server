// middlewares/adminAuth.js
const { StatusCodes } = require('http-status-codes');
const {hasRole} = require("../utils/roleUtils");
const roles = require('../utils/consts');

const adminAuth = (req, res, next) => {
    if (req.user && hasRole(req.user.role, roles.Admin.name)) {
        next(); // User is an admin, proceed to the next middleware or route handler
    } else {
        res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied. Admins only.' });
    }
};

module.exports = adminAuth;