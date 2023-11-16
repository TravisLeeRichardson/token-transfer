import "@tenderly/hardhat-tenderly";
import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers, tenderly } from "hardhat";
import { Token } from "../typechain-types";

describe("Token", () => {
  let senderAddress = "0xC305f4b9925b9eC6b3D0FCC42B7b22F1245A5011";
  let receiverAddress = "0xdb623c0F74d4ed5af4B254327147c4aC7E5d3fAC";
  let privateKey = "fa5568408b1f994003a17d4c91a7b2a71d7ea1175e035753167226c62e0f4db5";
  let tokenAddress = "0x1756a8D1f35CC5B97cc1237F82254CF466dbC83f";
  let token: Token | null = null;
  let signers: Signer[] = [];

  let nonOwnerAddress = "0x0000000000000000000000000000000000000000";
  let nonOwnerSigner = ethers.provider.getSigner(nonOwnerAddress);
  const recipientAddress = "0xdb623c0F74d4ed5af4B254327147c4aC7E5d3fAC";
  const sendAmount = parseEther("1.0");

  before(async () => {
   
    const newProvider = new ethers.providers.JsonRpcProvider(providerUrl);

    const newWallet = new ethers.Wallet(privateKey, newProvider);;

    const newTokenContract = new ethers.Contract(tokenAddress, token.Token.abi, newWallet);
    

    signers = s.map(ethers.provider.getSigner);

    nonOwnerAddress = (await ethers.provider.listAccounts())[9];
    nonOwnerSigner = ethers.provider.getSigner(nonOwnerAddress);

    

    // deploying the contract
    const tokenFactory = await ethers.getContractFactory(
      "Token"
    );

    console.log("Deploying Token...");
    
 const Token = await ethers.getContractFactory("Token");
 const token = await Token.deploy("Token", "TOK", 18, "1000000000000000000000"); // 1000 tokens
 await token.deployed();
 
    // verify in Tenderly (fork)
    await tenderly.verify({
      name: "Token",
      address: token.address,
    });

    console.log("Deployed to:", token.address);

    // Fund the contract with 10 ETH
    const fnd = await signers[0].sendTransaction({
      to: token.address,
      value: parseEther("10.0"),
    });
    await fnd.wait();

    console.log("Token Contract funded");
  });

  it("accepts Transfer From Owner", async () => {
   
    let approveTx = await tokenContract.approve(senderAddress, ethers.utils.parseUnits(sendAmount.toString(), 18)); //send amount is in wei
    await approveTx.wait();
    setApproveAmount(ethers.utils.formatUnits(sendAmount, 18));

    const allowance = await tokenContract.allowance(senderAddress, senderAddress); // Owner = Spender
     setAllowance(ethers.utils.formatUnits(allowance, 18));
     console.log("Allowance Granted:", ethers.utils.formatUnits(allowance, 18));


    await expect(
      token
        ?.connect(signers[0])
        .approve(senderAddress, ethers.utils.parseUnits(sendAmount.toString(), 18))
    )
      .to.emit(multisigWallet, "SubmitTransaction")
      .withArgs(
        ownerAddresses[0],
        BigNumber.from(0),
        recipientAddress,
        BigNumber.from(1000),
        "0x"
      );
  });

  it("rejects submit from non-owner", async () => {
    await expect(
      multisigWallet
        ?.connect(nonOwnerSigner)
        .submitTransaction(recipientAddress, 0, "0x", { gasLimit: 100000 })
    ).to.be.reverted;
  });

  it("accepts confirmation from owners", async () => {
    const submissionTransaction = await multisigWallet
      ?.connect(signers[0])
      .submitTransaction(recipientAddress, 1000, "0x");
    const submissionReceipt = await submissionTransaction?.wait();

    const submissionEvent = submissionReceipt?.events?.filter(
      (e) => e.event == "SubmitTransaction"
    );
    // @ts-ignore
    const latestTx = (submissionEvent[0].args[1] as BigNumber).toNumber();

    await expect(
      multisigWallet?.connect(signers[0]).confirmTransaction(latestTx)
    )
      .to.emit(multisigWallet, "ConfirmTransaction")
      .withArgs(ownerAddresses[0], latestTx);

    await expect(
      multisigWallet?.connect(signers[1]).confirmTransaction(latestTx)
    )
      .to.emit(multisigWallet, "ConfirmTransaction")
      .withArgs(ownerAddresses[1], latestTx);
  });

  it("rejects confirmation from non-owners", async () => {
    multisigWallet
      ?.connect(signers[0])
      // TODO is gasLimit the way to make ethers send the TX?
      .submitTransaction(recipientAddress, 1000, "0x");

    await expect(
      multisigWallet
        ?.connect(nonOwnerSigner)
        .confirmTransaction(0, { gasLimit: 100000 })
    ).to.be.reverted;
  });

  it("rejects execution with insufficient approval number", async () => {
    const submission = await multisigWallet
      ?.connect(signers[0])
      .submitTransaction(recipientAddress, 1000, "0x");
    const submissionReceipt = await submission?.wait();

    const submissionEvent = submissionReceipt?.events?.filter(
      (e) => e.event == "SubmitTransaction"
    );
    // @ts-ignore
    const latestTx = (submissionEvent[0].args[1] as BigNumber).toNumber();

    await multisigWallet?.connect(signers[1]).confirmTransaction(latestTx);

    await expect(
      multisigWallet
        ?.connect(signers[2])
        .executeTransaction(latestTx, { gasLimit: 100000 })
    ).to.be.reverted;
  });

  it("accepts execution with required approval number", async () => {
    const submissionTransaction = await multisigWallet
      ?.connect(signers[0])
      .submitTransaction(recipientAddress, 1000, "0x");
    const submissionReceipt = await submissionTransaction?.wait();

    const submissionEvent = submissionReceipt?.events?.filter(
      (e) => e.event == "SubmitTransaction"
    );
    // @ts-ignore
    const latestTx = (submissionEvent[0].args[1] as BigNumber).toNumber();

    await multisigWallet?.connect(signers[0]).confirmTransaction(latestTx);

    await multisigWallet?.connect(signers[1]).confirmTransaction(latestTx);

    await expect(
      multisigWallet
        ?.connect(signers[2])
        .executeTransaction(latestTx, { gasLimit: 100000 })
    )
      .to.emit(multisigWallet, "ExecuteTransaction")
      .withArgs(ownerAddresses[2], latestTx);
  });
});