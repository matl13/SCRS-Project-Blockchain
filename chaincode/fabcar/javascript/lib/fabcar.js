/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const cars = [
            {
                targa: 'CM234HB',
                telaio: 'X123456',
                marca: 'Fiat',
                modello: 'Croma',
                classeAmbientale: 'EURO2',
                dataImmatricolazione: '30/07/2019',
                assicurazione: {compagnia: 'unipol', scadenza: '30/07/2021'},
                kmPercorsi: 110000,
                revisione: {meccanico: 'piero', data: '30/07/2020', km: '30000', esito: 1},
                proprietario: 'Mario Rossi',
            },
        ];

        for (let i = 0; i < cars.length; i++) {
            let carStatus = cars[i].targa;
            cars[i].docType = 'car';
            await ctx.stub.putState(carStatus, Buffer.from(JSON.stringify(cars[i])));
            console.info('Added <--> ', cars[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryCar(ctx, targa) {
        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }

    async createCar(ctx, targa, telaio, marca, modello, classeAmbientale, dataImmatricolazione, proprietario) {
        console.info('============= START : Create Car ===========');

        const car = {
            targa,
            telaio,
            marca,
            modello,
            classeAmbientale,
            dataImmatricolazione,
            proprietario,
            docType: 'car',
        };

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Create Car ===========');
    }

    async queryAllCars(ctx) {
        const startKey = 'AA000AA';
        const endKey = 'ZZ999ZZ';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async changeCarOwner(ctx, targa, newOwner) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
    }

}

module.exports = FabCar;
