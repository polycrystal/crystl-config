import yargs from "yargs";
import fs from "fs";
import path from "path";

const jsonFile = "../constants/tokens.json";
const tokenJson = require(jsonFile);

async function main() {
  const args = await yargs.options({
    name: {
      type: "string",
      demandOption: true,
      describe: "token name",
    },
    site: {
      type: "string",
      demandOption: true,
      describe: "project site url",
    },
  }).argv;

  const tokenName = String(args["name"]).toUpperCase();
  const siteUrl = String(args["site"]);

  const newToken = {
    name: tokenName,
    site: siteUrl,
  };

  tokenJson.forEach((token: { name: string }) => {
    if (token.name === tokenName) {
      throw Error(`Duplicate: token with name ${tokenName} already exists`);
    }
  });

  const newTokens = [newToken, ...tokenJson];

  fs.writeFileSync(
    path.resolve(__dirname, jsonFile),
    JSON.stringify(newTokens, null, 2) + "\n"
  );

  console.log(newToken);
}

main();
