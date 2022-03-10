import { ChainId } from "blockchain-addressbook/build/address-book";

const yargs = require("yargs");
const fs = require("fs");
const path = require("path");

const { ethers } = require("ethers");
const { MULTICHAIN_RPC } = require("../constants/constants");

const LPPairABI = require("../abis/LPPair.json");
const ERC20ABI = require("../abis/ERC20.json");
const platformJson = require("../constants/platforms.json");
const tokenJson = require("../constants/tokens.json");
const providerJson = require("../constants/providers.json");
const vaultABI = require("../abis/CrystlVaultHealerV2.json");
const strategyABI = require("../abis/CrystlStrategyV2.json");

const network: any = {
  cronos: {
    configFile: "../vaults/cronos.json",
    chainId: ChainId.cronos,
    vaultHealer: "0x4dF0dDc29cE92106eb8C8c17e21083D4e3862533",
  },
  polygon: {
    configFile: "../vaults/polygon.json",
    chainId: ChainId.polygon,
    vaultHealer: "0xD4d696ad5A7779F4D3A0Fc1361adf46eC51C632d",
  },
};

const args = yargs.options({
  network: {
    type: "string",
    demandOption: true,
    describe: "network name",
  },
  pid: {
    type: "number",
    demandOption: true,
    describe: "vaultHealer pid",
  },
  platform: {
    type: "string",
    demandOption: true,
    describe: "platform name",
  },
  project: {
    type: "string",
    demandOption: true,
    describe: "project token name",
  },
  provider: {
    type: "string",
    demandOption: true,
    describe: "lp provider name",
  },
}).argv;

const pid = args["pid"];
const platform = args["platform"];
const project = args["project"];
const provider = args["provider"];

const vaultHealerAddress = network[args["network"] as string].vaultHealer;
const configFile = network[args["network"] as string].configFile;
const config = require(configFile);
const chainId = network[args["network"] as string].chainId;
const rpcProvider = new ethers.providers.JsonRpcProvider(
  MULTICHAIN_RPC[chainId]
);

async function fetchVault(vaultHealerAddress: string, poolId: number) {
  console.log(`fetchVault(${vaultHealerAddress}, ${poolId})`);
  const vaultHealerContract = new ethers.Contract(
    vaultHealerAddress,
    vaultABI,
    rpcProvider
  );

  const poolInfo = await vaultHealerContract.poolInfo(poolId);
  return {
    want: poolInfo.want,
    strat: poolInfo.strat,
  };
}
async function fetchStrategy(strategy: string) {
  console.log(`fetchStrategy(${strategy})`);
  const strategyContract = new ethers.Contract(
    strategy,
    strategyABI,
    rpcProvider
  );

  return {
    address: ethers.utils.getAddress(strategy),
    masterchef: await strategyContract.masterchefAddress(),
    pid: (await strategyContract.pid()).toNumber(),
  };
}

async function fetchLiquidityPair(lpAddress: string) {
  console.log(`fetchLiquidityPair(${lpAddress})`);
  const lpContract = new ethers.Contract(lpAddress, LPPairABI, rpcProvider);

  return {
    address: ethers.utils.getAddress(lpAddress),
    token0: await lpContract.token0(),
    token1: await lpContract.token1(),
  };
}

async function fetchToken(tokenAddress: string) {
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ERC20ABI,
    rpcProvider
  );
  return {
    address: ethers.utils.getAddress(tokenAddress),
    symbol: await tokenContract.symbol(),
  };
}

function fetchPlatform(platform: string) {
  const result = platformJson.find(
    (p: { name: string }) => p.name.toUpperCase() === platform.toUpperCase()
  );
  return {
    name: result.name,
    id: result.id,
    site: result.site,
  };
}

function fetchProject(project: string) {
  const result = tokenJson.find(
    (p: { name: string }) => p.name.toUpperCase() === project.toUpperCase()
  );
  return result.site;
}

function fetchProvider(provider: string) {
  const result = providerJson.find(
    (p: { name: string }) => p.name.toUpperCase() === provider.toUpperCase()
  );
  return {
    name: result.name,
    site: result.site,
  };
}

function removeWrapped(symbol: string) {
  return ["WBTC", "WETH", "WBNB", "WBUSD", "WMATIC", "WCRO"].includes(
    symbol.toUpperCase()
  )
    ? symbol.substring(1).toUpperCase()
    : symbol.toUpperCase();
}

async function main() {
  const vault = await fetchVault(vaultHealerAddress, pid);
  const strategy = await fetchStrategy(vault.strat);
  const lp = await fetchLiquidityPair(vault.want);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);
  const platformData = fetchPlatform(platform);
  const site = fetchProject(project);
  const lpProvider = fetchProvider(provider);
  const unwrappedToken0 = removeWrapped(token0.symbol);
  const unwrappedToken1 = removeWrapped(token1.symbol);

  const newVaultName = `${
    platformData.id
  }-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}`;

  let searching = true;
  let counter = 1;
  let tempName = newVaultName;
  while (searching) {
    searching = false;
    config.forEach((vault: { id: string }) => {
      if (vault.id === tempName) {
        counter++;
        tempName = `${newVaultName}-${counter}`;
        searching = true;
      }
    });
  }

  const newVault = {
    id: tempName,
    pid,
    lpSymbol: `${token1.symbol}-${token0.symbol} LP`,
    lpProvider: provider.toUpperCase(),
    wantAddress: lp.address,
    depositFee: "0%",
    strategyAddress: strategy.address,
    masterchef: strategy.masterchef,
    farmPid: strategy.pid,
    pricePerFullShare: 1,
    tvl: 0,
    oracle: "lps",
    oracleId: tempName,
    paused: false,
    platform: platformData.name,
    farmSite: platformData.site,
    projectSite: site,
    assets: [unwrappedToken0, unwrappedToken1],
    addLiquidityUrl: `${lpProvider.site}/${token0.address}/${token1.address}`,
  };

  const newVaults = [...config, newVault];

  fs.writeFileSync(
    path.resolve(__dirname, configFile),
    JSON.stringify(newVaults, null, 2) + "\n"
  );

  console.log(newVault);
}

main();
