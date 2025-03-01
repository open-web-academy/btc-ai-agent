import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { Bitcoin as SignetBTC, BTCRpcAdapters } from 'signet.js';
import { CONTRACT, MPC_CONTRACT, NetworkId } from "@/utils/config";
export const maxDuration = 30;
export const dynamic = "force-dynamic";
import { debounce } from "@/utils/debounce";

const btcRpcAdapter = new BTCRpcAdapters.Mempool('https://mempool.space/testnet4/api');
const Bitcoin = new SignetBTC({
  network: NetworkId,
  contract: CONTRACT,
  btcRpcAdapter,
});

async function deriveBitcoinAddress(account_id: string, path: string) {
  return await Bitcoin.deriveAddressAndPublicKey(account_id, path);
}

const debouncedDeriveBitcoinAddress = debounce(deriveBitcoinAddress, 500);


const app = new Elysia({ prefix: "/api", aot: false })
  .use(swagger())
  // Método GET para obtener el precio actual del Bitcoin
  .get("/btc_price", async () => {
    try {
      const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
      const data = await response.json();
      const btcPrice = data.price;

      return { btcPrice };
    } catch (error) {
      return { error: "Failed to fetch Bitcoin price" };
    }
  })
  // Método GET para obtener el balance de BTC de una cuenta
  .get("/btc_balance", async ({ query }) => {
    const { account_id, path } = query;

    if (typeof account_id !== "string") {
      return { error: "account_id must be a string" };
    }
  
    try {
      const result = await debouncedDeriveBitcoinAddress(account_id,path);
  
      const btcBalance = await Bitcoin.getBalance(result.address);
      return { btcBalance };
    } catch (error) {
      return { error: "Failed to fetch BTC balance" };
    }
  })
  // Método POST para transferir BTC de una cuenta a otra
  .post("/btc_transfer", async ({ body }) => {
    console.log("Request body:", body);

    if (!body || typeof body !== "object") {
      return { error: "Invalid request body" };
  }
  
    const { from_account_id, to_account_id, path, amount } = body as {
      path: string;
      from_account_id: string;
      to_account_id: string;
      amount: string;
    };

    console.log("from_account_id",from_account_id);
    console.log("path",path);
    console.log("to_account_id",to_account_id);
    console.log("amount",amount);
    const satoshis = parseInt(amount) * 100000000

    const result = await debouncedDeriveBitcoinAddress(from_account_id,path);

    const { transaction, mpcPayloads } = await Bitcoin.getMPCPayloadAndTransaction({
      publicKey: result.publicKey,
      from: result.address,
      to: to_account_id,
      value: satoshis.toString()
    });

    const mpcTransactions = mpcPayloads.map(
      ({ payload }) => ({
        receiverId: MPC_CONTRACT,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: "sign",
              args: {
                request: {
                  payload: Array.from(payload),
                  path: path,
                  key_version: 0,
                },
              },
              gas: "250000000000000",
              deposit: 1,
            },
          },
        ],
      })
    )
    

    try {
      return {type: "FunctionCall",params:mpcTransactions[0]}
    } catch (error) {
      return { error: "Failed to transfer BTC" };
    }
  })
  .compile();

export const GET = app.handle;
export const POST = app.handle;