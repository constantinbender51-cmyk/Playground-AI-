const express = require('express');
const { KrakenFuturesApi } = require('./krakenApi');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize API client
const api = new KrakenFuturesApi(
    process.env.KRAKEN_API_KEY,
    process.env.KRAKEN_API_SECRET
);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Kraken Futures API wrapper is running' });
});

// Send order endpoint
app.post('/order', async (req, res) => {
    try {
        const orderParams = req.body;
        
        // Basic validation
        if (!orderParams.symbol || !orderParams.side || !orderParams.size) {
            return res.status(400).json({ error: 'Missing required parameters: symbol, side, size' });
        }

        const orderResult = await api.sendOrder(orderParams);
        res.json(orderResult);
    } catch (error) {
        console.error('Order error:', error);
        res.status(500).json({ error: error.message || 'Failed to place order' });
    }
});

// Get account info endpoint
app.get('/account', async (req, res) => {
    try {
        const accounts = await api.getAccounts();
        res.json(accounts);
    } catch (error) {
        console.error('Account error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch account info' });
    }
});

// Get tickers endpoint
app.get('/tickers', async (req, res) => {
    try {
        const tickers = await api.getTickers();
        res.json(tickers);
    } catch (error) {
        console.error('Tickers error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch tickers' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
