# Crystl Config Repo

In order to add a new vault to the config you will need to know 5 things:

1. `network`: the network name you are adding the vault to
1. `pid`: the pid of the vault in the respective vaultHealer
1. `platform`: the platform name where the underlaying farm is (e.g., ApeSwap, Crodex, etc.)
1. `token`: the name of the main token of the lp, a.k.a. the project (e.g., CRYSTL, BANANA, ETH, USDC, etc.)
1. `provider`: the lp provider name (e.g., ApeSwap, Crodex, etc.)

If `platform`, `token` or `provider` are not present in their respective files (under `./constants` folder), take a look below on how to add them.

Also, if this is a new pair, don't forget adding the pair image in `./images/pairs`.

## How to add a vault

### Polygon

```
yarn polygon:add --pid 78 --platform apeswap --token crystl --provider apeswap
```

### Cronos

```
yarn cronos:add --pid 87 --platform crona --token crystl --provider crona
```

## How to add a platform

1. `name`: the name of the platform (e.g., ApeSwap, Crodex, Quickswap, etc.)
1. `id`: the short name that will be used to match in the API (e.g., ape, crodex, quick, etc.)
1. `site`: the url of the platform site

```
yarn platform:add --name apeswap --id ape --site https://apeswap.finance/
```

## How to add a token

1. `name`: the name of the token (e.g., CRYSTL, BANANA, CRX, etc.)
1. `site`: the url of the token site a.k.a. the project site

```
yarn token:add --name crystl --site https://crystl.finance/
```

## How to add a provider

1. `name`: the name of the lp provider (e.g., ApeSwap, Crodex, etc.)
1. `site`: the url of the lp provider site that directs you to the add liquidity section. It usually ends with `/add`. Please be carefull to NOT add an endind slash

```
yarn provider:add --name apeswap --site https://apeswap.finance/add
```
