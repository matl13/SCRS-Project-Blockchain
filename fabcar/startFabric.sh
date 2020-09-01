#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# clean out any old identites in the wallets
rm -rf javascript/wallet/*
rm -rf java/wallet/*
rm -rf typescript/wallet/*
rm -rf wallet/*

# launch network; create channel and join peer to channel
pushd ../scrs-network
#./network.sh down
#./network.sh up createChannel -ca -s couchdb
#./network.sh deployCC -l ${CC_SRC_LANGUAGE}
./byfn.sh up -l javascript -s couchdb
#./byfn.sh up -l ${CC_SRC_LANGUAGE}
popd

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

Rete avviata con successo!

Per registrare gli admin e gli utenti delle varie organizzazioni esegui:

./registraUtenti.sh

In seguito avvia i server Api nel seguente modo (esegui in terminali diversi):

node javascript/apiserverWeb.js

node javascript/apiserverMotorizzazione.js

node javascript/apiserverAssicurazione.js

node javascript/apiserverMeccanico.js


EOF
