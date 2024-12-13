export default function CalculateVolume(data) {
  const greenVolumes = [];
  const redVolumes = [];

  data.forEach((point) => {
    const [open, high, low, close] = point.y;
    const volume = point.volume;

    if (close > open) {
      greenVolumes.push({ x: point.x, y: volume });
      redVolumes.push({ x: point.x, y: 0 }); 
    } else {
      redVolumes.push({ x: point.x, y: volume });
      greenVolumes.push({ x: point.x, y: 0 }); 
    }
  });

  return { greenVolumes, redVolumes };
}
