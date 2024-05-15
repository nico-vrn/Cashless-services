const express = require('express');
const bodyParser = require('body-parser');
const { NFC } = require('nfc-pcsc');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

let readerInstance = null;
let cardUID = null;
let cardBalance = null;

// Set up body-parser middleware
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize NFC
const nfc = new NFC();

nfc.on('reader', reader => {
    readerInstance = reader;
    console.log(`${reader.reader.name} détecté`);

    reader.on('card', async card => {
        cardUID = card.uid;
        console.log(`Carte détectée: ${card.uid}`);
        try {
            const keyType = 0x60; // A key
            const key = Buffer.from('FFFFFFFFFFFF', 'hex'); // Default key for MIFARE Classic
            const blockNumber = 8; // Bloc à lire

            await reader.authenticate(blockNumber, keyType, key);
            const data = await reader.read(blockNumber, 16, 16);
            cardBalance = data.readUInt32BE(0); // Lire le solde actuel
        } catch (err) {
            console.error('Erreur lors de la lecture de la carte:', err);
        }
    });

    reader.on('card.off', card => {
        cardUID = null;
        cardBalance = null;
        console.log(`Carte retirée: ${card.uid}`);
    });

    reader.on('error', err => {
        console.error(`Erreur du lecteur ${reader.reader.name}:`, err);
    });

    reader.on('end', () => {
        readerInstance = null;
        cardUID = null;
        cardBalance = null;
        console.log(`${reader.reader.name} déconnecté`);
    });
});

nfc.on('error', err => {
    console.error('Erreur NFC:', err);
});

// API Routes
app.get('/api/status', (req, res) => {
    res.json({
        readerConnected: !!readerInstance,
        cardPresent: !!cardUID,
        cardBalance: cardBalance
    });
});

app.post('/api/increment', async (req, res) => {
    const { amount } = req.body;
    if (!cardUID || !cardBalance) {
        return res.status(400).json({ error: 'No card present or card balance not available.' });
    }
    try {
        const keyType = 0x60;
        const key = Buffer.from('FFFFFFFFFFFF', 'hex');
        const blockNumber = 8;
        await readerInstance.authenticate(blockNumber, keyType, key);
        cardBalance += amount;
        const data = Buffer.alloc(16);
        data.writeUInt32BE(cardBalance, 0);
        await readerInstance.write(blockNumber, data, 16);
        res.json({ success: true, newBalance: cardBalance });
    } catch (err) {
        res.status(500).json({ error: 'Failed to increment balance.', details: err.message });
    }
});

app.post('/api/decrement', async (req, res) => {
    const { amount } = req.body;
    if (!cardUID || !cardBalance) {
        return res.status(400).json({ error: 'No card present or card balance not available.' });
    }
    try {
        if (cardBalance < amount) {
            return res.status(400).json({ error: 'Insufficient balance.' });
        }
        const keyType = 0x60;
        const key = Buffer.from('FFFFFFFFFFFF', 'hex');
        const blockNumber = 8;
        await readerInstance.authenticate(blockNumber, keyType, key);
        cardBalance -= amount;
        const data = Buffer.alloc(16);
        data.writeUInt32BE(cardBalance, 0);
        await readerInstance.write(blockNumber, data, 16);
        res.json({ success: true, newBalance: cardBalance });
    } catch (err) {
        res.status(500).json({ error: 'Failed to decrement balance.', details: err.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
