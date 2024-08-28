const app = require('./src/app');
const dotenv = require('dotenv');

// Initialize environment variables
dotenv.config();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});