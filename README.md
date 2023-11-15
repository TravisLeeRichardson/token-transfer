#



# Transfer ERC20 Tokens using DevNets!

## How to install:

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

3. Spawn a DevNet using the Tendelry Dashboard.

4. Copy the DevNet URL and paste into index.tsx and hardhat.config.ts.

5. Also open MM and create a new network with the DevNet URL.

7. Also in MM, add the token contract address as a custom token. Do this for both the sender and receiver accounts.

8. Paste the deployed contract address from step 2 into index.tsx as well. This should be the contract on Sepolia. 

9. Edit the two public addresses of the sender and receiver you wish to test (the sender is the wallet you deployed from) in index.tsx.

11.  Run the front end
```
cd ../pages
npm run dev
```
12. In your brower, open up localhost:3000. Click the Transfer Button.

13. Open up MM and check that the sender account is decremented by 1 TOK, and the receiver account is incremented by 1 TOK. Should be 999 TOK for sender now and 1 TOK for receiver.

NOTE: Every time you spin up a new DevNet (They have a 90 minute expiry) you need to do the following:
--Copy and Paste the new DEVNET RPC URL into the index.tsx file.
--Copy and Paste the new DEVNET RPC URL into MetaMask as a new Network, then change your Metamask to that network.

NOTE: If you redploy your token.sol contract for any reason, in addition, you will need to update your YAML file with the new contract address, update the index.tsx with the new contract address, then respawn a DevNet and do what the previous note says.

CREDITS:
Token.sol was taken from Dapp University public GitHub Repo here: https://github.com/dappuniversity/erc20_live_coding/blob/main/Token.sol

