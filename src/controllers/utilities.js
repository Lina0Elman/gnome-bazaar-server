const axios = require('axios');
const config = require("../../config");

exports.getAddress = async (req, res) => {
    const { address: q } = req.query;
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q,
                format: 'json',
                addressdetails: 1,
                limit: 5,
                dedupe: 1
            },
            headers: {
                'User-Agent': 'MyTestProjectStudyApp/1.0 (projextStudyMail@gmai..com)',
                'Accept-Language': 'he'
            }
        });

        if (response.data && response.data.length > 0) {
            const addresses = response.data.map((address) => ({
                display_name: address.display_name,
                latitude: parseFloat(address.lat),
                longitude: parseFloat(address.lon)
            }));
            res.status(200).json(addresses);
        } else {
            res.status(204).json([]);
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getWeather = async (req, res) => {
    try {
        const weatherKey = config.weatherApiKey;
        const response = await fetch(
            `http://api.weatherapi.com/v1/current.json?key=${weatherKey}&q=israel&aqi=yes`
        );
        const data = await response.json();
        const temp_c = data?.current?.temp_c || "לא זמין כרגע...";
        res.json(temp_c);
    } catch {
        res.status(500).json("לא זמין כרגע...");
    }
}