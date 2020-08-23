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
const ccpPath = path.resolve(__dirname, '..', '..', 'scrs-network', 'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

/*
*************************
Elenco API Motorizzazione
*************************

- creaAuto
- cambiaProprietario
- cambioTarga #TODO
- distruggiVeicolo #TODO

*/

app.post('/api/addcar/', async function (req, res) {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUserOrg1');
        if (!identity) {
            console.log('An identity for the user "appUserOrg1" does not exist in the wallet');
            console.log('Run the registerUserOrg1.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUserOrg1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        //creaAuto(ctx, targa, telaio, marca, modello, classeAmbientale, dataImmatricolazione, kmPercorsi, proprietario)
        await contract.submitTransaction('creaAuto', req.body.targa, req.body.telaio, req.body.marca, req.body.modello, req.body.classeAmbientale, req.body.dataImmatricolazione, req.body.kmPercorsi, req.body.proprietario);
        console.log(`Transaction has been evaluated`);
        res.status(200).json({response: "Auto Creata"});

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
})


app.post('/api/changeowner/:car_index', async function (req, res) {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUserOrg1');
        if (!identity) {
            console.log('An identity for the user "appUserOrg1" does not exist in the wallet');
            console.log('Run the registerUserOrg1.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUserOrg1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        await contract.submitTransaction('cambiaProprietario', req.params.car_index, req.body.owner);
        console.log('Transaction has been submitted');
        res.status(200).json({response: "Proprietario Aggiornato"});

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
    	
})


app.listen(8081);
