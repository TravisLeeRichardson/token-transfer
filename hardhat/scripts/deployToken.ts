const { ethers } = require("hardhat");
import { writeFileSync, readFileSync, copyFileSync} from "fs";

async function main() {

 // Deploy ERC20 Token
 const Token = await ethers.getContractFactory("Token");
 const token = await Token.deploy("Token", "TOK", 18, "1000000000000000000000"); // 1000 tokens
 await token.deployed();
 console.log(`Token deployed to: ${token.address}`);

 // primitive config management
const TokenAbi = JSON.parse(readFileSync("artifacts/contracts/Token.sol/Token.json").toString()).abi;
const TokenBuildInfo = JSON.parse(readFileSync("artifacts/contracts/Token.sol/Token.dbg.json").toString()).buildInfo
const TokenSwapBuildInfoRel = TokenBuildInfo.slice(TokenBuildInfo.indexOf("build-info"))

  writeFileSync(
    "../pages/abi/Token.json",
    JSON.stringify({
      Token: {
        address: token.address,
        network: ethers.provider.network,
        abi: TokenAbi
      },
     
    },null, 2)
  );
  
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
