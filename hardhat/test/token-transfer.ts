import "@tenderly/hardhat-tenderly";
import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat"; // Import Signer from ethers
import { Token } from "../typechain-types";

describe("ERC Token Transfer Tests", function () {
    let token: Token;
    let sender: Signer;
    let receiver: Signer;
    let initialAmount = ethers.utils.parseUnits("10", 18);
    let sendAmount = ethers.utils.parseUnits("1", 18);

    beforeEach(async function () {
        const [deployer, addr1, addr2] = await ethers.getSigners();
        sender = addr1;
        receiver = addr2;

        // Deploy contract
        const TokenFactory = await ethers.getContractFactory("Token", deployer);
        token = await TokenFactory.deploy("MyToken", "TOK", 18, ethers.utils.parseUnits("1000", 18));
        await token.deployed();

        // Approve each wallet with 10 TOK each 
        await token.connect(deployer).approve(await sender.getAddress(), initialAmount);
        await token.connect(deployer).approve(await receiver.getAddress(), initialAmount);

        // Populate wallets with 10 TOK each 
        await token.connect(deployer).transfer(await sender.getAddress(), initialAmount);
        await token.connect(deployer).transfer(await receiver.getAddress(), initialAmount);      

    });

    it("should allow accounts to approve others to spend tokens", async function () {
      const spender = receiver;
      const approvalAmount = ethers.utils.parseUnits("5", 18);
  
      await expect(token.connect(sender).approve(await spender.getAddress(), approvalAmount))
          .to.emit(token, "Approval")
          .withArgs(await sender.getAddress(), await spender.getAddress(), approvalAmount);
  
      expect(await token.allowance(await sender.getAddress(), await spender.getAddress())).to.equal(approvalAmount);
  });

    it("Should allow token transfer", async function () {
      
        // Approve some tokens
        await expect(token.connect(sender).approve(await receiver.getAddress(), sendAmount))
        .to.emit(token, "Approval")
        .withArgs(await sender.getAddress(), await receiver.getAddress(), sendAmount);

        // Check allowance is 1 TOK
        expect(await token.allowance(await sender.getAddress(), await receiver.getAddress())).to.equal(sendAmount);

        // Sender sends 1 TOK to receiver
        await expect(token.connect(sender).transfer(await receiver.getAddress(), sendAmount))
        .to.emit(token, "Transfer")
        .withArgs(await sender.getAddress(), await receiver.getAddress(), sendAmount);

        // Check balances - sender should have 9 TOK, receiver should have 1 TOK
        expect(await token.balanceOf(await sender.getAddress())).to.equal(ethers.utils.parseUnits("9", 18));
        expect(await token.balanceOf(await receiver.getAddress())).to.equal(ethers.utils.parseUnits("11", 18));
    });

});
