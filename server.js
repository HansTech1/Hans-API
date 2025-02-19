const express = require('express');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3000;
const IMAGE_FOLDER = path.join(__dirname, 'images'); // Change 'images' to your folder name
const urlMap = new Map();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/anime/random', async (req, res) => {
    try {
        const localFiles = fs.readdirSync(IMAGE_FOLDER);
        let imageUrl;

        if (localFiles.length > 0 && Math.random() > 0.5) {
            // Serve a local image 50% of the time
            const randomImage = localFiles[Math.floor(Math.random() * localFiles.length)];
            imageUrl = `${req.protocol}://${req.get('host')}/images/${randomImage}`;
        } else {
            // Fetch an image from the external API
            const response = await axios.get('https://api.davidcyriltech.my.id/googleimage?query=anime');
            if (response.data && response.data.results && response.data.results.length > 0) {
                imageUrl = response.data.results[0]; // Assuming you want the first image from the results
            } else {
                return res.status(500).json({ error: 'Failed to fetch external anime images' });
            }
        }

        // Shorten the image URL
        const shortCode = shortid.generate();
        urlMap.set(shortCode, imageUrl);
        const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`;

        res.json({
            status: 200,
            image: shortUrl,
            server: 'Anime Pics API v1.0',
            creator: 'Mr. Hans'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error processing request' });
    }
});

app.get('/s/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;
    const originalUrl = urlMap.get(shortCode);
    if (originalUrl) {
        res.redirect(originalUrl);
    } else {
        res.status(404).json({ error: 'Short URL not found' });
    }
});

app.post('/api/shorten', (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    const shortCode = shortid.generate();
    urlMap.set(shortCode, url);
    const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`;

    res.json({
        status: 200,
        original_url: url,
        short_url: shortUrl,
        server: 'Hans Pics API v1.1',
        creator: 'Mr. Hans'
    });
});

app.get('/api/shorten', (req, res) => {
    const originalUrl = req.query.url;
    if (!originalUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }
    const shortCode = shortid.generate();
    urlMap.set(shortCode, originalUrl);
    const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`;

    res.json({
        status: 200,
        original_url: originalUrl,
        short_url: shortUrl,
        server: 'Anime Pics API v1.0',
        creator: 'Mr. Hans'
    });
});

// Serve static images
app.use('/images', express.static(IMAGE_FOLDER));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
                    
