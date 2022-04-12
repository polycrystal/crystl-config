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
    configFile: "../pools/cronosBoostPools.json",
    chainId: ChainId.cronos,
    vaultHealer: "",
  },
  polygon: {
    configFile: "../pools/polygonBoostPools.json",
    chainId: ChainId.polygon,
    vaultHealer: "0x8fcb6ce37d2a279a80d65b92af9691f796cf1848",
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
const configFile = networkSelected.configFile;
const config = require(configFile);
const chainId = networkSelected.chainId;
const rpcProvider = new ethers.providers.JsonRpcProvider(
  MULTICHAIN_RPC[chainId]
);

async function fetchVault(vaultHealerAddress: string, poolId: number) {
  // console.log(`fetchVault(${vaultHealerAddress}, ${poolId})`);
  const vaultHealerContract = new ethers.Contract(
    vaultHealerAddress,
    vaultV3ABI,
    rpcProvider
  );

  const boostInfo = await vaultHealerContract.boostInfo(ZERO_ADDRESS, poolId);

  return await Promise.all(
    boostInfo.available.map(async (pool: { id: any }) => ({
      ...pool,
      address: await vaultHealerContract.boostPool(pool.id),
    }))
  );
}

async function fetchPool(poolAddress: string) {
  // console.log(`fetchPool(${poolAddress})`);
  const poolContract = new ethers.Contract(poolAddress, poolABI, rpcProvider);

  const boostId = (await poolContract.BOOST_ID()).toString();
  const rewardToken = await poolContract.REWARD_TOKEN();
  const rewardPerBlock = await poolContract.rewardPerBlock();

  return {
    boostId,
    rewardToken,
    rewardPerBlock,
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

function removeWrapped(symbol: string) {
  return ["WBTC", "WETH", "WBNB", "WBUSD", "WMATIC", "WCRO"].includes(
    symbol.toUpperCase()
  )
    ? symbol.substring(1).toUpperCase()
    : symbol.toUpperCase();
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

  const newPool = {
    id: boostPool.id.toString(),
    address: boostPoolAddress,
    projectName,
    rewardToken: removeWrapped(rewardToken.symbol),
    rewardTokenAddress: rewardToken.address,
    rewardPerBlock: new BigNumber(poolDetails.rewardPerBlock._hex).div(1e18).toNumber(),
  };

  config.forEach((pool: { id: any; }) => {
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
