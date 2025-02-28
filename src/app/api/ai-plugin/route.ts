import { ACCOUNT_ID, PLUGIN_URL } from "@/app/config";
import { NextResponse } from "next/server";

export async function GET() {
    const pluginData = {
        openapi: "3.0.0",
        info: {
            title: "BTC API",
            description: "API to interact with BTC",
            version: "1.0.0",
        },
        servers: [
            {
                url: PLUGIN_URL,
            },
        ],
        "x-mb": {
            "account-id": ACCOUNT_ID,
            assistant: {
                name: "BTC Assistant",
                description: "An assistant for interacting with BTC",
                instructions: "You are an assistant designed to interact with Bitcoin wallets and transactions. Your main functions are: 1. Use the provided API endpoints to perform both read and write operations related to Bitcoin transactions and balances. Write Operations: - /api/transfer: Transfer a specified amount of BTC from one Bitcoin address to another. The amount parameter must be provided as a valid string number, and the sender's address, recipient's address, and private key (or signing mechanism) must be specified. Inform the user that this operation generates a transaction that must be broadcasted to the Bitcoin network. Read Operations: - /api/get_price: Fetch the current price of Bitcoin in USD. The response includes the latest price data from a reliable exchange. - /api/get_balance: Retrieve the BTC balance of the user's current account. The address will automatically be taken from the logged-in user's session in Bitte Wallet. Important Notes: - Validate all user-provided inputs to ensure they are complete and of the correct type. - Clearly communicate the purpose and result of each endpoint interaction. - For write operations, emphasize that the returned transaction must be broadcasted to the Bitcoin network for execution. - Avoid using special characters or incorrect formatting in the parameters to prevent issues with transactions. Behavior Details: 1. When interacting with the /api/get_price endpoint, provide the latest Bitcoin price in USD and other fiat currencies if available. 2. For the /api/get_balance endpoint, the system will automatically Retrieve the BTC balance of the user's current account. The address will automatically be taken from the logged-in user's session in Bitte Wallet. Additionally, **this operation now requires the user to provide the `path` parameter to derive the Bitcoin address, this path is a string and take any string**. 3. For the /api/transfer, guide the user to provide a valid sender address, recipient address, and amount in BTC. Explain that the transaction must be signed and broadcasted to the Bitcoin network. Restrictions: 🚨 Security Considerations 🚨 - Do not store or handle private keys directly. Always use secure signing mechanisms. - Ensure that users understand the importance of confirming transaction details before submission. - Transactions are irreversible once confirmed on the Bitcoin network. Transaction Process - To send BTC, follow these steps: 1. Specify the sender's Bitcoin address and recipient's Bitcoin address. 2. Enter the amount of BTC to transfer. 3. Sign the transaction using a secure method (hardware wallet, software wallet, or external signing service). 4. Broadcast the signed transaction to the Bitcoin network. - Ensure the user understands that transaction fees may apply and will be deducted from the sender's balance.",
                tools: [{ type: "generate-transaction" }, { type: "generate-evm-tx" }, { type: "sign-message" }],
                image: "",
                categories: ["defi"],
            },
        },
        paths: {
            // Consultar el precio actual del Bitcoin
            "/api/btc_price": {
                get: {
                    tags: ["Bitcoin"],
                    summary: "Get the current price of Bitcoin",
                    description: "This endpoint retrieves the current price of Bitcoin in USD.",
                    operationId: "get_btc_price",
                    responses: {
                        "200": {
                            description: "Successful response with the current Bitcoin price",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            price: {
                                                type: "number",
                                                description: "The current price of Bitcoin in USD",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

            // Consultar el balance de una cuenta
            "/api/btc_balance": {
                get: {
                    tags: ["Bitcoin"],
                    summary: "Get the BTC balance of an account",
                    description: "This endpoint retrieves the BTC balance of a specified account by account_id.",
                    operationId: "get_btc_balance",
                    parameters: [
                        {
                            name: "account_id",
                            in: "query",
                            description: "The account ID for which to retrieve the BTC balance",
                            required: true,
                            schema: {
                                type: "string",
                            },
                        },
                        {
                            "name": "path",
                            "in": "query",
                            "description": "The path to be used for deriving the address",
                            "required": true,
                            "schema": {
                                "type": "string"
                            }
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Successful response with the BTC balance",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            balance: {
                                                type: "string",
                                                description: "The BTC balance of the account",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

            // Transferir BTC de una cuenta a otra
            "/api/btc_transfer": {
                post: {
                    tags: ["Bitcoin"],
                    summary: "Transfer BTC from one account to another",
                    description: "This endpoint allows you to transfer BTC from one account to another.",
                    operationId: "transfer_btc",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        from_account_id: {
                                            type: "string",
                                            description: "The account ID from which to transfer BTC",
                                        },
                                        to_account_id: {
                                            type: "string",
                                            description: "The account ID to which to transfer BTC",
                                        },
                                        amount: {
                                            type: "string",
                                            description: "The amount of BTC to transfer",
                                        },
                                    },
                                    required: ["from_account_id", "to_account_id", "amount"],
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "Successful response with the transaction details",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            transaction_id: {
                                                type: "string",
                                                description: "The ID of the BTC transfer transaction",
                                            },
                                            status: {
                                                type: "string",
                                                description: "The status of the transaction",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }
    };

    return NextResponse.json(pluginData);
}