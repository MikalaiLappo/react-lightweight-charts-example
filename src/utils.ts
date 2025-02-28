import * as LightweightCharts from "lightweight-charts";

const DAY = 24 * 60 * 60 * 1000;

export function genData(
  days: number,
): LightweightCharts.CandlestickData<LightweightCharts.Time>[] {
  const data = [];
  let previousClose;

  let nowPtr = Date.now();
  for (let i = 0; i < days; i++) {
    const high = parseFloat((Math.random() * 250 + 1).toFixed(2));
    const low = parseFloat((Math.random() * high + 1).toFixed(2));
    const open =
      previousClose !== undefined
        ? previousClose
        : parseFloat((Math.random() * (high - low + 1) + low).toFixed(2));

    const close = parseFloat(
      (Math.random() * (high - low + 1) + low).toFixed(2),
    );

    data.push({
      open,
      high,
      low,
      close,
      time: formatDate(nowPtr),
    });
    previousClose = close;
    nowPtr += DAY;
  }

  return data;
}

export function randomizeClose(data: ReturnType<typeof genData>[number]) {
  const randomClose = parseFloat((Math.random() * 200 + 50).toFixed(2));

  data.close = randomClose;

  if (data.close > data.high) {
    data.high = parseFloat((data.close + Math.random() * 11).toFixed(2)); // Overflow by up to 10
  } else if (data.close < data.low) {
    data.low = parseFloat((data.close - Math.random() * 11).toFixed(2)); // Overflow by up to 10
  }

  if (data.high < data.low) {
    data.high = parseFloat((data.low + Math.random() * 11).toFixed(2));
  }

  return data;
}

export const formatDate = (utc: number) => {
  const date = new Date(utc);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
