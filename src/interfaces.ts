export type DayCandle = {
  open: number;
  close: number;
  high: number;
  low: number;
  time: string;
};

export type CandleHistory = DayCandle[];

//  import * as LightweightCharts from "lightweight-charts";
// LightweightCharts.CandlestickData<LightweightCharts.Time>;
