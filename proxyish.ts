import express, { Express, Request, Response } from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { CandleHistory } from "./src/interfaces";
import cors from "cors";
import { formatDate } from "./src/utils";
import { WSUpdate } from "./src/binance/use-binance-ws";

const app: Express = express();
const server = http.createServer(app);

app.use(cors());

const SYMBOL = "DOGEUSDT";

const BINANCE_API_URL = "https://api.binance.com/api/v3/klines";

const fetchHistory = async (): Promise<CandleHistory> => {
  const params = new URLSearchParams({
    symbol: SYMBOL.toUpperCase(),
    interval: "1d",
    limit: "20",
  });

  const response = await fetch(`${BINANCE_API_URL}?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  return data.map((candle: any[]) => {
    const [openTime, open, high, low, close] = candle;

    return {
      open: parseFloat(open),
      close: parseFloat(close),
      high: parseFloat(high),
      low: parseFloat(low),
      time: new Date(openTime).toISOString().split("T")[0],
    };
  });
};

app.get("/binance/history", async (_req: Request, res: Response) => {
  try {
    const data = await fetchHistory();
    res.json(data);
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
});

const wssLocal = new WebSocketServer({ server });

const binanceWebSocketUrl = `wss://stream.binance.com:9443/ws/${SYMBOL.toLowerCase()}@trade`;
let binanceWebSocket: WebSocket | undefined;

const connectTobinance = (): void => {
  binanceWebSocket = new WebSocket(binanceWebSocketUrl);

  binanceWebSocket.on("open", () => {
    console.log("Connected to binance WebSocket");
  });

  binanceWebSocket.on("message", (data: WebSocket.Data) => {
    const jsonData: { T: number; p: string } = JSON.parse(data.toString());

    const update: WSUpdate = {
      close: parseFloat(jsonData.p),
      time: formatDate(jsonData.T),
    };

    wssLocal.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(update));
      }
    });
  });

  binanceWebSocket.on("close", () => {
    console.log("Disconnected from binance WebSocket. Reconnecting...");
    setTimeout(connectTobinance, 5000);
  });

  binanceWebSocket.on("error", (err: Error) => {
    console.error("binance WebSocket error:", err);
  });
};

connectTobinance();

wssLocal.on("connection", (ws: WebSocket) => {
  console.log("Local client connected");

  // Forward messages from local client to binance
  ws.on("message", (message: WebSocket.Data) => {
    //    console.log("Message from local client:", message.toString());
    if (binanceWebSocket && binanceWebSocket.readyState === WebSocket.OPEN) {
      binanceWebSocket.send(message);
    }
  });

  ws.on("close", () => {
    console.log("Local client disconnected");
  });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
