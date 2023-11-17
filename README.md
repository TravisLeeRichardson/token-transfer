#



# Transfer ERC20 Tokens using DevNets!

## To Run Tests
```
npx hardhat test --network hardhat
```

## Setup, Install & Run:

1. Deploy Contract To Sepolia
 ```
cd hardhat
npx hardhat run scripts/deployToken.ts --network sepolia
```

2. Copy the resulting erc20 contract deployment address and spin up a new DevNet using this YAML file (replace the erc20 contract addresss with the one you deployed):
```
# Learn how to configure DevNet templates using YAML here: https://docs.tenderly.co/devnets/yaml-template


version: v0
template:
  name: erc20tokentransfer
  block-number: latest
  visibility: TEAM
  network-id: 11155111
  execution:
    chain-config:
      chain-id: 11155111
    block-gas-limit: 10000000
    base-fee-per-gas: 1000000000

balances:
    # Give deployer some ETH
    - address: 0xC305f4b9925b9eC6b3D0FCC42B7b22F1245A5011
      amount: 1000000000000000000

erc20:
    # My Token
    - contract: 0x1756a8D1f35CC5B97cc1237F82254CF466dbC83f 
      balances: 
        # Give deployer, some MTK (MyToken)
        - address: 0xC305f4b9925b9eC6b3D0FCC42B7b22F1245A5011
          amount: 10000000000000000000 
display-name: erc20TokenTransfer
```

3. Spawn a new DevNet using the Tendelry Dashboard.

4. Copy the DevNet URL and paste into index.tsx and hardhat.config.ts. (Alternatively you can paste into the GUI "Current Network" field.)

5. Also open MM and create a new network with the DevNet URL. ChainID 11155111 (sepolia).

6. Create 2 new dummy accounts in MM for sender and receiver. Record the PUBLIC addresses for each of the two wallets, and record the PRIVATE keys for both of the accounts, as you will use them later.

7. Also in MM, import the custom token by adding the token contract address. Do this for both the sender and receiver accounts you just created.

8. Paste the deployed contract address from step 2 into index.tsx as well. This should be the contract on Sepolia. (Alternatively, use the GUI to paste the contract address into the "Current Token Contract Address" field)

9. Edit the two public addresses of the sender and receiver you wish to test (the sender is the wallet you deployed from) in index.tsx. (Alternatively, use the GUI and paste the sender public address into the "Current Sender" field and paste the redeiver public address intot he "Current Receiver" field.)

11.  Run the front end by executing the folllowing:
```
cd ../pages
npm run dev
```

13. Navigate to https://tenderly-faucet.vercel.app/ and use the Tenderly faucet to give both the sender account as well as the receiver account some ETH for gas.  (Copy and paste the wallet addresses as well as the DEVNET RPC URL and give each 1 eth-> 1000000000000000000 in wei)

14. Navigate to localhost:3000.

15. Enter 1 in the Amount To Send field.

16. Click Approve.

17. Click Transfer.

18. Open up MM and check that the sender account is decremented by 1 TOK, and the receiver account is incremented by 1 TOK. Should be 999 TOK for sender now and 1 TOK for receiver.

19. Now transfer the 1 TOK back to the sender. Reverse the sender and receiver addresses in the GUI. Enter the private key for the sender (the "old" receiver is now the "new" sender, so this is the old receivers private key)

20. Repeat steps 15-17.

NOTE: Every time you spin up a new DevNet (They have a 90 minute expiry) you need to do the following:
--Copy and Paste the new DEVNET RPC URL into the index.tsx file. (Alternatively, paste it into the GUI's "Current Network" field)
--Copy and Paste the new DEVNET RPC URL into MetaMask as a new Network, then change your Metamask to that network.

NOTE: If you redploy your token.sol contract (or maybe you'd like to experiment with using your own custom ERC20 contract) for any reason, you will need to execute the above steps again.

NOTE: If you try and Approve or Send, and you receive an error dialog, that means you simply need to respawn a new DEVNET and place the RPC URL in the appropriate field on the page.

NOTE: We have included code in the deployToken.ts script to automatically take the resulting .json, post-deployment, and send it to the front-end. This means that the front-end should will immediately have access to the newly deployed contract upon refreshing localhost:3000.

CREDITS:
Token.sol was taken from Dapp University public GitHub Repo here: https://github.com/dappuniversity/erc20_live_coding/blob/main/Token.sol

