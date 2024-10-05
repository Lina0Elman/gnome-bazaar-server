const jwt = require('jsonwebtoken'); // Assuming you'll implement JWT
const config = require('../../config'); // Ensure your config has necessary keys


// Controller for token generation
exports.generateToken = async (req, res) => {
    try {
        // Implement JWT token generation
        const payload = {
            id: req.user._id,
            fullName: req.user.fullName,
            role: req.user.role,
        };

        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

        res.json({
            name: req.user.fullName,
            expiry: new Date(Date.now() + 3600000), // 1 hour
            token: token,
            isAdmin: req.user.role === 'Admin',
            isSupplier: req.user.role === 'Supplier',
            uuid: req.user._id,
        });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ message: 'Error generating token' });
    }
};
