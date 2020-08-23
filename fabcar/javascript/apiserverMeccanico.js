var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Setting for Hyperledger Fabric
//const { FileSystemWallet, Gateway } = require('fabric-network');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
//const ccpPath = path.resolve(__dirname, '.',  'connection-org1.json');
//const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const ccpPath = path.resolve(__dirname, '..', '..', 'scrs-network', 'connection-org3.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

/*
********************
Elenco API Meccanico
********************

- aggiungiRevisione
- inserimentoInterventoTecnico #TODO

*/


app.post('/api/aggiungirevisione/:car_index', async function (req, res) {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        await contract.submitTransaction('aggiungiRevisione', req.params.car_index, req.body.meccanico, req.body.data, req.body.km, req.body.esito);
        console.log('Transaction has been submitted');
        res.status(200).json({response: "Revisione Aggiunta"});

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
    	
})

app.listen(8083);
