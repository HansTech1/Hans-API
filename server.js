const express = require('express');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const bodyParser = require('body-parser');

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

app.get('/api/anime/random', (req, res) => {
    fs.readdir(IMAGE_FOLDER, (err, files) => {
        if (err) {
            return res.status(500).json({ 
                status: 500,
                error: 'Error reading image folder',
                server: 'Anime Pics API v1.0',
                creator: 'Mr. Hans'
            });
        }
        if (files.length === 0) {
            return res.status(404).json({ 
                status: 404,
                error: 'No images found',
                server: 'Anime Pics API v1.0',
                creator: 'Mr. Hans'
            });
        }

        const randomImage = files[Math.floor(Math.random() * files.length)];
        const imageUrl = `${req.protocol}://${req.get('host')}/images/${randomImage}`;
        res.json({ 
            status: 200,
            image: imageUrl,
            server: 'Anime Pics API v1.0',
            creator: 'Mr. Hans'
        });
    });
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
        server: 'Anime Pics API v1.0',
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
