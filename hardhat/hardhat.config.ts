import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as tenderly from "@tenderly/hardhat-tenderly";
import * as dotenv from "dotenv";
import "hardhat-deploy";

dotenv.config();

console.log ("process.env.ALCHEMY_API_KEY", process.env.ALCHEMY_API_KEY);

const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";
const tenderlyAccessKey = process.env.TENDERLY_ACCESS_KEY || ""; 
// If not set, it uses the hardhat account 0 private key.
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// If not set, it uses ours Etherscan default API key.
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

tenderly.setup({ automaticVerifications: false });

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  defaultNetwork: "tenderly",
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    tenderly: {
      url: "https://rpc.vnet.tenderly.co/devnet/erc20tokentransfer/142549d2-3369-4003-86b7-dc1f5515d181",
      chainId: 11155111,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    sepoliaTenderly: {
      url: `https://sepolia.gateway.tenderly.co/${tenderlyAccessKey}`,
      accounts: [deployerPrivateKey],
      chainId: 11155111,
    },
  },
  tenderly: {
    username: "tlrichar",
    project: "project",
  },
  verify: {
    etherscan: {
      apiKey: `${etherscanApiKey}`,
    },
  }
};

//do later if needed. 
/* task("verifyExistingMS", "Verifies deployed MultiSigWallet instance")
  .addParam("address")
  .setAction(async (args, hre) => {
    await hre.run("compile");
    console.log("Verifying MS", args.address);
    await hre.tenderly.verify({
      name: "MultiSigWallet",
      address: args.address,
    });
  }); */

export default config;
