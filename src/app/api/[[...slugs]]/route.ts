import { swagger } from "@elysiajs/swagger";
import { headers } from "next/headers";
import { Elysia } from "elysia";
import {
  Bitcoin as SignetBTC,
  BTCRpcAdapters,
  utils,
  RSVSignature,
  MPCSignature,
} from "signet.js";
export const maxDuration = 30;
export const dynamic = "force-dynamic";
import { debounce } from "@/utils/debounce";
import { providers, connect } from "near-api-js";
import { toRSV } from "signet.js/src/chains/utils";
import {
  ExecutionOutcomeWithId,
  FinalExecutionOutcome,
} from "near-api-js/lib/providers";
import axios from "axios";

const CONTRACT = new utils.chains.near.contract.NearChainSignatureContract({
  networkId: "mainnet",
  contractId: "v1.signer",
});

const btcRpcAdapter = new BTCRpcAdapters.Mempool('https://mempool.space/testnet4/api');

const Bitcoin = new SignetBTC({
  network: "testnet",
  contract: CONTRACT,
  btcRpcAdapter,
});


async function deriveBitcoinAddress(account_id: string, path: string) {
  return await Bitcoin.deriveAddressAndPublicKey(account_id, path);
}

const debouncedDeriveBitcoinAddress = debounce(deriveBitcoinAddress, 500);


const app = new Elysia({ prefix: "/api", aot: false })
  .use(swagger())
  // Método para obtener el precio actual del Bitcoin
  .get("/btc_price", async () => {
    try {
      const response = await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=1&convert=USD", {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
          "Accept": "application/json"
        }
      });
      const btcData = response.data.data[0]; // Primer elemento del array
      const btcPrice = btcData.quote.USD.price; // Precio en USD
      return { btcPrice: btcPrice };
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  })
  // Método para obtener la cuenta de btc derivada de una de NEAR
  .get("/btc_account", async ({ query }) => {
    const { account_id } = query;

    console.log("account_id",account_id)

    if (typeof account_id !== "string") {
      return { error: "account_id must be a string" };
    }
  
    try {
      const result = await debouncedDeriveBitcoinAddress(account_id,"bitcoin-1");
      return { result };
    } catch (error) {
      return { error: "Failed to fetch BTC balance" };
    }
  })
  // Método para obtener el balance de BTC de una cuenta
  .get("/btc_balance", async ({ query }) => {
    const { account_id } = query;

    console.log("account_id",account_id)

    if (typeof account_id !== "string") {
      return { error: "account_id must be a string" };
    }
  
    try {
      const result = await debouncedDeriveBitcoinAddress(account_id,"bitcoin-1");
  
      const btcBalance = await Bitcoin.getBalance(result.address);
      return { btcBalance };
    } catch (error) {
      return { error: "Failed to fetch BTC balance" };
    }
  })
  // Método para transferir BTC de una cuenta a otra
  .get("/btc_create_mpc_txn", async ({ query }) => {
    const { account_id, btcAccountReceiver, btcAmount} = query;

    console.log("account_id",account_id);
    console.log("btcAccountReceiver",btcAccountReceiver);
    console.log("btcAmount",btcAmount);

    if (!account_id || !btcAccountReceiver || !btcAmount) {
      return { error: "account_id, btcAccountReceiver and btcAmount are required parameters" };
    }

    const result = await debouncedDeriveBitcoinAddress(account_id,"bitcoin-1");

    console.log("result",result);

    console.log("btcAmount",btcAmount);


    try{
      const { transaction, mpcPayloads } = await Bitcoin.getMPCPayloadAndTransaction({
        publicKey: result.publicKey,
        from: result.address,
        to: btcAccountReceiver,
        value: btcAmount.toString()
      });
    } catch(err){
      console.log(err);
    }
    const { transaction, mpcPayloads } = await Bitcoin.getMPCPayloadAndTransaction({
      publicKey: result.publicKey,
      from: result.address,
      to: btcAccountReceiver,
      value: btcAmount.toString()
    });

    console.log("mpcPayloads",mpcPayloads);

  
    const mpcTransactions = mpcPayloads.map(({ payload }) => ({
        receiverId: "v1.signer",
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: "sign",
              args: {
                request: {
                  payload: Array.from(payload),
                  path: "bitcoin-1",
                  key_version: 0,
                },
              },
              gas: "250000000000000",
              deposit: 1,
            },
          },
        ],
      })
    );

    try {
      return {type: "FunctionCall",params:mpcTransactions}
    } catch (error) {
      return { error: "Failed to transfer BTC" };
    }
  })
  .get("/btc_send_mpc_txn", async ({ query }) => {    
    const { txHash,account_id, btcAccountReceiver, btcAmount} = query;

    console.log("txHash",txHash);
    console.log("account_id",account_id);
    console.log("btcAccountReceiver",btcAccountReceiver);
    console.log("btcAmount",btcAmount);

    if (!txHash || !btcAccountReceiver || !btcAmount) {
      return { error: "account_id, txHash, btcAccountReceiver and btcAmount are required parameters" };
    }

    const connectionConfig = {
      networkId: "mainnet",
      nodeUrl: "https://rpc.mainnet.near.org",
    };

    const near = await connect(connectionConfig);
    const txFinalOutcome = await near.connection.provider.txStatus(
      txHash,
      account_id as string,
      "FINAL"
    );

    const decodedSuccessValue = getDecodedSuccessValue(
      txFinalOutcome.receipts_outcome
    );

    const mpcSignature: MPCSignature = JSON.parse(
      decodedSuccessValue as string
    );

    console.log("mpcSignature", mpcSignature);

    const mpcSignatures: RSVSignature[] = [toRSV(mpcSignature)];

    console.log("mpcSignatures", mpcSignatures);

    const result = await debouncedDeriveBitcoinAddress(account_id,"bitcoin-1");

    const { transaction, mpcPayloads } = await Bitcoin.getMPCPayloadAndTransaction({
      publicKey: result.publicKey,
      from: result.address,
      to: btcAccountReceiver,
      value: btcAmount.toString()
    });

    console.log("transaction", transaction);

    transaction.psbt.setMaximumFeeRate(10000);

    const signedTransaction = Bitcoin.addSignature({
      transaction,
      mpcSignatures,
    });

    const btcTxnHash = await Bitcoin.broadcastTx(signedTransaction);

    try {
      return {type: "FunctionCall",txHash: btcTxnHash }
    } catch (error) {
      return { error: "Failed to transfer BTC" };
    }
  })
  .compile();

export const GET = app.handle;
export const POST = app.handle;

const getDecodedSuccessValue = (receiptsOutcome: ExecutionOutcomeWithId[]) => {
  let successReceiptId: string | null = null;
  let successValue = null;

  // Find the SuccessReceiptId
  receiptsOutcome.forEach((receipt) => {
    //@ts-ignore
    if (receipt.outcome.status.SuccessReceiptId) {
      //@ts-ignore
      successReceiptId = receipt.outcome.status.SuccessReceiptId;
    }
  });

  if (!successReceiptId) return null; // Return null if no SuccessReceiptId is found

  // Find the SuccessValue corresponding to the SuccessReceiptId
  receiptsOutcome.forEach((receipt) => {
    if (
      receipt.id === successReceiptId &&
      //@ts-ignore
      receipt.outcome.status.SuccessValue !== undefined
    ) {
      //@ts-ignore
      successValue = receipt.outcome.status.SuccessValue;
    }
  });

  if (!successValue) return null; // Return null if no SuccessValue is found

  // Decode from Base64 to String
  try {
    return atob(successValue); // Decode Base64
  } catch (error) {
    console.error("Error decoding Base64:", error);
    return null;
  }
};