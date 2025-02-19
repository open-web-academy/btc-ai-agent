# HAT Coin Agent

This API provides various endpoints related to managing auctions, transferring tokens to a vault, and retrieving token metadata from Ref.Finance. Through these endpoints, users can transfer tokens, claim a vault, start or place a bid in an auction, claim tokens from an auction, and fetch token details.

#### Endpoints

- **Token Metadata** `GET` `/api/token/{token}`
   - Retrieves token metadata from Ref.Finance. Token identifiers can be the name, symbol, or `contractId`, and fuzzy matching will be performed automatically.

- **Swap Transactions** `GET` `/api/swap/{tokenIn}/{tokenOut}/{quantity}`
   - Retrieves a transaction for swapping between two tokens using the best available trading route on Ref.Finance. Token identifiers can be provided as name, symbol, or `contractId`.

- **Transfer Tokens to Vault** `POST` `/api/ft_transfer_call`
   - Transfers a specified amount of HAT tokens to a vault and increases its deposit.

- **Claim Vault** `POST` `/api/claim_vault`
   - Allows users to claim a vault by providing the vault's index.

- **Start or Place Bid in Auction** `POST` `/api/start_or_place_bid`
   - Starts a new auction or places a bid in an existing auction.

- **Claim Tokens from Auction** `POST` `/api/claim_tokens`
   - Allows users to claim their tokens from an auction.

### Installation

```bash
# Get key bitte
https://key.bitte.ai/

# Install dependencies
pnpm i

# Start the development server
pnpm dev
```
