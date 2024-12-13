export default function CalculateClose(rawData) {
    const closedChartData = rawData.map((point) => ({
      x: point.x, 
      y: point.y[3], 
    }));
    return closedChartData;
  }