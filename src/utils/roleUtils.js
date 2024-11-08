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

const lazyVal =(initializer) => {
    let value;
    let initialized = false;

    return () => {
        if (!initialized) {
            value = initializer();
            initialized = true;
        }
        return value;
    };
}

// Get all roles that are suppliers
const getSupplierRoles = lazyVal(() => {
    return Object.keys(roles).filter(role => hasRole(role, roles.Supplier.name));
});


// Check if the role is valid
const isRoleValid = (role) => {
    return roles[role] !== undefined;
};
module.exports = { hasRole, isRoleValid, getSupplierRoles };