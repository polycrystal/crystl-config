import { ChainId } from "../constants/constants";

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
const vaultV2ABI = require("../abis/CrystlVaultHealerV2.json");
const strategyV2ABI = require("../abis/CrystlStrategyV2.json");
const vaultV3ABI = require("../abis/CrystlVaultHealerV3.json");
const strategyV3ABI = require("../abis/CrystlStrategyV3.json");

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
  cronosV3: {
    configFile: "../vaults/cronosV3.json",
    chainId: ChainId.cronos,
    vaultHealer: "",
    isV3: true,
  },
  polygonV3: {
    configFile: "../vaults/polygonV3.json",
    chainId: ChainId.polygon,
    vaultHealer: "0x8fcb6ce37d2a279a80d65b92af9691f796cf1848",
    isV3: true,
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
  token: {
    type: "string",
    demandOption: true,
    describe: "token token name",
  },
  provider: {
    type: "string",
    demandOption: true,
    describe: "lp provider name",
  },
  deposit: {
    type: "number",
    demandOption: false,
    describe: "deposit fee",
  },
  // boosted: {
  //   type: "boolean",
  //   demandOption: false,
  //   describe: "is boosted",
  // },
  type: {
    type: "string",
    demandOption: false,
    describe: "(S)ingle Staking | (T)raditional",
  },
  category: {
    type: "string",
    demandOption: false,
    describe:
      "(S)table Coin | (B)lue Chip | (D)eFi Token | (G)ameFi | (N)FT/GameFi | (T)omb Fork (DYOR). You can select multiple with a '/' like: s/b",
  },
}).argv;

const pid: number = args["pid"];
const platform: string = args["platform"];
const token: string = args["token"];
const provider: string = args["provider"];
const depositFee: number = args["deposit"] ?? 0;
// const isBoosted: boolean = args["boosted"] ?? false;
const type: string = args["type"] ?? "";
const category: string = args["category"] ?? "";

const networkSelected = network[args["network"] as string];
const isV3 = networkSelected.isV3 ?? false;
const vaultHealerAddress = networkSelected.vaultHealer;
const configFile = networkSelected.configFile;
const config = require(configFile);
const chainId = networkSelected.chainId;
const rpcProvider = new ethers.providers.JsonRpcProvider(
  MULTICHAIN_RPC[chainId]
);

async function fetchVault(
  vaultHealerAddress: string,
  poolId: number,
  isV3 = false
) {
  console.log(`fetchVault(${vaultHealerAddress}, ${poolId})`);
  const vaultHealerContract = new ethers.Contract(
    vaultHealerAddress,
    isV3 ? vaultV3ABI : vaultV2ABI,
    rpcProvider
  );

  const poolInfo = isV3
    ? await vaultHealerContract.vaultInfo(poolId)
    : await vaultHealerContract.poolInfo(poolId);
  const strat = isV3 ? await vaultHealerContract.strat(poolId) : poolInfo.strat;

  return {
    want: poolInfo.want,
    strat,
  };
}
async function fetchStrategy(strategy: string, isV3 = false) {
  console.log(`fetchStrategy(${strategy})`);
  const strategyContract = new ethers.Contract(
    strategy,
    isV3 ? strategyV3ABI : strategyV2ABI,
    rpcProvider
  );

  const configInfo = isV3 ? await strategyContract.configInfo() : null;
  const masterchef = isV3
    ? configInfo.masterchef
    : await strategyContract.masterchefAddress();
  const pid = isV3
    ? configInfo.pid.toNumber()
    : (await strategyContract.pid()).toNumber();
  const router: string = isV3 ? await strategyContract.router() : "";
  const isMaximizer: boolean = isV3 ? await strategyContract.isMaximizer() : false;

  return {
    address: ethers.utils.getAddress(strategy),
    masterchef,
    pid,
    router,
    isMaximizer,
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
    decimals: await tokenContract.decimals(),
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

function getType(type: string): string {
  switch (type.toLowerCase()) {
    case "s":
      return "SINGLE STAKING";
    case "t":
      return "TRADITIONAL";
    default:
      return "";
  }
}

function getCategory(category: string): string[] {
  return category.split("/").map((c) => {
    switch (c.toLowerCase()) {
      case "s":
        return "STABLE COIN";
      case "b":
        return "BLUE CHIP";
      case "d":
        return "DEFI TOKEN";
      case "n":
        return "NFT/GAMEFI";
      case "t":
        return "TOMB FORK (DYOR)";
      default:
        return "";
    }
  });
}

async function main() {
  const vault = await fetchVault(vaultHealerAddress, pid, isV3);
  const strategy = await fetchStrategy(vault.strat, isV3);
  const lp = await fetchLiquidityPair(vault.want);
  const token0 = await fetchToken(lp.token0);
  const token1 = await fetchToken(lp.token1);
  const platformData = fetchPlatform(platform);
  const site = fetchProject(token);
  const lpProvider = fetchProvider(provider);
  const unwrappedToken0 = removeWrapped(token0.symbol);
  const unwrappedToken1 = removeWrapped(token1.symbol);

  const isV3Label = isV3 ? "v3-" : "";
  const newVaultName = `${isV3Label}${
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
    lpSymbol: `${token1.symbol === "WCRO" ? "CRO" : token1.symbol}-${
      token0.symbol === "WCRO" ? "CRO" : token0.symbol
    } LP`,
    lpProvider: provider.toUpperCase(),
    wantAddress: lp.address,
    depositFee: `${depositFee.toLocaleString("en-US")}%`,
    strategyAddress: strategy.address,
    masterchef: strategy.masterchef,
    farmPid: strategy.pid,
    router: strategy.router,
    pricePerFullShare: 1,
    tvl: 0,
    oracle: "lps",
    oracleId: isV3 ? tempName.slice(3) : tempName,
    paused: false,
    platform: platformData.name,
    farmSite: platformData.site,
    projectSite: site,
    assets: [
      { name: unwrappedToken0, address: token0.address, decimals: token0.decimals },
      { name: unwrappedToken1, address: token1.address, decimals: token1.decimals },
    ],
    // boosted: isBoosted,
    type: getType(type),
    category: [...getCategory(category)],
    isMaximizer: strategy.isMaximizer,
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
