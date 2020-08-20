../bin/cryptogen generate --config=./crypto-config.yaml
../bin/configtxgen -profile SampleMultiNodeEtcdRaft -channelID byfn-sys-channel -outputBlock ./channel-artifacts/genesis.block
docker-compose -f docker-compose-cli.yaml up -d
