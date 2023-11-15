const { ethers } = require("hardhat");
import { writeFileSync, readFileSync, copyFileSync} from "fs";

async function main() {
    // Deploy ERC20 Token
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy("1000000000000000000000"); // 1000 tokens
    await myToken.deployed();
    console.log(`MyToken deployed to: ${myToken.address}`);

    // primitive config management
 const myTokenAbi = JSON.parse(readFileSync("artifacts/contracts/MyToken.sol/MyToken.json").toString()).abi;
 const myTokenBuildInfo = JSON.parse(readFileSync("artifacts/contracts/MyToken.sol/MyToken.dbg.json").toString()).buildInfo
 const myTokenSwapBuildInfoRel = myTokenBuildInfo.slice(myTokenBuildInfo.indexOf("build-info"))

 // Deploy another ERC20 Token
 const Token = await ethers.getContractFactory("Token");
 const token = await Token.deploy("Token", "TOK", 18, "1000000000000000000000"); // 1000 tokens
 await token.deployed();
 console.log(`Token deployed to: ${token.address}`);

 // primitive config management
const TokenAbi = JSON.parse(readFileSync("artifacts/contracts/Token.sol/Token.json").toString()).abi;
const TokenBuildInfo = JSON.parse(readFileSync("artifacts/contracts/Token.sol/Token.dbg.json").toString()).buildInfo
const TokenSwapBuildInfoRel = TokenBuildInfo.slice(myTokenBuildInfo.indexOf("build-info"))

    // Deploy Manager Contract
    const Transfer = await ethers.getContractFactory("TokenTransfer");
    const transfer = await Transfer.deploy(myToken.address);
    await transfer.deployed();
    console.log(`Transfer deployed to: ${transfer.address}`);

 // primitive config management
 const TokenTransferAbi = JSON.parse(readFileSync("artifacts/contracts/TokenTransfer.sol/TokenTransfer.json").toString()).abi;
 const TokenTransferBuildInfo = JSON.parse(readFileSync("artifacts/contracts/TokenTransfer.sol/TokenTransfer.dbg.json").toString()).buildInfo
 const tokenSwapBuildInfoRel = TokenTransferBuildInfo.slice(TokenTransferBuildInfo.indexOf("build-info"))


 const OwnerTransfer = await ethers.getContractFactory("Owner");
 const ownerTransfer = await OwnerTransfer.deploy(transfer.address); // deploy with the address of the TokenTransfer contract
 await ownerTransfer.deployed();
 console.log(`OwnerTransfer deployed to: ${ownerTransfer.address}`);

 // primitive config management
 const OwnerTransferAbi = JSON.parse(readFileSync("artifacts/contracts/TokenTransfer.sol/Owner.json").toString()).abi;
 const OwnerTransferBuildInfo = JSON.parse(readFileSync("artifacts/contracts/TokenTransfer.sol/Owner.dbg.json").toString()).buildInfo
 const ownerBuildInfoRel = TokenTransferBuildInfo.slice(OwnerTransferBuildInfo.indexOf("build-info"))


writeFileSync(
    "../pages/abi/TokenTransfer.json",
    JSON.stringify({
      TokenTransfer: {
        address: transfer.address,
        network: ethers.provider.network,
        abi: TokenTransferAbi
      },
     
    },null, 2)
  );

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


writeFileSync(
  "../pages/abi/OwnerTokenTransfer.json",
  JSON.stringify({
    OwnerTokenTransfer: {
      address: ownerTransfer.address,
      network: ethers.provider.network,
      abi: OwnerTransferAbi
    },
   
  },null, 2)
);

  writeFileSync(
    "../pages/abi/MyToken.json",
    JSON.stringify({
      MyToken: {
        address: myToken.address,
        network: ethers.provider.network,
        abi: myTokenAbi
      },
     
    },null, 2)
  );


  
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
