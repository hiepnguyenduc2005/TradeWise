export default function CalculateHeikinAshi(rawData){
    const haData = [];
    let prevOpen = (rawData[0].y[0] + rawData[0].y[3]) / 2; 
    let prevClose = (rawData[0].y[0] + rawData[0].y[1] + rawData[0].y[2] + rawData[0].y[3]) / 4; 

    rawData.forEach((point) => {
      const open = prevOpen;
      const close = (point.y[0] + point.y[1] + point.y[2] + point.y[3]) / 4;
      const high = Math.max(point.y[1], open, close);
      const low = Math.min(point.y[2], open, close);

      haData.push({
        x: point.x,
        y: [open, high, low, close],
      });

      prevOpen = (prevOpen + prevClose) / 2;
      prevClose = close;
    });

    return haData;
  };