import yargs from "yargs";
import fs from "fs";
import path from "path";

const jsonFile = "../constants/providers.json";
const providerJson = require(jsonFile);

async function main() {
  const args = await yargs.options({
    name: {
      type: "string",
      demandOption: true,
      describe: "provider name",
    },
    site: {
      type: "string",
      demandOption: true,
      describe: "provider url",
    },
  }).argv;

  const providerName = String(args["name"]).toUpperCase();
  const siteUrl = String(args["site"]);

  const newProvider = {
    name: providerName,
    site: siteUrl,
  };

  providerJson.forEach((token: { name: string }) => {
    if (token.name === providerName) {
      throw Error(`Duplicate: provider with name ${providerName} already exists`);
    }
  });

  const newTokens = [newProvider, ...providerJson];

  fs.writeFileSync(
    path.resolve(__dirname, jsonFile),
    JSON.stringify(newTokens, null, 2) + "\n"
  );

  console.log(newProvider);
}

main();
