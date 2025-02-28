import * as LightweightCharts from 'lightweight-charts';

type IConfig = {
  chart: LightweightCharts.DeepPartial<LightweightCharts.ChartOptions>;
  series: {
    candle: LightweightCharts.DeepPartial<
      LightweightCharts.CandlestickStyleOptions &
        LightweightCharts.SeriesOptionsCommon
    >;
  };
};
export const LW_CONFIG: IConfig = {
  chart: {
    width: 800,
    height: 500,
    layout: {
      background: {
        type: LightweightCharts.ColorType.Solid,
        color: '#1c1c1c',
      },
      textColor: '#fff',
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      horzLine: {
        visible: true,
        labelVisible: true,
        labelBackgroundColor: 'grey',
      },
      vertLine: {
        visible: true,
      },
    },
    grid: {
      vertLines: {
        color: '#282828',
      },
      horzLines: {
        color: '#282828',
      },
    },

    timeScale: {
      borderColor: '#cccccc',
    },
  },
  series: {
    candle: {
      upColor: '#089981',
      downColor: '#f23645',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    },
  },
};


export const APP_CONFIG = {
  updateDelay: 750
}