const { NFC } = require('nfc-pcsc');

const nfc = new NFC();

nfc.on('reader', reader => {
    console.log(`${reader.reader.name} détecté`);

    reader.on('card', async card => {
        try {
            const keyType = 0x60; // A key
            const key = Buffer.from('FFFFFFFFFFFF', 'hex'); // Default key for MIFARE Classic
            const blockNumber = 8; // Bloc à lire

            console.log(`Tentative d'authentification pour le bloc ${blockNumber}...`);
            await reader.authenticate(blockNumber, keyType, key);
            console.log(`Authentification réussie`);

            // Lire les données à partir du bloc 8
            const data = await reader.read(blockNumber, 16, 16); // Lire 16 octets à partir du bloc 8
            const balance = data.readUInt32BE(0); // Lire le solde
            console.log(`Solde actuel: ${balance}`);
        
            process.exit(0); // Terminer le programme
        } catch (err) {
            console.error(`Erreur lors de la lecture du solde:`, err);
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