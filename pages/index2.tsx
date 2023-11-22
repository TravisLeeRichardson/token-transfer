import { ethers } from "ethers";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import token from '../pages/abi/Token.json';
import * as dotenv from "dotenv";
import { create } from "domain";
dotenv.config();

const Home = () => {
   
    const myTokenAddress = "0x1756a8D1f35CC5B97cc1237F82254CF466dbC83f";
    //const myRPCUrl = "https://sepolia.gateway.tenderly.co/7e3xV20O5VnxjBOvKb0wYy";

    // State variables
    const [selectedNetwork, setSelectedNetwork] = useState("Tenderly Sepolia");
    const [tokenAddress, setTokenAddress] = useState<string>(myTokenAddress);
    const [providerUrl, setProviderUrl] = useState<string>('');
    const [newSenderWallet, setNewSenderWallet] = useState<ethers.Wallet | null>(null);
    const [newReceiverWallet, setNewReceiverWallet] = useState<ethers.Wallet | null>(null); 
    const [newProvider, setNewProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);
  
    const [senderBalance, setSenderBalance] = useState<string>('');
    const [receiverBalance, setReceiverBalance] = useState<string>('');
    const [isTransferring, setIsTransferring] = useState<boolean>(false);
    const [isApproving, setIsApproving] = useState<boolean>(false);
    const [allowance, setAllowance] = useState<string>('0');
    const [sendAmount, setSendAmount] = useState<number>(0);
    const [networkName, setNetworkName] = useState<string>('');
    const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
   
    const [showModal, setShowModal] = useState(false);


    const createNewWallet = async (isSender: boolean): Promise<ethers.Wallet> => {
      const newWallet: ethers.Wallet = ethers.Wallet.createRandom();
      if (newProvider) {
      if (isSender) {
          setNewSenderWallet(newWallet.connect(newProvider));
      } else {
          setNewReceiverWallet(newWallet.connect(newProvider));
      } 
    
  }  else {

    if (isSender) {
      setNewSenderWallet(newWallet);
  } else {
      setNewReceiverWallet(newWallet);
  } 


  }

  return newWallet; 
  };

  
/*   const setDevNet2 = async (network: string) => {
    if (network !== '') {
    console.log("🔗 Connecting to Provider at URL...", network);
    const provider = new ethers.providers.JsonRpcProvider(network);
    setNewProvider(provider);
  
    if (newSenderWallet) {
    // Create the token contract with the connected sender wallet
    const newTokenContract = new ethers.Contract(tokenAddress, token.Token.abi, newSenderWallet);
    setTokenContract(newTokenContract);
    console.log("✅ Connected to Token Contract");
    } }
  }; */
  

  const setDevNet = async (network: string) => {
    if (network !== '') {
    console.log("🔗 Connecting to Provider at URL...", network);
    const provider = new ethers.providers.JsonRpcProvider(network);
    setNewProvider(provider);
  
    if (newSenderWallet) {
    // Create the token contract with the connected sender wallet
    const newTokenContract = new ethers.Contract(tokenAddress, token.Token.abi, newSenderWallet);
    setTokenContract(newTokenContract);
    console.log("✅ Connected to Token Contract");
    } }
  };
  
  // Ensure that this function is called appropriately in your component, such as in a useEffect or in response to user input

// check if wallet balances change every one second
const refreshBalances = async () => {
  try {
      if (newSenderWallet && newReceiverWallet && tokenContract) {

         console.log("📡 Refreshing balances..."); 
          let senderBalance = await tokenContract.balanceOf(newSenderWallet.address);
          let receiverBalance = await tokenContract.balanceOf(newReceiverWallet.address);

          console.log("Sender balance before transfer:", ethers.utils.formatUnits(senderBalance, 18), "for sender wallet:", newSenderWallet.address );
          console.log("Receiver balance before transfer:", ethers.utils.formatUnits(receiverBalance, 18));
          console.log("current network is:", ((await tokenContract.provider.getNetwork()).name));

          setSenderBalance(ethers.utils.formatUnits(senderBalance, 18));
          setReceiverBalance(ethers.utils.formatUnits(receiverBalance, 18));
          console.log("Sender balance after transfer:", ethers.utils.formatUnits(senderBalance, 18)); 
          console.log("Receiver balance after transfer:", ethers.utils.formatUnits(receiverBalance, 18));
      }
  } catch (error) {
      console.error("Error refreshing wallets and/or contracts:", error); 
  }
};


useEffect(() => {
  const interval = setInterval(refreshBalances, 10000); // Refresh every 1000 milliseconds (1 second)
  return () => clearInterval(interval); // Clear interval on component unmount
}, [newSenderWallet, newReceiverWallet, tokenContract]);
    type ErrorModalProps = {
      isOpen: boolean;
      onClose: () => void;
    };
function ErrorModal({ isOpen, onClose }: ErrorModalProps) {
  return isOpen ? (
      <div className="fixed inset-0 bg-purple-200 bg-opacity-50 flex justify-center items-center">
          <div className="bg-black text-white p-8 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Error</h2>
              <p className="mb-6">Network Error. Check Your "Current Network" Field and/or Respawn a DevNet.</p>
              <button 
                  onClick={onClose}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded border-4 border-white"
              >
                  OK
              </button>
          </div>
      </div>
  ) : null;
}

/* 
what allowance and approve are doing really?
Let's assume we have user A and user B. A has 1000 tokens and want to give permission to B to spend 100 of them.
A will call approve(address(B), 100, {"from": address(A)})
B will check how many tokens A gave him permission to use by calling: allowance(address(A), address(B))
B will send to his account these tokens by calling: transferFrom(address(A), address(B), 100, {"from": address(B)})
 */
    const handleApproveClick = async () => {
        try {
            setIsApproving(true);
            console.log("Approving...", newSenderWallet?.address);
            console.log("Balance of sender before approval:", ethers.utils.formatUnits(await tokenContract?.balanceOf(newSenderWallet?.address), 18));
            let approveTx = await tokenContract?.approve(newSenderWallet?.address, ethers.utils.parseUnits(sendAmount.toString(), 18));
            await approveTx.wait();
           
            const allowance = await tokenContract?.allowance(newSenderWallet?.address,  newSenderWallet?.address); //owner/spender
            setAllowance(ethers.utils.formatUnits(allowance, 18));
            console.log("Allowance Granted:", ethers.utils.formatUnits(allowance, 18));

            setIsApproving(false);
            console.log("Approved for send.");
        } catch (error) {
            setIsApproving(false);
            console.error("Approve failed:", error);

             // Pop Error Reminding User about DevNet Needing spawning
             if (error instanceof Error && error.message.includes("could not detect network")) {
              setShowModal(true); // Show modal on this specific error
        }
    };};

    const handleSendClick = async () => {
        try {
            setIsTransferring(true);

            const allowance = await tokenContract?.allowance(newSenderWallet?.address, newSenderWallet?.address);
            setAllowance(ethers.utils.formatUnits(allowance, 18));
            console.log("Allowance Granted:", ethers.utils.formatUnits(allowance, 18));

            if (sendAmount <= allowance) {
                let senderBalance = await tokenContract?.balanceOf(newSenderWallet?.address);
                let receiverBalance = await tokenContract?.balanceOf(newReceiverWallet?.address);
                setSenderBalance(ethers.utils.formatUnits(senderBalance, 18));
                setReceiverBalance(ethers.utils.formatUnits(receiverBalance, 18));
                console.log("Sender balance before transfer:", ethers.utils.formatUnits(senderBalance, 18));
                console.log("Receiver balance before transfer:", ethers.utils.formatUnits(receiverBalance, 18));

                if (sendAmount <= senderBalance) {
                    console.log("Sending...", ethers.utils.parseUnits(sendAmount.toString(), 18));
                    const tx = await tokenContract?.transferFrom(newSenderWallet, newReceiverWallet, ethers.utils.parseUnits(sendAmount.toString(), 18));
                    await tx.wait();
                    setIsTransferring(false);
                    console.log("Send complete.");

                    // Get the new balances and dsiplay them to the user
                    senderBalance = await tokenContract?.balanceOf(newSenderWallet);
                    receiverBalance = await tokenContract?.balanceOf(newReceiverWallet);
                    setSenderBalance(ethers.utils.formatUnits(senderBalance, 18));
                    setReceiverBalance(ethers.utils.formatUnits(receiverBalance, 18));
                    console.log("Sender balance after transfer:", ethers.utils.formatUnits(senderBalance, 18));
                    console.log("Receiver balance after transfer:", ethers.utils.formatUnits(receiverBalance, 18));
                }
            }
        } catch (error) {

            setIsTransferring(false);
            console.error("Transfer failed:", error);

             // Pop Error Reminding User about DevNet Needing spawning
             if (error instanceof Error && error.message.includes("could not detect network")) {
              setShowModal(true); // Show modal on this specific error
          } 
        }
    };


    return (
      
      <div className="bg-tenderlyPurple flex flex-col items-center justify-center min-h-screen py-2">
        <ErrorModal isOpen={showModal} onClose={() => setShowModal(false)} />
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
                <div className="border-4 border-purple-800 rounded-lg p-4 bg-white">
                    <h3 className="text-lg font-bold mb-2">Sender Wallet</h3>
                    <p>Address: {newSenderWallet?.address}</p>
                    <p>Balance: {senderBalance}</p>
                    <button 
                        onClick={() => createNewWallet(true)}
                        className="mt-2 border-4 border-white bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Create New Sender Wallet
                    </button>
                </div>

                {/* Receiver Wallet */}
                <div className="border-4 border-purple-800 rounded-lg p-4 bg-white">
                    <h3 className="text-lg font-bold mb-2">Receiver Wallet</h3>
                    <p>Address: {newReceiverWallet?.address}</p>
                    <p>Balance: {receiverBalance}</p>
                    <button 
                        onClick={() => createNewWallet(false)}
                        className="mt-2 border-4 border-white bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Create New Receiver Wallet
                    </button>
                </div>
            </div>

          <div className="mb-12"></div>

{/* Network Info */}
<div className="mb-4 w-1/2 flex justify-between items-center">
    <div>
      <input
        type="text"
        value={providerUrl}
        onChange={(e) => setProviderUrl(e.target.value)}
        className="border-4 border-purple-800 text-black p-2 rounded w-full"
        placeholder="Enter DevNet URL"
      />
    </div>
    <button
      onClick={() => setDevNet(providerUrl)}
      className="border-4 border-white bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Connect to Network
    </button>
  </div>


        

                 {/* Send Amount */}
                <div className="mb-4 w-1/2">
                     
                <input
                  type="text"
                  onChange={(e) => setSendAmount(e.target.value === '' ? 0 : Number(e.target.value))}
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