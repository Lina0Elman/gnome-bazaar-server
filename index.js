const app = require('./src/app');
const dotenv = require('dotenv');
const config = require('./config');

// Initialize environment variables
dotenv.config();

app.listen(config.app.port, () => {
    console.log(`Server running on http://localhost:${config.app.port}${config.app.baseName}`);
});