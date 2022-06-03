import { ChainId, ZERO_ADDRESS } from "../constants/constants";

const yargs = require("yargs");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const BigNumber = require("bignumber.js");

const { MULTICHAIN_RPC } = require("../constants/constants");

const ERC20ABI = require("../abis/ERC20.json");
const poolABI = require("../abis/CrystlBoostPool.json");
const vaultV3ABI = require("../abis/CrystlVaultHealerV3.json");

const inquirer = require("inquirer");

const network: any = {
  cronos: {
    configFile: "../pools/boostPools.json",
    chainId: ChainId.cronos,
    vaultHealer: "0xBA6f3b9bf74FbFa59d55E52fa722E6a5737070D0",
    vaultConfig: "../vaults/vaultsV3.json",
  },
  polygon: {
    configFile: "../pools/boostPools.json",
    chainId: ChainId.polygon,
    vaultHealer: "0xA1b26B5eC4a73A6a632bE1f45FfC628518c0AFD6",
    vaultConfig: "../vaults/vaultsV3.json",
  },
  bnb: {
    configFile: "../pools/boostPools.json",
    chainId: ChainId.bsc,
    vaultHealer: "0x9Fe22630DE9Ec654256AB103adD153D93c4D329C",
    vaultConfig: "../vaults/vaultsV3.json",
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
    describe: "vault id",
  },
}).argv;

const pid: number = args["pid"];

const networkSelected = network[args["network"] as string];
const vaultHealerAddress = networkSelected.vaultHealer;
const chainId = networkSelected.chainId;
const vaults = require(networkSelected.vaultConfig).filter((vault: { chainId: any; }) => vault.chainId === chainId);
const configFile = networkSelected.configFile;
const config = require(configFile);
const rpcProvider = new ethers.providers.JsonRpcProvider(
  MULTICHAIN_RPC[chainId]
);

async function fetchVault(vaultHealerAddress: string, poolId: number) {
  const vaultHealerContract = new ethers.Contract(
    vaultHealerAddress,
    vaultV3ABI,
    rpcProvider
  );

  const strat = await vaultHealerContract.strat(poolId);
  const vaultInfo = await vaultHealerContract.vaultInfo(poolId);
  const want = vaultInfo.want;

  const boostPools = [];
  for (let index = 0; index < vaultInfo.numBoosts; index++) {
    const boostPoolIds = await vaultHealerContract.boostPoolVid(poolId, index);
    boostPools.push({
      id: boostPoolIds[0],
      strat,
      want,
      address: boostPoolIds[1],
    });
  }
  return boostPools;
}

async function fetchPool(poolAddress: string) {
  const poolContract = new ethers.Contract(poolAddress, poolABI, rpcProvider);

  const boostId = (await poolContract.BOOST_ID()).toString();
  const rewardToken = await poolContract.REWARD_TOKEN();
  const rewardPerBlock = await poolContract.rewardPerBlock();
  const startBlock = await poolContract.startBlock();
  const endBlock = await poolContract.bonusEndBlock();

  return {
    boostId,
    rewardToken,
    rewardPerBlock,
    startBlock,
    endBlock,
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

function removeWrapped(symbol: string) {
  return ["WBTC", "WETH", "WBNB", "WBUSD", "WMATIC", "WCRO"].includes(
    symbol.toUpperCase()
  )
    ? symbol.substring(1).toUpperCase()
    : symbol.toUpperCase();
}

function fetchWantToken() {
  const vault = vaults.find((vault: { pid: number }) => vault.pid === pid);
  return { oracle: vault.oracle, oracleId: vault.oracleId };
}

async function main() {
  const boostPools = await fetchVault(vaultHealerAddress, pid);

  const questions = [
    {
      type: "list",
      choices: boostPools.map((pool: { address: { toString: () => any } }) =>
        pool.address.toString()
      ),
      name: "pool",
      message: "Which boost pool address do you want to add?",
    },
    {
      type: "input",
      name: "project",
      message: "Which is the project name?",
    },
  ];
  let boostPoolAddress: any;
  let projectName!: string; // non-null assertion operator.
  await inquirer.prompt(questions).then((answers: { [x: string]: any }) => {
    boostPoolAddress = answers["pool"];
    projectName = answers["project"].toUpperCase();
  });

  const boostPool = boostPools.find(
    (pool) => pool.address === boostPoolAddress
  );
  const poolDetails = await fetchPool(boostPoolAddress);
  const rewardToken = await fetchToken(poolDetails.rewardToken);
  const oracle = fetchWantToken();

  const newPool = {
    id: boostPool?.id.toString(),
    chainId,
    address: boostPoolAddress,
    stratAddress: boostPool?.strat,
    vaultHealerAddress,
    vid: pid,
    projectName,
    oracle: oracle.oracle,
    oracleId: oracle.oracleId,
    wantTokenAddress: boostPool?.want,
    rewardToken: removeWrapped(rewardToken.symbol),
    rewardTokenAddress: rewardToken.address,
    rewardTokenDecimals: `1e${rewardToken.decimals}`,
    rewardPerBlock: new BigNumber(poolDetails.rewardPerBlock._hex)
      .div(1e18)
      .toNumber(),
    startBlock: poolDetails.startBlock,
    endBlock: poolDetails.endBlock,
  };

  config.forEach((pool: { id: any }) => {
    if (pool.id === newPool.id) {
      throw Error(`Duplicate: pool with id ${newPool.id} already exists`);
    }
  });

  const newPools = [...config, newPool];

  fs.writeFileSync(
    path.resolve(__dirname, configFile),
    JSON.stringify(newPools, null, 2) + "\n"
  );

  console.log(newPool);
}

main();
