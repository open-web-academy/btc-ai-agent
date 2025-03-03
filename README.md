# BTC Agent

This API provides various endpoints related to know the bitcoin price, know the bitcoin balance related to a derivation path and transfer bitcoin using chain signatures with chain abstraction. 

#### Endpoints

- **BTC Price** `GET` `/api/btc_price`
   - Retrieves the current price of Bitcoin in USD.

- **BTC Balance** `GET` `/api/btc_balance/{account_id}/{path}`
   - Retrieves the BTC balance of a specified account by `account_id` and a derivation path.

- **Transfer BTC from one account to another** `POST` `/api/btc_transfer`
   - Transfers BTC from one account to another using chain signatures with chain abstraction.

### Installation

```bash
# Get key bitte (add to .env file BITTE_API_KEY="bitte_KEY")
https://key.bitte.ai/

# Install dependencies
pnpm i

# Start the development server
pnpm dev
```
