import { useEffect, useRef, useState } from "react";
import * as LightweightCharts from "lightweight-charts";
import * as React from "react";
import { APP_CONFIG, LW_CONFIG } from "./config";
import { genData, randomizeClose } from "./utils";

export const App = () => {
  const [viewMode, setViewMode] = useState<
    | LightweightCharts.SeriesDefinition<"Candlestick">
    | LightweightCharts.SeriesDefinition<"Bar">
  >(LightweightCharts.CandlestickSeries);

  const [liveUpdate, setLiveUpdate] = useState<boolean>(true);

  const chartContainerRef = useRef<HTMLDivElement>(
    undefined,
  ) as React.RefObject<HTMLDivElement>;
  const chartRef = useRef<LightweightCharts.IChartApi | null>(null);
  const dataRef = useRef(genData(20));
  // `Candlestick` and `Bar` share same data interface
  const seriesRef = useRef<LightweightCharts.ISeriesApi<
    "Candlestick" | "Bar"
  > | null>(null);

  // Init. chart, mount it as uncontrolled  component by a `useRef`
  useEffect(() => {
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

    seriesRef.current = series;

    return () => {
      if (seriesRef.current) {
        chartRef.current?.removeSeries(seriesRef.current);
      }
      seriesRef.current = null;
    };
    // hook series re-render by reference to `viewMode` controlled state
  }, [viewMode]);

  /* 
    simulate current (latest) series data (candle/bar) update
    
    one of approaches for an actual http `react-query`-like hook:
    1. set refetch for real-time update
    2. update uncontrolled refs (data, series.setData) in your result cb 
  */
  useEffect(() => {
    if (!liveUpdate) return;

    const interval = setInterval(() => {
      dataRef.current[dataRef.current.length - 1] = randomizeClose(
        dataRef.current[dataRef.current.length - 1], // .at(-1)
      );
      seriesRef.current?.setData(dataRef.current);
    }, APP_CONFIG.updateDelay);

    return () => {
      clearInterval(interval);
    };
  }, [liveUpdate]);

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
          Live update:{" "}
          <button onClick={() => setLiveUpdate((p) => !p)}>
            {liveUpdate ? "On" : "Off"}
          </button>
        </div>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
};

export default App;
