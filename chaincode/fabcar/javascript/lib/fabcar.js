/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

/*

    FORMATO DATA = mese-giorno-anno

*/

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
                dataImmatricolazione: '07-30-2019',
                assicurazione: {compagnia: 'unipol', scadenza: '07-30-2021'},
                kmPercorsi: 110000,
                revisione: {meccanico: 'piero', data: '07-30-2020', km: '30000', esito: 1},
                proprietario: 'Mario Rossi',
            },
            {
                targa: 'CE073RR',
                telaio: 'Y674679',
                marca: 'Volkswagen',
                modello: 'Polo',
                classeAmbientale: 'EURO4',
                dataImmatricolazione: '12-22-2003',
                assicurazione: {compagnia: 'unipol', scadenza: '11-18-2020'},
                kmPercorsi: 130000,
                revisione: {meccanico: 'daniele', data: '04-30-2019', km: '95000', esito: 1},
                proprietario: 'Manuel Gallucci',
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

    async cambiaTarga(ctx, targa, newPlate) {
        console.info('============= START : Cambia Targa ===========');

        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.targa = newPlate;

        await ctx.stub.putState(newPlate, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Cambia Targa ===========');
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
        car.revisione = {meccanico, data, km, esito};
        car.kmPercorsi = parseInt(car.kmPercorsi, 10) + parseInt(km, 10);

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Aggiungi Revisione ===========');
    }

    async verificaAssicurazione(ctx, targa) {
        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());

        var adesso = new Date();
        var scadenzaAss = new Date(car.assicurazione.scadenza);
        
        if (scadenzaAss >= adesso) {
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
        
        const dataRevisione = new Date(car.revisione.data);
        var year = dataRevisione.getFullYear();
        var month = dataRevisione.getMonth();
        var day = dataRevisione.getDate();
        var scadenzaRevisione = new Date(year + 2, month, day);    // la revisione vale 2 anni

        var adesso = new Date();

        if ((scadenzaRevisione >= adesso) && car.revisione.esito == "1")  {
            return "Revisione Valida";
        }else{
            return "Revisione Non Valida";
        }
    }

    async verificaClasseAmbientale(ctx, targa) {
        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        
        return car.classeAmbientale;
    }

    async queryValueHistory(ctx,targa){
      
        let iterator = await ctx.stub.getHistoryForKey(targa);
      
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
          if (res.value) {
            console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
            const obj = JSON.parse(res.value.value.toString('utf8'));
            result.push(obj);
          }
          res = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(result);
    }

    async queryImmatricolazioni(ctx, mese, anno) {

        var query = `{"selector": { 
                                "dataImmatricolazione" :  {"$gte" : "${mese}-00-${anno}"}, 
                                "dataImmatricolazione" :  {"$lte" : "${mese}-32-${anno}"}  
                            } 
                      }`
        
        //query = query.replace('{month}', mese);
        //query = query.replace('{year}', anno);

        let iterator = await ctx.stub.getQueryResult(query);
        
        let result = [];
        let numero = 0;
        let res = await iterator.next();
        while (!res.done) {
          if (res.value) {
            console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
            //const obj = JSON.parse(res.value.value.toString('utf8'));
            //result.push(obj);
            numero = numero + 1;
          }
          res = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(numero);
    }      

}

module.exports = FabCar;
