const { NFC } = require('nfc-pcsc');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const nfc = new NFC();
const keysFile = path.join(__dirname, 'keys.json');

// Function to save or update key in JSON file
const saveKeyToFile = (uid, key) => {
    let keysData = {};
    if (fs.existsSync(keysFile)) {
        keysData = JSON.parse(fs.readFileSync(keysFile));
    }
    keysData[uid] = key;
    fs.writeFileSync(keysFile, JSON.stringify(keysData, null, 2));
};

nfc.on('reader', reader => {
    console.log(`${reader.reader.name} detected`);

    reader.on('card', async card => {
        try {
            const keyType = 0x60; // A key
            const defaultKey = Buffer.from('FFFFFFFFFFFF', 'hex'); // Default key for MIFARE Classic
            const blockNumber = 8; // Block to write
            const initialBalance = 1000; // Initial balance
            const data = Buffer.alloc(16);
            data.writeUInt32BE(initialBalance, 0);

            await reader.authenticate(blockNumber, keyType, defaultKey); // Authenticate using the default key
            await reader.write(blockNumber, data, 16); // Write balance

            const newKey = crypto.randomBytes(6).toString('hex'); // Generate a random key
            const keyBuffer = Buffer.alloc(16);
            keyBuffer.write(newKey, 0, 'hex'); // Fill the buffer with the new key

            await reader.authenticate(9, keyType, defaultKey); // Re-authenticate using the default key
            await reader.write(9, keyBuffer, 16); // Write new key to sector trailer

            saveKeyToFile(card.uid, newKey); // Save the new key

            console.log(`New key saved locally for card ${card.uid}`);
            console.log(`Balance initialized to ${initialBalance}`);

            process.exit(0); // Exit successfully
        } catch (err) {
            console.error(`Error initializing the card:`, err);
            process.exit(1); // Exit with error
        }
    });

    reader.on('error', err => {
        console.error(`Error with reader ${reader.reader.name}:`, err);
    });

    reader.on('end', () => {
        console.log(`${reader.reader.name} disconnected`);
    });
});

nfc.on('error', err => {
    console.error('NFC error:', err);
});
