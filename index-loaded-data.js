const app = require('./src/app');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const bcrypt = require('bcrypt');
const config = require('./config');
const { connectToDatabase } = require('./src/models/database');
const User = require('./src/models/User');  // Import the User model
const Product = require('./src/models/Product');  // Import the Product model
const utils = require('./testDataUtils');
const Purchase = require('./src/models/Purchase');  // Import the Product model


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
                phone: '0585529305',
                credits: 830,
                role: 'Admin',
                address: {
                    type: 'Point',
                    coordinates: [34.781768, 32.085300] // Tel Aviv
                },
                cart: []
            },
            {
                userName: 'liav',
                pwd: await bcrypt.hash('111', 10), // Hashing password
                fullName: 'liav',
                mail: 'liav@gmail.com',
                phone: '0525992484',
                credits: 830,
                role: 'Admin',
                address: {
                    type: 'Point',
                    coordinates: [34.851612, 32.109333] // Herzliya
                },
                cart: []
            },
            {
                userName: 'elad',
                pwd: await bcrypt.hash('222', 10), // Hashing password
                fullName: 'elad',
                mail: 'elad@gmail.com',
                phone: '0547137713',
                credits: 330,
                role: 'User',
                address: {
                    type: 'Point',
                    coordinates: [34.823456, 32.083333] // Ramat Gan
                },
                cart: []
            },
            {
                userName: 'shir',
                pwd: await bcrypt.hash('333', 10), // Hashing password
                fullName: 'shir',
                mail: 'shir@gmail.com',
                phone: '0503403413',
                credits: 500,
                role: 'User',
                address: {
                    type: 'Point',
                    coordinates: [34.811272, 32.085300] // Givatayim
                },
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
                address: {
                    type: 'Point',
                    coordinates: [34.780527, 32.066158] // Bat Yam
                },
                cart: []
            }
        ];

        // Insert test users using the Mongoose User model
        await User.insertMany(testData);
        console.log(`Inserted test users successfully.`);

        const testProducts = [];
        for (let i = 0; i < 30; i++) {
            const category = utils.randomCategory();
            const product = {
            id: i.toString(), 
            description: `זה מוצר מסוג ${category}`,
            img: loadImageAsBuffer(utils.randomImage(category)),
            name: "מוצר" + " " + i,
            price: utils.randomBetween(20, 100),
            category: category,
            quantity: utils.randomBetween(1, 10),
            user: (await User.findOne({ userName: 'lina' }))._id
            };
            testProducts.push(product);
        }

        // Insert test products
        await Product.insertMany(testProducts);
        console.log(`Inserted test products successfully.`);

        // Get a user and a few products to create purchases
        const user = await User.findOne({ userName: 'guest' });
        const products = await Product.find().limit(5);

        const testPurchases = [
            {
                user: user._id,
                products: [
                    { product: products[0]._id, quantity: 2, price: products[0].price },
                    { product: products[1]._id, quantity: 1, price: products[1].price }
                ],
                purchaseDate: new Date(2024, 6, 15),  
                totalCost: (products[0].price * 2) + (products[1].price * 1)
            },
            {
                user: user._id,
                products: [
                    { product: products[0]._id, quantity: 3, price: products[0].price },
                    { product: products[1]._id, quantity: 2, price: products[1].price }
                ],
                purchaseDate: new Date(2024, 7, 20),  
                totalCost: (products[2].price * 3) + (products[3].price * 2)
            },
            {
                user: user._id,
                products: [
                    { product: products[2]._id, quantity: 0, price: products[2].price },
                    { product: products[3]._id, quantity: 1, price: products[3].price }
                ],
                purchaseDate: new Date(2024, 8, 20),  
                totalCost: (products[2].price * 0) + (products[3].price * 1)
            }
        ];

        // Insert the test purchases
        await Purchase.insertMany(testPurchases);
        console.log(`Inserted test purchases successfully.`);

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
