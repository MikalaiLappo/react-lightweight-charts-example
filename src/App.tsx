import { useEffect, useRef, useState } from "react";
import * as LightweightCharts from "lightweight-charts";
import { LW_CONFIG } from "./config";
import { fetchBinanceHistory } from "./binance/use-binance-http";
import { CandleHistory } from "./interfaces";
import { useQuery } from "@tanstack/react-query";
import { useBinanceWS } from "./binance/use-binance-ws";

export const App = () => {
  const [viewMode, setViewMode] = useState<
    | LightweightCharts.SeriesDefinition<"Candlestick">
    | LightweightCharts.SeriesDefinition<"Bar">
  >(LightweightCharts.CandlestickSeries);

  const [isWSEnabled, setIsWSEnabled] = useState<boolean>(true);

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<LightweightCharts.IChartApi | null>(null);
  const dataRef = useRef<CandleHistory>([]);
  // `Candlestick` and `Bar` share same data interface
  const seriesRef = useRef<LightweightCharts.ISeriesApi<
    "Candlestick" | "Bar"
  > | null>(null);

  const hydrate = () => {
    seriesRef.current?.setData(dataRef.current);
    // console.log(dataRef.current);
  };

  useBinanceWS(isWSEnabled, ({ close }) => {
    if (!dataRef.current?.length) return;
    const latestCandle = dataRef.current[dataRef.current.length - 1];
    latestCandle.close = close;
    hydrate();
  });

  const { data } = useQuery<CandleHistory, Error>({
    queryKey: ["binanceHistory"],
    queryFn: fetchBinanceHistory,
    staleTime: Infinity,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      dataRef.current = data;
      hydrate();
      chartRef.current?.timeScale().fitContent();
      setIsWSEnabled(true);
    }
  }, [data]);

  // Init. chart, mount it as uncontrolled  component by a `useRef`
  useEffect(() => {
    if (!chartContainerRef.current) throw Error("lifecycle error");

    const chart = LightweightCharts.createChart(
      chartContainerRef.current,
      LW_CONFIG.chart,
    );

    chartRef.current = chart;
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // render series (objects) on the chart
  useEffect(() => {
    if (!chartRef.current) return;

    const series = chartRef.current.addSeries(viewMode);
    series.applyOptions(LW_CONFIG.series.candle);
    series.setData(dataRef.current);
    series.applyOptions({
      priceFormat: {
        type: "price",
        precision: 5,
        minMove: 0.00001,
      },
    });

    seriesRef.current = series;

    return () => {
      if (seriesRef.current) {
        chartRef.current?.removeSeries(seriesRef.current);
      }
      seriesRef.current = null;
    };
    // hook series re-render by reference to `viewMode` controlled state
  }, [viewMode]);

  return (
    <div className="container">
      <div className="settings">
        <div>
          View Mode:{" "}
          <button
            disabled={viewMode === LightweightCharts.CandlestickSeries}
            onClick={() => {
              setViewMode(LightweightCharts.CandlestickSeries);
            }}
          >
            Candles
          </button>
          <button
            disabled={viewMode === LightweightCharts.BarSeries}
            onClick={() => {
              setViewMode(LightweightCharts.BarSeries);
            }}
          >
            Bars
          </button>
        </div>
        <a href="https://github.com/MikalaiLappo/react-lightweight-charts-example">
          {" "}
          Source{" "}
        </a>
        <div>
          Live DOGE-USDT update:{" "}
          <button disabled>{isWSEnabled ? "On" : "Off"}</button>
        </div>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
};
