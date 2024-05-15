const { NFC } = require('nfc-pcsc');
const crypto = require('crypto');
const fs = require('fs');

const nfc = new NFC();

const saveKeyToFile = (uid, key) => {
    const keysFile = 'keys.json';
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
            const initialKey = Buffer.from('FFFFFFFFFFFF', 'hex'); // Default key for MIFARE Classic
            const blockNumber = 8; // Bloc à écrire
            const initialBalance = 1000; // Solde initial
            const data = Buffer.alloc(16);
            data.writeUInt32BE(initialBalance, 0);

            console.log(`Tentative d'authentification pour le bloc ${blockNumber}...`);
            await reader.authenticate(blockNumber, keyType, initialKey);
            console.log(`Authentification réussie`);

            console.log(`Tentative d'écriture du solde initial sur le bloc ${blockNumber}...`);
            await reader.write(blockNumber, data, 16);
            console.log(`Carte initialisée avec un solde de ${initialBalance}`);

            const key = crypto.randomBytes(6).toString('hex'); // Générer une clé aléatoire
            const keyBuffer = Buffer.alloc(16); // Créer un tampon de 16 octets
            keyBuffer.write(key, 0, 'hex'); // Écrire la clé au début du tampon

            console.log(`Tentative d'écriture de la clé sur le bloc 9...`);
            await reader.authenticate(9, keyType, initialKey);
            await reader.write(9, keyBuffer, 16);
            console.log(`Clé sécurisée écrite sur la carte`);

            saveKeyToFile(card.uid, key);
            console.log(`Clé sauvegardée localement pour la carte ${card.uid}`);

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
