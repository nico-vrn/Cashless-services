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
    console.log(`${reader.reader.name} détecté`);

    reader.on('card', async card => {
        try {
            const keyType = 0x60; // A key
            const defaultKey = Buffer.from('FFFFFFFFFFFF', 'hex'); // Default key for MIFARE Classic
            const blockNumber = 8; // Bloc à écrire
            const initialBalance = 1000; // Solde initial
            const data = Buffer.alloc(16);
            data.writeUInt32BE(initialBalance, 0);

            console.log(`Tentative d'authentification pour le bloc ${blockNumber}...`);
            await reader.authenticate(blockNumber, keyType, defaultKey);
            console.log(`Authentification réussie`);

            console.log(`Tentative d'écriture du solde initial sur le bloc ${blockNumber}...`);
            await reader.write(blockNumber, data, 16);
            console.log(`Carte initialisée avec un solde de ${initialBalance}`);

            // Générer une clé aléatoire
            const newKey = crypto.randomBytes(6).toString('hex'); // Générer une clé aléatoire
            const newKeyBuffer = Buffer.alloc(16); // Créer un tampon de 16 octets
            newKeyBuffer.write(newKey, 0, 'hex'); // Écrire la clé au début du tampon

            console.log(`Tentative d'écriture de la nouvelle clé sur le bloc 9...`);
            await reader.authenticate(9, keyType, defaultKey);
            await reader.write(9, newKeyBuffer, 16);
            console.log(`Nouvelle clé sécurisée écrite sur la carte`);

            // Remplacer les clés par défaut par la nouvelle clé pour tous les secteurs
            console.log(`Remplacement de la clé par défaut par la nouvelle clé...`);
            for (let sector = 0; sector < 16; sector++) {
                const block = sector * 4; // First block of each sector
                await reader.authenticate(block, keyType, defaultKey);
                await reader.write(block + 3, newKeyBuffer, 16); // Write new key to sector trailer
            }

            saveKeyToFile(card.uid, newKey);
            console.log(`Nouvelle clé sauvegardée localement pour la carte ${card.uid}`);

            process.exit(0); // Terminer le programme
        } catch (err) {
            console.error(`Erreur lors de l'initialisation de la carte:`, err);
            process.exit(1); // Terminer le programme avec une erreur
        }
    });

    reader.on('error', err => {
        console.error(`Erreur du lecteur ${reader.reader.name} :`, err);
    });

    reader.on('end', () => {
        console.log(`${reader.reader.name} déconnecté`);
    });
});

nfc.on('error', err => {
    console.error('Erreur NFC :', err);
});
