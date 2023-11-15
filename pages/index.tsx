import { ethers } from "ethers";
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { NextPage } from 'next'
import Head from 'next/head'
import token from '../pages/abi/Token.json';
import * as dotenv from "dotenv";
dotenv.config();

const tokenABI = token.Token.abi; 
const tokenAddress = "0x1756a8D1f35CC5B97cc1237F82254CF466dbC83f" //Sepolia Deployment (paste your contract address here)

// Tenderly DevNet (paste your devnet here)
const provider = new ethers.providers.JsonRpcProvider("https://rpc.vnet.tenderly.co/devnet/erc20tokentransfer/cdc34d99-ad8d-41a2-a648-f4c867c5dc33");

const privateKey = 'fa5568408b1f994003a17d4c91a7b2a71d7ea1175e035753167226c62e0f4db5'; //dummy wallet key (paste your key here)
const wallet = new ethers.Wallet(privateKey, provider);
const signer = wallet.connect(provider);

const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
const senderAddress = "0xC305f4b9925b9eC6b3D0FCC42B7b22F1245A5011"; // (paste your public wallet address here for sender)
const receiverAddress = "0xdb623c0F74d4ed5af4B254327147c4aC7E5d3fAC"; // (paste your public wallet address here for receiver)

const Home: NextPage = () => {
  const [isTransferring, setIsTransferring] = useState(false);
  const sendAmount = ethers.utils.parseUnits("1", 18);

  const handleTransferClick = async () => {
    setIsTransferring(true);

    try {

      // Check balances before the Send
      let senderBalance = await tokenContract.balanceOf(senderAddress);
      let receiverBalance = await tokenContract.balanceOf(receiverAddress);
      console.log("Sender balance before transfer:", ethers.utils.formatUnits(senderBalance, 18));
      console.log("Receiver balance before transfer:", ethers.utils.formatUnits(receiverBalance, 18));
     
      // Approve the senderAddress to spend tokens
      let approveTx = await tokenContract.approve(senderAddress, sendAmount);
      await approveTx.wait();
      console.log("Approved for transfer.");

      // Check Allowance
      const allowance = await tokenContract.allowance(senderAddress, senderAddress); // Owner = Spender
      console.log("Allowance Granted:", ethers.utils.formatUnits(allowance, 18));

      // Send the tokens
      console.log("Sending...", ethers.utils.formatUnits(sendAmount, 18));
      const tx = await tokenContract.transferFrom(senderAddress, receiverAddress, sendAmount);
      await tx.wait();
      console.log("Send complete.");

      // check balances after the send
      senderBalance = await tokenContract.balanceOf(senderAddress);
      receiverBalance = await tokenContract.balanceOf(receiverAddress);
      console.log("Sender balance after transfer:", ethers.utils.formatUnits(senderBalance, 18));
      console.log("Receiver balance after transfer:", ethers.utils.formatUnits(receiverBalance, 18));

    } catch (error) {
      console.error("Transfer failed:", error);
    } finally {
      setIsTransferring(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Token Transfer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-center">
            <span className="to-blue-500 bg-clip-text">
              Token Transfer 🧰
            </span>
          </h1>
          <h3 className="mt-2 text-gray-400">
            Transfer Your Tokens on a Tenderly DevNet
          </h3>
          <div className="mt-4 flex">
        {/*}    <ConnectButton /> */}
            <button
          className={`ml-2 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-12 rounded-xl ${
            isTransferring ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleTransferClick}
          disabled={isTransferring}
        >
          {isTransferring ? 'Transferring...' : 'Transfer Tokens'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
