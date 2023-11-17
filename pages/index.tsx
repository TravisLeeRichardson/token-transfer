import { ethers } from "ethers";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import token from '../pages/abi/Token.json';
import * as dotenv from "dotenv";
dotenv.config();

const Home = () => {

    // Variables to be used in the app
    const myWallet1Address = '0xC305f4b9925b9eC6b3D0FCC42B7b22F1245A5011';
    const myWallet2Address = '0xdb623c0F74d4ed5af4B254327147c4aC7E5d3fAC';
    const myWallet1PrivateKey ='fa5568408b1f994003a17d4c91a7b2a71d7ea1175e035753167226c62e0f4db5';
    const myWallet2PrivateKey ='ba006e33f250b15f5e276081b16c87c0769d08ec528ac50e0467cd83cd4ae1a6';
    const myTokenAddress = "0x1756a8D1f35CC5B97cc1237F82254CF466dbC83f";
    const myRPCUrl = "https://sepolia.gateway.tenderly.co/7e3xV20O5VnxjBOvKb0wYy";

    // State variables
    const [tokenAddress, setTokenAddress] = useState<string>(myTokenAddress);
    const [providerUrl, setProviderUrl] = useState<string>(myRPCUrl);
    const [privateKey, setPrivateKey] = useState<string>(myWallet1PrivateKey);
    const [senderAddress, setSenderAddress] = useState<string>(myWallet1Address);
    const [receiverAddress, setReceiverAddress] = useState<string>(myWallet2Address);
    const [senderBalance, setSenderBalance] = useState<string>('');
    const [receiverBalance, setReceiverBalance] = useState<string>('');
    const [isTransferring, setIsTransferring] = useState<boolean>(false);
    const [isApproving, setIsApproving] = useState<boolean>(false);
    const [allowance, setAllowance] = useState<string>('0');
    const [approveAmount, setApproveAmount] = useState<string>('0');
    const [sendAmount, setSendAmount] = useState<number>(0);
    const [networkName, setNetworkName] = useState<string>('');
    const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
    const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);
    const [wallet, setWallet] = useState<ethers.Wallet | null>(null);

    // Use Effect to set up the provider, wallet, and token contract
  useEffect(() => {
    const newProvider = new ethers.providers.JsonRpcProvider(providerUrl);
    setProvider(newProvider);
    const newWallet = new ethers.Wallet(privateKey, newProvider);
    setWallet(newWallet);
    const newTokenContract = new ethers.Contract(tokenAddress, token.Token.abi, newWallet);
    setTokenContract(newTokenContract);

    const fetchBalances = async () => {
        try {
            let balance = await newTokenContract.balanceOf(senderAddress);
            setSenderBalance(ethers.utils.formatUnits(balance, 18));
            balance = await newTokenContract.balanceOf(receiverAddress);
            setReceiverBalance(ethers.utils.formatUnits(balance, 18));
        } catch (error) {
            console.error("Error fetching sender balance:", error);
        }
    };

    fetchBalances();

    if (providerUrl.includes('sepolia')) setNetworkName('Sepolia-Tenderly');
    else if (providerUrl.includes('devnet')) setNetworkName('Tenderly DevNet');
    else setNetworkName('Invalid Network');
  }, [providerUrl, privateKey, tokenAddress]);

  // Handle the Approve button click
  const handleApproveClick = async () => {
    
    try {
      // Approve the senderAddress to spend tokens
      setIsApproving(true);
      console.log("Approving...");
      let approveTx = await tokenContract.approve(senderAddress, ethers.utils.parseUnits(sendAmount.toString(), 18)); //send amount is in wei
      await approveTx.wait();
      setApproveAmount(ethers.utils.formatUnits(sendAmount, 18));

      const allowance = await tokenContract.allowance(senderAddress, senderAddress); // Owner = Spender
       setAllowance(ethers.utils.formatUnits(allowance, 18));
       console.log("Allowance Granted:", ethers.utils.formatUnits(allowance, 18));

      setIsApproving(false);
      console.log("Approved for send.");
    } catch (error) {
      setIsApproving(false);
      console.error("Approve failed:", error);
    }
  };

  // Handle the Send button click
  const handleSendClick = async () => {
    
    try {
        setIsTransferring(true);

       // Check Allowance
       const allowance = await tokenContract.allowance(senderAddress, senderAddress); // Owner = Spender
       setAllowance(ethers.utils.formatUnits(allowance, 18));
       console.log("Allowance Granted:", ethers.utils.formatUnits(allowance, 18));

       if (allowance < sendAmount) {
         console.log("Approving...");
         handleApproveClick();
       }

       if (allowance >= sendAmount) {
            
            // Get the wallet balances before the send
            let senderBalance = await tokenContract.balanceOf(senderAddress);
            let receiverBalance = await tokenContract.balanceOf(receiverAddress);
            setSenderBalance(ethers.utils.formatUnits(senderBalance, 18));
            setReceiverBalance(ethers.utils.formatUnits(receiverBalance, 18));
            console.log("Sender balance before transfer:", ethers.utils.formatUnits(senderBalance, 18));
            console.log("Receiver balance before transfer:", ethers.utils.formatUnits(receiverBalance, 18));

            if (senderBalance >= sendAmount) {

                // Send the allowed tokens
                console.log("Sending...",  ethers.utils.parseUnits(sendAmount.toString(), 18));
                const tx = await tokenContract.transferFrom(senderAddress, receiverAddress, ethers.utils.parseUnits(sendAmount.toString(), 18)); 
                await tx.wait();
                console.log("Send complete.");

                // check balances after the send
                senderBalance = await tokenContract.balanceOf(senderAddress);
                receiverBalance = await tokenContract.balanceOf(receiverAddress);
                setSenderBalance(ethers.utils.formatUnits(senderBalance, 18));
                setReceiverBalance(ethers.utils.formatUnits(receiverBalance, 18));
                console.log("Sender balance after transfer:", ethers.utils.formatUnits(senderBalance, 18));
                console.log("Receiver balance after transfer:", ethers.utils.formatUnits(receiverBalance, 18));
                }
        }

    } catch (error) {
      setIsTransferring(false);
      setIsApproving(false);
      console.error("Transfer failed:", error);
    } finally {
      setIsTransferring(false);
      setIsApproving(false);
    }
  };

  
    return (
        <div className="bg-tenderlyPurple flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Token Transfer</title>
        <link rel="icon" href="/tenderly-logo-2.webp" />
      </Head>
        <h1 className="text-8xl font-bold text-center">
        <span className="to-blue-500 bg-clip-text">
            Token Transfer 💰
           
        </span>
        </h1>
        <h3 className="mt-8 mb-24 text-4xl text-white">
            Send An ERC20 Token Using a Tenderly DevNet
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {/* Sender Wallet */}
            <div className="border-4 border-purple-800 rounded-lg p-4 bg-white max-h-32">
                <h3 className="text-lg font-bold mb-2">Sender Wallet</h3>
                <p>Address: {senderAddress}</p>
                <p>Balance: {senderBalance}</p>
            </div>
            {/* Receiver Wallet */}
            <div className="border-4 border-purple-800 rounded-lg p-4 bg-white max-h-32">
                <h3 className="text-lg font-bold mb-2">Receiver Wallet</h3>
                <p>Address: {receiverAddress}</p>
                <p>Balance: {receiverBalance}</p>
            </div>
        </div>

         <div className="mb-12"></div>
   
    
        {/* Transaction Center */}

 {/* Sender Info */}
 <div className="mb-4 w-1/2">
                  <p>Current Sender: {senderAddress}</p>
                  <input
                    type="text"
                    onChange={(e) => setSenderAddress(e.target.value) }
                    className="border-4 border-purple-800 text-black p-2 rounded w-1/2"
                    placeholder="Input Sender Wallet Address here"
                  />
                </div>

                 {/* Receiver Info */}
 <div className="mb-4 w-1/2">
                  <p>Current Receiver: {receiverAddress}</p>
                  <input
                    type="text"
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    className="border-4 border-purple-800 text-black p-2 rounded w-1/2"
                    placeholder="Input Receiver Wallet Address here"
                  />
                </div>

                  {/* Private Key - Consider removing for security */}
                  <div className="mb-4 w-1/2">
                <p>Current Sender Private Key: {privateKey}</p>
                <input
                  type="text"
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="border-4 border-purple-800 text-black p-2 rounded w-1/2"
                  placeholder="Enter Dummy Private Key of SENDER Wallet here. DO NOT USE REAL ASSETS!!!!"
                />
                </div>

                {/* Network Info */}
                <div className="mb-4 w-1/2">
                  <p>Current Network: {providerUrl}</p>
                  <input
                    type="text"
                    onChange={(e) => setProviderUrl(e.target.value)}
                    className="border-4 border-purple-800 text-black p-2 rounded w-1/2"
                    placeholder="Input Network RPC URL here. (Either Sepolia or DevNet)"
                  />
                </div>
    
                 {/* Token Contract Address */}
                <div className="mb-4 w-1/2">
                <p>Current Token Contract Address: {tokenAddress}</p>
                <input
                  type="text"
                  
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="border-4 border-purple-800 text-black p-2 rounded w-1/2"
                  placeholder="Input Token Contract Address here"
                />
                </div>
    
                 {/* Send Amount */}
                <div className="mb-4 w-1/2">
                <p>Amount To Send: {sendAmount}</p>            
                <input
                  type="text"
                  onChange={(e) => setSendAmount(Number(e.target.value))}
                  className="border-4 border-purple-800 text-black p-2 rounded w-40 mb-4"
                  placeholder="Amount to Send"
                
                />
    </div>            
    
                {/* Buttons */}
                <div className="flex flex-col items-center justify-center">

                <p className="mt-4 text-white font-bold py-2 px-4 rounded mb-4">Please Approve Prior to Sending</p>

                <button 
                  style= {{ width: '200px' }} 
                  onClick={handleApproveClick}
                  disabled={isApproving}
                  className="border-4 border-white bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
                >
                  {isApproving ? 'Approving...' : 'Approve'}
                </button>
                
                </div>

                <div className="flex flex-col items-center justify-center">
                <p className="mt-4 text-white font-bold py-2 px-4 rounded mb-4">Sender Approved To Send: {allowance}</p>
    
                <button
                  style= {{ width: '200px' }} 
                  onClick={handleSendClick}
                  disabled={isTransferring}
                  className="border-4 border-white bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
                >
                  {isTransferring ? 'Sending...' : 'Send'}
                </button>
</div>
               
              </div>
           
        
        
      );
    };

export default Home;
