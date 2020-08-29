/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'scrs-network', 'connection-org3.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'))

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org3.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get('appUserOrg3');
        if (userIdentity) {
            console.log('An identity for the user "appUserOrg3" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('adminOrg3');
        if (!adminIdentity) {
            console.log('An identity for the admin user "adminOrg3" does not exist in the wallet');
            console.log('Run the enrollAdminOrg3.js application before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'adminOrg3');


        // Register the user, enroll the user, and import the new identity into the wallet.
        const affiliationService = ca.newAffiliationService();
        await affiliationService.create({name: 'org3.department1', force: true}, adminUser);

        const secret = await ca.register({ affiliation: 'org3.department1', enrollmentID: 'appUser', role: 'client' }, adminUser);

        const enrollment = await ca.enroll({ enrollmentID: 'appUser', enrollmentSecret: secret });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org3MSP',
            type: 'X.509',
        };
        await wallet.put('appUserOrg3', x509Identity);
        console.log('Successfully registered and enrolled admin user "appUserOrg3" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "appUserOrg3": ${error}`);
        process.exit(1);
    }
}

main();