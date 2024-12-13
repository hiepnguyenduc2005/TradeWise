export default function NumberFormat(value) {
    if (value >= 1e12) {
      return (value / 1e12).toFixed(2) + 'T'; 
    } else if (value >= 1e9) {
      return (value / 1e9).toFixed(2) + 'B'; 
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(2) + 'M'; 
    }
    return value.toLocaleString(); 
}