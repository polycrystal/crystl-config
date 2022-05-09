import yargs from "yargs";
import fs from "fs";
import path from "path";

const jsonFile = "../constants/platforms.json";
const platformJson = require(jsonFile);

async function main() {
  const args = await yargs.options({
    name: {
      type: "string",
      demandOption: true,
      describe: "platform name",
    },
    id: {
      type: "string",
      demandOption: true,
      describe: "platform id name",
    },
    site: {
      type: "string",
      demandOption: true,
      describe: "platform site url",
    },
    staked: {
      type: "string",
      demandOption: false,
      describe: "totalStaked variable",
    },
    reward: {
      type: "string",
      demandOption: false,
      describe: "rewardPerBlock variable",
    },
  }).argv;

  const platformName = String(args["name"]).toUpperCase();
  const idName = String(args["id"]).toLowerCase();
  const siteUrl = String(args["site"]);
  const totalStaked = String(args["site"] ?? "");
  const rewardPerBlock = String(args["site"] ?? "");

  const newPlatform = {
    name: platformName,
    id: idName,
    site: siteUrl,
    totalStaked,
    rewardPerBlock,
  };

  platformJson.forEach((token: { name: string }) => {
    if (token.name === platformName) {
      throw Error(
        `Duplicate: platform with name ${platformName} already exists`
      );
    }
  });

  const newTokens = [newPlatform, ...platformJson];

  fs.writeFileSync(
    path.resolve(__dirname, jsonFile),
    JSON.stringify(newTokens, null, 2) + "\n"
  );

  console.log(newPlatform);
}

main();
