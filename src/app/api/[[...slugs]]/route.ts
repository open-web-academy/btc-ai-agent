import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

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
    const { account_id } = query;

    if (typeof account_id !== "string") {
      return { error: "account_id must be a string" };
    }

    try {
      const balance = await fetchBalanceFromService(account_id); // Implementa esta función según tu backend
      return { balance };
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

// Función para obtener el balance de una dirección BTC en Testnet
async function fetchBalanceFromService(account_id: string): Promise<string> {
  // URL de la API de Blockstream Testnet
  const url = `https://mempool.space/testnet4/api/address/${account_id}`;

  console.log(url);

  // Hacer la solicitud HTTP
  const response = await fetch(url);

  // Verificar si la respuesta es exitosa
  if (!response.ok) {
    throw new Error(`Failed to fetch balance: ${response.statusText}`);
  }

  // Procesar la respuesta JSON
  const data = await response.json();


  console.log(data);

  // Extraer el balance en satoshis
  const fundedTxoSum = data.chain_stats.funded_txo_sum; // Total recibido
  const spentTxoSum = data.chain_stats.spent_txo_sum;   // Total gastado
  const balanceInSatoshis = fundedTxoSum - spentTxoSum; // Balance actual

  // Convertir el balance de satoshis a BTC (1 BTC = 100,000,000 satoshis)
  const balanceInBTC = balanceInSatoshis / 100000000;

  console.log("balance satoshis",balanceInSatoshis)

  // Devolver el balance como una cadena (puedes formatearlo si lo deseas)
  return balanceInBTC.toString();
}

async function transferBTC(
  from_account_id: string,
  to_account_id: string,
  amount: string
): Promise<{ id: string }> {
  // Simulación de una llamada a un servicio que realiza la transferencia de BTC
  return { id: "tx123456789" }; // Ejemplo de ID de transacción
}