const app = require('./src/app');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const { getMongoClient } = require('./src/models/mongo');
const config = require('./config')



// Initialize environment variables
dotenv.config();


// Function to stop and remove Docker container
function stopAndRemoveContainer(containerName) {
    exec(`docker stop ${containerName}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error stopping container ${containerName}:`, err);
        } else {
            exec(`docker rm ${containerName}`, (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error removing container ${containerName}:`, err);
                } else {
                    console.log(`Successfully removed container ${containerName}`);
                    startMongoContainer(true);
                }
            });
        }
    });
}


function startMongoContainer(alreadyTried) {
    exec('docker run -d -p 27017:27017 --name gnome-bazaar-mongo mongo:latest', (err, stdout, stderr) => {
        if (err) {
            console.error('Error starting MongoDB Docker container:', err);
            if (alreadyTried) return; // if failed in second try - don't try again.
            stopAndRemoveContainer('gnome-bazaar-mongo');
            return;
        } else {
            console.log('MongoDB Docker container started:', stdout);
    
            async function insertTestData() {
                try {
                    const mongo = await getMongoClient('gnomeBazaar');
                    const collection = mongo.collection('testData');
    
                    const testData = [
                        { name: 'Test Item 1', value: 100 },
                        { name: 'Test Item 2', value: 200 },
                    ];
    
                    const result = await collection.insertMany(testData);
                    console.log(`Inserted ${result.insertedCount} test documents into the collection.`);
                } catch (err) {
                    console.error('Error inserting test data:', err);
                    stopAndRemoveContainer('gnome-bazaar-mongo');
                }}
    
                insertTestData();
            }
    
        }
    );    
}

startMongoContainer(false);

// Start the server
app.listen(config.app.port, () => {
    console.log(`DEVELOPMENT Server running on http://localhost:${config.app.port}${config.app.baseName}`);
});