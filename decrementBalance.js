const { NFC } = require('nfc-pcsc');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const nfc = new NFC();

nfc.on('reader', reader => {
    console.log(`${reader.reader.name} détecté`);

    reader.on('card', async card => {
        rl.question('De combien voulez-vous décrémenter le solde ? ', async (amount) => {
            try {
                const decrementAmount = parseInt(amount, 10);
                if (isNaN(decrementAmount)) {
                    throw new Error('Veuillez entrer un nombre valide.');
                }

                const keyType = 0x60; // A key
                const key = Buffer.from('FFFFFFFFFFFF', 'hex'); // Default key for MIFARE Classic
                const blockNumber = 8; // Bloc à lire et écrire

                console.log(`Tentative d'authentification pour le bloc ${blockNumber}...`);
                await reader.authenticate(blockNumber, keyType, key);
                console.log(`Authentification réussie`);

                // Lire le solde actuel
                const data = await reader.read(blockNumber, 16, 16); // Lire 16 octets à partir du bloc 8
                let balance = data.readUInt32BE(0); // Lire le solde actuel

                // Vérifier si la décrémentation est possible
                if (balance < decrementAmount) {
                    throw new Error('Solde insuffisant.');
                }

                // Décrémenter le solde
                balance -= decrementAmount;
                data.writeUInt32BE(balance, 0);

                console.log(`Tentative d'écriture du nouveau solde...`);
                // Écrire le nouveau solde sur la carte
                await reader.write(blockNumber, data, 16); // Écrire 16 octets à partir du bloc 8
                console.log(`Nouveau solde: ${balance}`);

                rl.close();
                process.exit(0); // Terminer le programme
            } catch (err) {
                console.error(`Erreur lors de la décrémentation du solde:`, err);
                rl.close();
                process.exit(1); // Terminer le programme avec une erreur
            }
        });
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
