import { CandleHistory } from "../interfaces";
import { useQuery } from "@tanstack/react-query";

const BINANCE_DUMMY_PROXY = "http://localhost:9000/binance/history";

export const fetchBinanceHistory = async (): Promise<CandleHistory> =>
  fetch(BINANCE_DUMMY_PROXY).then((r) => r.json());

export const useBinanceHistory = () => {
  return useQuery<CandleHistory, Error>({
    queryKey: ["btcusdtData"],
    queryFn: fetchBinanceHistory,
    // staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
