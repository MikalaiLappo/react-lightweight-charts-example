import { useEffect, useState, useRef } from "react";

type TickerSymbol = "btcusdt";

export type WSUpdate = { time: string; close: number };

export const useBinanceWS = (
  enabled: boolean,
  onMessage: (data: WSUpdate) => void,
) => {
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const ws = new WebSocket("ws://localhost:9000");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WSUpdate;
      console.log(message);
      onMessage(message);
    };

    ws.onerror = () => {
      setError("WebSocket error");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [enabled]);

  const subscribe = (symbol: TickerSymbol) => {
    if (wsRef.current) {
      const payload = {
        method: "SUBSCRIBE",
        params: [`${symbol}@trade`], // Binance uses "@" to specify the stream type
        id: 1, // ID is required by Binance for subscription
      };
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  const unsubscribe = (symbol: TickerSymbol) => {
    if (wsRef.current) {
      const payload = {
        method: "UNSUBSCRIBE",
        params: [`${symbol}@trade`],
        id: 1, // ID is required by Binance for unsubscription
      };
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  const send = (payload: { method: string; params: any[]; id: number }) => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  return { error, subscribe, unsubscribe, send };
};
