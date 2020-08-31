/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

/*

    FORMATO DATA = anno-mese-giorno

*/

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const cars = [
            {
                targa: 'DB706JE',
                attiva: '1',
                telaio: 'A0001',
                marca: 'FIAT',
                modello: 'PUNTO',
                classeAmbientale: 'EURO5',
                dataImmatricolazione: '2006-03-10',
                assicurazione: {compagnia: 'UNIPOL', scadenza: '2020-09-10'},
                kmPercorsi: 1000,
                revisione: {meccanico: 'DANIELE MARIANI', data: '2010-03-10', km: '1000', esito: '1'},
                proprietario: 'MONICA FERRANTE',
            },
            {
                targa: 'CE073RR',
                attiva: '1',
                telaio: 'A0002',
                marca: 'VOLKSWAGEN',
                modello: 'POLO',
                classeAmbientale: 'EURO4',
                dataImmatricolazione: '2002-12-10',
                assicurazione: {compagnia: 'SEGUGIO', scadenza: '2020-12-10'},
                kmPercorsi: 1000,
                revisione: {meccanico: 'DANIELE', data: '2006-12-10', km: '1000', esito: '1'},
                proprietario: 'MANUEL GALLUCCI',
            },
        ];

        for (let i = 0; i < cars.length; i++) {
            let carStatus = cars[i].targa;
            await ctx.stub.putState(carStatus, Buffer.from(JSON.stringify(cars[i])));
            console.info('Added <--> ', cars[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async cercaAuto(ctx, targa) {
        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} non esiste`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }

    async creaAuto(ctx, targa, telaio, marca, modello, classeAmbientale, dataImmatricolazione, kmPercorsi, proprietario) {
        console.info('============= START : Crea Auto ===========');
        const carAsBytes = await ctx.stub.getState(targa);          // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {               // controlliamo che non esista già un auto con quella targa
            const car = {
                targa,
                attiva: '1',
                telaio,
                marca,
                modello,
                classeAmbientale,
                dataImmatricolazione,
                kmPercorsi,
                proprietario,
            };
            await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
            console.info('============= END : Crea Auto ===========');
        }else{
            throw new Error(`${targa} gia esiste`);
        }
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

    async cambiaProprietario(ctx, targa, nuovo_proprietario) {
        console.info('============= START : Cambia Proprietario ===========');

        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} non esiste`);
        }
        const car = JSON.parse(carAsBytes.toString());
        
        if (car.attiva == '0') {
            throw new Error(`Vietato modificare il proprietario di una targa inattiva`);
        }
        car.proprietario = nuovo_proprietario;

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Cambia Proprietario ===========');
    }

    async distruggiAuto(ctx, targa) {
        console.info('============= START : Distruggi Auto ===========');

        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} non esiste`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.attiva = '0';

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Distruggi Auto ===========');
    }

    async rinnovaAssicurazione(ctx, targa, compagnia, scadenza) {
        console.info('============= START : Rinnova Assicurazione ===========');

        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} non esiste`);
        }
        
        const car = JSON.parse(carAsBytes.toString());

        if (car.attiva == '0') {
            throw new Error(`Vietato rinnovare l'assicurazione di una targa inattiva`);
        }

        car.assicurazione = {compagnia, scadenza};

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Rinnova Assicurazione ===========');
    }

    async aggiungiRevisione(ctx, targa, meccanico, data, km, esito) {
        console.info('============= START : Aggiungi Revisione ===========');

        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} non esiste`);
        }
        const car = JSON.parse(carAsBytes.toString());

        if (car.attiva == '0') {
            throw new Error(`Vietato aggiornare la revisione di una targa inattiva`);
        }

        car.revisione = {meccanico, data, km, esito};
        //car.kmPercorsi = parseInt(car.kmPercorsi, 10) + parseInt(km, 10);
        car.kmPercorsi = parseInt(km, 10);

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Aggiungi Revisione ===========');
    }

    async aggiungiInterventoTecnico(ctx, targa, meccanico, data, km, descrizione) {
        console.info('============= START : Aggiungi Intervento Tecnico ===========');

        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} non esiste`);
        }
        const car = JSON.parse(carAsBytes.toString());

        if (car.attiva == '0') {
            throw new Error(`Vietato aggiungere l'intervento tecnico di una targa inattiva`);
        }

        //car.interventi_tecnici.push({meccanico, data, km, descrizione});
        car.ultimo_intervento_tecnico = {meccanico, data, km, descrizione};
        car.kmPercorsi = parseInt(km, 10);

        await ctx.stub.putState(targa, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Aggiungi Intervento Tecnico ===========');
    }

    async verificaAssicurazione(ctx, targa) {
        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} non esiste`);
        }

        const car = JSON.parse(carAsBytes.toString());

        if (car.attiva == '0') {
            return "Targa inattiva"
        }

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
            throw new Error(`${targa} non esiste`);
        }
        const car = JSON.parse(carAsBytes.toString());

        if (car.attiva == '0') {
            return "Targa inattiva"
        }
        
        const dataRevisione = new Date(car.revisione.data); 
        //var scad = new Date(car.revisione.data);
        //scadenzaRevisione.setFullYear(scadenzaRevisione.getFullYear() + 2); // la revisione vale 2 anni


        var year = dataRevisione.getFullYear();
        var month = dataRevisione.getMonth();
        var day = dataRevisione.getDate();
        var scadenzaRevisione = new Date(year + 2, month, day);

        var adesso = new Date();

        if ((scadenzaRevisione >= adesso) && car.revisione.esito == "1")  {
            return "Revisione Valida: km registrati " + car.kmPercorsi;
        }else{
            return "Revisione Non Valida";
        }
    }

    async verificaClasseAmbientale(ctx, targa) {
        const carAsBytes = await ctx.stub.getState(targa); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${targa} non esiste`);
        }
        const car = JSON.parse(carAsBytes.toString());
        if (car.attiva == '0') {
            return "Targa inattiva"
        }
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
                        "dataImmatricolazione" :  {
                                "$gte" : "${anno}-${mese}-01",
                                "$lte" : "${anno}-${mese}-31"
                            }  
                    } 
              }`

        let iterator = await ctx.stub.getQueryResult(query);
        
        let result = [];
        let numero = 0;
        let res = await iterator.next();
        while (!res.done) {
          if (res.value) {
            console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
            const obj = JSON.parse(res.value.value.toString('utf8'));
            result.push(obj);
            numero = numero + 1;
          }
          res = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(numero);
    }      

}

module.exports = FabCar;
