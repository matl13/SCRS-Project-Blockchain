#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
CC_SRC_LANGUAGE=${1:-"go"}
CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`
if [ "$CC_SRC_LANGUAGE" != "go" -a "$CC_SRC_LANGUAGE" != "golang" -a "$CC_SRC_LANGUAGE" != "java" \
 -a  "$CC_SRC_LANGUAGE" != "javascript"  -a "$CC_SRC_LANGUAGE" != "typescript" ] ; then

	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
 	echo Supported chaincode languages are: go, java, javascript, and typescript
 	exit 1

fi

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
./byfn.sh up -l ${CC_SRC_LANGUAGE} -s couchdb
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
