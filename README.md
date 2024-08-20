# ENV

- node 18.0.0

# Ganache-cli

local contract test

```
$ docker-compose up
```

# hardhat

- env setting

```
$ cp .env-example .env
$ yarn install
```

- contract proxy deploy

```
$ yarn hardhat run scripts/deployProxy.ts --network ganache
```

- contract verify

```
$ yarn hardhat verify 0x0000 --contract contracts/Presale.sol:Presale --network ethereum
```

- ABI

```
$ solc ./contracts/ContractName.sol --abi --include-path node_modules/ --base-path .
```

# hardhat commands

```
$ yarn hardhat --network ganache run scripts/deploy.ts
```
