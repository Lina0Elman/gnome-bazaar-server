const app = require('./src/app');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const bcrypt = require('bcrypt');
const config = require('./config');
const { v4: uuidv4 } = require('uuid');
const { connectToDatabase } = require('./src/models/database');
const User = require('./src/models/User');  // Import the User model
const Product = require('./src/models/Product');  // Import the Product model
const utils = require('./testDataUtils');

// Initialize environment variables
dotenv.config();

const fs = require('fs');

// Function to load image as buffer
const loadImageAsBuffer = (imagePath) => {
    try {
        return fs.readFileSync(imagePath);  // Read the file as buffer
    } catch (err) {
        console.error(`Error loading image ${imageName}:`, err);
        return null;
    }
};

// Function to stop and remove Docker container
function stopAndRemoveContainer(containerName) {
    return new Promise((resolve, reject) => {
        exec(`docker stop ${containerName}`, (err) => {
            if (err) {
                console.error(`Error stopping container ${containerName}:`, err);
                reject(err);
            } else {
                exec(`docker rm ${containerName}`, (err) => {
                    if (err) {
                        console.error(`Error removing container ${containerName}:`, err);
                        reject(err);
                    } else {
                        console.log(`Successfully removed container ${containerName}`);
                        resolve();
                    }
                });
            }
        });
    });
}

// Function to start MongoDB Docker container
function startMongoContainer(alreadyTried) {
    return new Promise((resolve, reject) => {
        exec('docker run -d -p 27017:27017 --name gnome-bazaar-mongo mongo:latest', (err, stdout) => {
            if (err) {
                console.error('Error starting MongoDB Docker container:', err);
                if (!alreadyTried) {
                    stopAndRemoveContainer('gnome-bazaar-mongo')
                        .then(() => {
                            console.log('Retrying to start MongoDB Docker container...');
                            return startMongoContainer(true);
                        })
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(err);
                }
            } else {
                console.log('MongoDB Docker container started:', stdout);
                resolve();
            }
        });
    });
}

async function insertTestData() {
    try {
        await connectToDatabase();

        const testData = [
            { 
                userName: 'lina',
                pwd: await bcrypt.hash('123', 10), // Hashing password
                fullName: 'lina',
                mail: 'linlin@gmail.com',
                phone: '052',
                credits: 830,
                role: 'admin',
                cart: []
            },
            { 
                userName: 'guest',
                pwd: await bcrypt.hash('guest', 10),
                fullName: 'guest',
                mail: 'guest@gmail.com',
                phone: '053',
                credits: 200,
                role: 'Supplier',
                cart: []
            }
        ];

        // Insert test users using the Mongoose User model
        await User.insertMany(testData);
        console.log(`Inserted test users successfully.`);

        const testProducts = [];
        for (let i = 0; i < 50; i++) {
            const category = utils.randomCategory();
            const product = {
            id: i.toString(),
            description: `זה מוצר מסוג ${category}`,
            img: loadImageAsBuffer(utils.randomImage()),
            name: "מוצר" + " " + i,
            price: utils.randomBetween(250, 600),
            category: category,
            quantity: utils.randomBetween(0, 10),
            user: (await User.findOne({ userName: 'lina' }))._id
            };
            testProducts.push(product);
        }

        // Insert test products
        await Product.insertMany(testProducts);
        console.log(`Inserted test products successfully.`);

    } catch (err) {
        console.error('Error inserting test data:', err);
        stopAndRemoveContainer('gnome-bazaar-mongo');
    }
}

// Function to delay execution
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Starting the MongoDB container and setting up the app
startMongoContainer(false)
    .then(() => delay(2000))
    .then(() => insertTestData())
    .then(() => {
        app.listen(config.app.port, () => {
            console.log(`DEVELOPMENT Server running on http://localhost:${config.app.port}${config.app.baseName}`);
        });
    })
    .catch((err) => {
        console.error('Error in MongoDB setup:', err);
        stopAndRemoveContainer('gnome-bazaar-mongo');
    });
