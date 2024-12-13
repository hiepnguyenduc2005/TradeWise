export default function Formatter(val, option) {
    const date = new Date(val);
    if (option === '1d' || option === '5d') {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
}
