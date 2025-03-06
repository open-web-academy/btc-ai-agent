# BTC Agent

This API provides various endpoints related to know the bitcoin price, know the bitcoin balance related to a derivation path and transfer bitcoin using chain signatures with chain abstraction. 

#### Endpoints

- **BTC Price** `/api/btc_price`
   - Retrieves the current price of Bitcoin in USD.

- **BTC Account** `/api/btc_account`
   - Retrieves the Bitcoin account information associated with your NEAR account.

- **BTC Balance** `/api/btc_balance`
   - Retrieves the BTC balance of a specified account by `account_id` and a derivation path.

- **Generate MPC Transaction for Bitcoin Testnet** `/api/btc_create_mpc_txn`
   - Creates a NEAR txn that utilizes near chain signatures to send transaction on bitcoin testnet

- **Relay/Send the signed BTC testnet transaction** `/api/btc_send_mpc_txn`
   - Send the signed transaction to the BTC testnet for sending tokens.

### Installation

```bash
# Get key bitte (add to .env file BITTE_API_KEY="bitte_KEY")
https://key.bitte.ai/

# Install dependencies
pnpm i

# Start the development server
pnpm dev
```
