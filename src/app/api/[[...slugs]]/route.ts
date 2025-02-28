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
    const { from_account_id, to_account_id, amount } = body as {
      from_account_id: string;
      to_account_id: string;
      amount: string;
    };

    if (!from_account_id || !to_account_id || !amount) {
      return { error: "Missing required fields: from_account_id, to_account_id, or amount" };
    }

    try {
      // Simulación de una llamada a una API o servicio que realiza la transferencia de BTC
      const transaction = await transferBTC(from_account_id, to_account_id, amount); // Implementa esta función según tu backend
      return { transaction_id: transaction.id, status: "success" };
    } catch (error) {
      return { error: "Failed to transfer BTC" };
    }
  })
  .compile();

export const GET = app.handle;
export const POST = app.handle;

async function transferBTC(
  from_account_id: string,
  to_account_id: string,
  amount: string
): Promise<{ id: string }> {
  // Simulación de una llamada a un servicio que realiza la transferencia de BTC
  return { id: "tx123456789" }; // Ejemplo de ID de transacción
}