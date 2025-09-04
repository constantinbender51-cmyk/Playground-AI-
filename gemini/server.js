const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the static HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'gemini_web_interface.html'));
});

// API endpoint to proxy requests to the Gemini API
app.post('/api/gemini-proxy', async (req, res) => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not found. Please set it as an environment variable in Railway.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

    try {
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body), // Pass the user's prompt directly to the Gemini API
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            return res.status(geminiResponse.status).json(errorData);
        }

        const data = await geminiResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Error proxying to Gemini API:', error);
        res.status(500).json({ error: 'Failed to connect to the Gemini API.' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
