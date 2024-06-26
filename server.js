const express = require('express');
const bodyParser = require('body-parser');
const { NFC } = require('nfc-pcsc');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

let readerInstance = null;
let cardUID = null;
let cardBalance = null;

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Servir les fichiers statiques depuis le répertoire "public"
app.use(express.static(path.join(__dirname, 'public')));

// Initialiser NFC
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

// Routes de l'API
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
        return res.status(400).json({ error: 'Pas de carte présente ou balance invalide.' });
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
        res.status(500).json({ error: 'Impossible d\'incrémenter le solde.', details: err.message });
    }
});

app.post('/api/decrement', async (req, res) => {
    const { amount } = req.body;
    if (!cardUID || !cardBalance) {
        return res.status(400).json({ error: 'Pas de carte présente ou balance invalide.' });
    }
    try {
        if (cardBalance < amount) {
            return res.status(400).json({ error: 'Solde insuffisant' });
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
        res.status(500).json({ error: 'Erreur dans la décrémentation.', details: err.message });
    }
});

app.post('/api/initCard', (req, res) => {
    exec('node initCard.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: stderr });
        }
        res.json({ success: true, newBalance: 1000 });
    });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});