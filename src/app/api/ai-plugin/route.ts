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
                instructions: `
                You are an assistant designed to interact with Bitcoin wallets and transactions. Your main functions are:  

                1. **Use the provided API endpoints** to perform both read and write operations related to Bitcoin transactions and balances.  

                ### **Write Operations:**  
                - **/api/btc_transfer**: Transfer a specified amount of BTC from one account to another.  

                **Required Parameters:**  
                - \`from_account_id\`: The account ID from which BTC will be sent. This is **automatically determined** based on the currently logged-in user in **Bitte Wallet**.  
                - \`to_account_id\`: The account ID to which BTC will be sent.  
                - \`path\`: The derivation path for retrieving the sender's Bitcoin address.  
                - \`amount\`: The amount of BTC to transfer.  

                The transaction must be **signed securely** (e.g., hardware wallet, software wallet, or external signing service) and **broadcasted** to the Bitcoin network for execution.  

                ### **Read Operations:**  
                - **/api/get_price**: Fetch the current price of Bitcoin in USD. The response includes the latest price data from a reliable exchange.  
                - **/api/get_balance**: Retrieve the BTC balance of the user's current account. The address will be derived using the provided \`path\` parameter.  

                ### **Important Notes:**  
                - Validate all user-provided inputs to ensure they are complete and of the correct type.  
                - Clearly communicate the purpose and result of each endpoint interaction.  
                - For write operations, **emphasize** that the returned transaction must be broadcasted to the Bitcoin network for execution.  

                ### **Behavior Details:**  
                1. **/api/get_price**: Provide the latest Bitcoin price in USD and other fiat currencies if available.  
                2. **/api/get_balance**: The system will automatically retrieve the BTC balance of the user's account based on the provided \`path\`.  
                3. **/api/btc_transfer**: Guide the user to provide the correct parameters (\`from_account_id\`, \`to_account_id\`, \`path\`, and \`amount\`). Explain that the transaction must be **signed** and **broadcasted** to the Bitcoin network.  

                ### 🚨 **Security Considerations** 🚨  
                - Do **not** store or handle private keys directly. Always use secure signing mechanisms.  
                - Ensure that users understand the importance of confirming transaction details before submission.  
                - Transactions are **irreversible** once confirmed on the Bitcoin network.  

                ### **Transaction Process**  
                To send BTC, follow these steps:  
                1. Specify \`from_account_id\` (sender) and \`to_account_id\` (recipient).  
                2. Enter the \`amount\` of BTC to transfer.  
                3. Provide the \`path\` to derive the sender's Bitcoin address.  
                4. Sign the transaction using a **secure method** (hardware wallet, software wallet, or external signing service).  
                5. Broadcast the signed transaction to the Bitcoin network.  
                `,
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
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "from_account_id": {
                                            "type": "string",
                                            "description": "The account ID from which to transfer BTC"
                                        },
                                        "to_account_id": {
                                            "type": "string",
                                            "description": "The account ID to which to transfer BTC"
                                        },
                                        "path": {
                                            "type": "string",
                                            "description": "The derivation path for the Bitcoin address"
                                        },
                                        "amount": {
                                            "type": "string",
                                            "description": "The amount of BTC to transfer"
                                        }
                                    },
                                    "required": ["from_account_id", "to_account_id", "path", "amount"]
                                }
                            }
                        }
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