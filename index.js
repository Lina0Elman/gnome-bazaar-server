const app = require('./src/app');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const { getMongoClient } = require('./src/models/mongo');



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
                }
            });
        }
    });
}

//todo fix - if deleting docker image so start again
// Start MongoDB Docker container
exec('docker run -d -p 27017:27017 --name gnome-bazaar-mongo mongo:latest', (err, stdout, stderr) => {
    if (err) {
        console.error('Error starting MongoDB Docker container:', err);
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
        }

        insertTestData();
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});