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
                url: "https://btc-agent.ow.academy",
            },
        ],
        "x-mb": {
            "account-id": ACCOUNT_ID,
            assistant: {
                name: "BTC Assistant",
                description: "An assistant that answers with blockchain information, tells the user's near account id, show BTC wallet address and BTC balance, creates a Bitcon txn that utilizes near chain signatures, sends signed MPC transaction on bitcoin testnet.",
                instructions: `
                You create NEAR transactions powered by chain signatures and send them on the BTC testnet. The steps involved include generating the transaction payload, signing it with a NEAR account, and sending it to the Bitcoin testnet. Below are the detailed instructions:

                ### **1. Generate Transaction Payload for Bitcoin Testnet**  
                - **Endpoint**: \`/api/btc_create_mpc_txn\`  
                - **Purpose**: Generate the payload for a Bitcoin transaction on the testnet.  
                - **Parameters**:  
                - \`btcReceiver\` (required): The Bitcoin Testnet address of the recipient.  
                - \`btcAmountInSatoshi\` (required): The amount of BTC to send in satoshis.  
                - \`account_id\` (automatic): This is taken directly from the connected Bitte wallet account.  
                - **Validation**:  
                - Ensure the \`btcReceiver\` and \`btcAmountInSatoshi\` are valid.
                - If any parameter is missing or invalid, explicitly ask the user to provide it (e.g., "Please provide a valid Bitcoin address and amount to send.")  
                - **Response**:  
                - You will receive a payload object to be signed by the NEAR account.  
                - **Instructions**:  
                - Let the user know that this is the transaction payload that must be signed with their NEAR account.

                ---

                ### **2. Sign the Transaction Payload Using NEAR Account**  
                - **Action**: Use the 'generate-transaction' tool to sign the received transaction payload.  
                - **Instructions**:  
                - Emphasize that this step requires the user to sign the payload using their NEAR account.
                - Once the transaction is signed, it will be ready for submission to the Bitcoin testnet.

                ---
                ### **3. Send BTC Transaction to Testnet**  
                - **Endpoint**: \`/api/btc_send_mpc_txn\`
                - **Steps**:
                1. Collect the following information from the user:  
                    - \`txHash\` (required): The hash of the signed transaction from NEAR (Take any string).  
                    - \`btcReceiver\` (required): Bitcoin Testnet address of the recipient.  
                    - \`btcAmountInSatoshi\` (required): The amount of BTC to send in satoshis.  
                    - \`account_id\` (automatic): Automatically taken from the connected Bitte wallet account.

                2. **Show Parameters to the User**:  
                    - Display the following JSON structure to the user with the collected parameters:  
                    \`json
                    {
                        "account_id": "{account_id}",
                        "txHash": "{txHash}",
                        "btcReceiver": "{btcReceiver}",
                        "btcAmountInSatoshi": "{btcAmountInSatoshi}",
                    }\`
                    - Clearly explain each parameter to the user.

                3. **Request Confirmation**:  
                    - Ask the user to confirm if the parameters are correct.  
                    - Example: "Please confirm if the above parameters are correct. Type 'yes' to proceed or 'no' to make changes."

                4. **Proceed or Restart**:  
                    - If the user confirms ("yes"), proceed to send the request to the \`/api/btc_send_mpc_txn\` endpoint.  
                    - If the user does not confirm ("no"), restart the process and ask for the correct parameters.
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
            // Consultar cuenta de btc derivada de Near
            "/api/btc_account": {
                get: {
                    summary: "get btc account information",
                    description: "Respond with user account ID and BTC address",
                    operationId: "btc_account",
                    parameters: [
                        {
                            name: "account_id",
                            in: "query",
                            description: "The NEAR account ID to generate BTC account",
                            required: true,
                            schema: {
                                type: "string",
                            },
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            accountId: {
                                                type: "string",
                                                description: "The user's NEAR address",
                                            },
                                            btcAddress: {
                                                type: "string",
                                                description: "The user's BTC address",
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
            // Crear MPC txn para envio de BTC en la red de pruebas
            "/api/btc_create_mpc_txn": {
                get: {
                    operationId: "btc_create_mpc_txn",
                    summary:
                        "Creates a NEAR txn that utilizes near chain signatures to send transaction on bitcoin testnet",
                    description:
                        "Generates a NEAR transaction payload for MPC contract to send bitcoin on bitcoin test. Recieved payload from this tool can be used directly in the generate-tx tool.",
                    parameters: [
                        {
                            name: "account_id",
                            in: "query",
                            description: "The NEAR account ID to generate BTC account",
                            required: true,
                            schema: {
                                type: "string",
                            },
                        },
                        {
                            name: "btcAccountReceiver",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string",
                            },
                            description: "The Bitcon testnet wallet address of receiver",
                        },
                        {
                            name: "btcAmount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string",
                            },
                            description: "The amount BTC in satoshi to transfer",
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            transactionPayload: {
                                                type: "object",
                                                properties: {
                                                    signerId: {
                                                        type: "string",
                                                        description: "The signer's NEAR account ID",
                                                    },
                                                    receiverId: {
                                                        type: "string",
                                                        description: "The receiver's NEAR account ID",
                                                    },
                                                    actions: {
                                                        type: "array",
                                                        items: {
                                                            type: "object",
                                                            properties: {
                                                                type: {
                                                                    type: "string",
                                                                    description:
                                                                        "The type of action (e.g., 'Transfer')",
                                                                },
                                                                params: {
                                                                    type: "object",
                                                                    properties: {
                                                                        deposit: {
                                                                            type: "string",
                                                                            description:
                                                                                "The amount to transfer in yoctoNEAR",
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "500": {
                            description: "Error response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            // Enviar MPC txt para envio de BTC en la red de pruebas
            "/api/btc_send_mpc_txn": {
                get: {
                  operationId: "btc_send_mpc_txn",
                  summary: "Relay/Send the signed BTC testnet transaction",
                  description:
                    "Send signed transaction to BTC testnet. The signature is received form the txHash of the signed NEAR transaction. Other parameters are the BTC receiver address, BTC amount in satoshi, and account_id that is taken from the accoun connected to the wallet.",
                  parameters: [
                    {
                        name: "account_id",
                        in: "query",
                        description: "The NEAR account ID connected to the wallet",
                        required: true,
                        schema: {
                            type: "string",
                        },
                    },
                    {
                      name: "btcAccountReceiver",
                      in: "query",
                      required: true,
                      schema: {
                        type: "string",
                      },
                      description: "The BTC address of the receiver",
                    },
                    {
                      name: "btcAmount",
                      in: "query",
                      required: true,
                      schema: {
                        type: "string",
                      },
                      description: "The amount of BTC to transfer in satoshi",
                    },
                    {
                      name: "txHash",
                      in: "query",
                      required: true,
                      schema: {
                        type: "string",
                      },
                      description: "The txHash of the signed txn from near",
                    },
                  ],
                  responses: {
                    "200": {
                      description: "Successful response",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              txHash: {
                                type: "string",
                                description:
                                  "The txHash of the txn relayed to BTC chain :",
                              },
                            },
                          },
                        },
                      },
                    },
                    "400": {
                      description: "Bad request",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              error: {
                                type: "string",
                                description: "Error message",
                              },
                            },
                          },
                        },
                      },
                    },
                    "500": {
                      description: "Server error",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              error: {
                                type: "string",
                                description: "Error message",
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