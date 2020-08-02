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
                dataImmatricolazione: '30-07-2019',
                assicurazione: {compagnia: 'unipol', scadenza: '30-07-2021'},
                kmPercorsi: 110000,
                revisione: {meccanico: 'piero', data: '30-07-2020', km: '30000', esito: 1},
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

    async cercaAuto(ctx, targa) {
        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
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

    async creaAuto(ctx, targa, telaio, marca, modello, classeAmbientale, dataImmatricolazione, kmPercorsi, proprietario) {
        console.info('============= START : Crea Auto ===========');

        const car = {
            targa,
            telaio,
            marca,
            modello,
            classeAmbientale,
            dataImmatricolazione,
            kmPercorsi,
            proprietario,
            docType: 'car',
        };

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Crea Auto ===========');
    }

    async mostraTutte(ctx) {
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

    async cambiaProprietario(ctx, targa, newOwner) {
        console.info('============= START : Cambia Proprietario ===========');

        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.proprietario = newOwner;

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Cambia Proprietario ===========');
    }

    async rinnovaAssicurazione(ctx, targa, compagnia, scadenza) {
        console.info('============= START : Rinnova Assicurazione ===========');

        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.assicurazione = {compagnia, scadenza};

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Rinnova Assicurazione ===========');
    }

    async aggiungiRevisione(ctx, targa, meccanico, data, km, esito) {
        console.info('============= START : Aggiungi Revisione ===========');

        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.assicurazione = {meccanico, data, km, esito};
        car.kmPercorsi = car.kmPercorsi + km;

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Aggiungi Revisione ===========');
    }

    async verificaAssicurazione(ctx, targa) {
        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        
        if (Date(car.assicurazione.scadenza) >= Date()) {
            return "Veicolo Assicurato";
        }
            return "Veicolo Non Assicurato";
    }

    async verificaRevisione(ctx, targa) {
        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        
        const scadenzaRevisione = Date(car.revisione.data); 
        scadenzaRevisione.setFullYear(scadenzaRevisione.getFullYear() + 2); // la revisione vale 2 anni

        if ((scadenzaRevisione >= Date()) && car.revisione.esito == 1)  {
            return "Revisione Valida";
        }
            return "Revisione Non Valida";
    }

    async verificaClasseAmbientale(ctx, targa) {
        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        
        return car.classeAmbientale;
    }

}

module.exports = FabCar;
