const roles = {
    Admin: {
        name: 'Admin',
        inherits: ['Supplier', 'User']
    },
    Supplier: {
        name: 'Supplier',
        inherits: ['User']
    },
    User: {
        name: 'User',
        inherits: []
    }
};

module.exports = roles;