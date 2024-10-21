// utils/roleUtils.js
const roles = require('../utils/consts');

const hasRole = (userRole, requiredRole) => {
    if (userRole === requiredRole) {
        return true;
    }

    const role = roles[userRole];
    if (!role) {
        return false;
    }

    return role.inherits.includes(requiredRole);
};

// Check if the role is valid
const isRoleValid = (role) => {
    return roles[role] !== undefined;
};
module.exports = { hasRole, isRoleValid };