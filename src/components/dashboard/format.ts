const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** `6840` → `"6.840"` */
export function formatInt(value: number) {
  return integer.format(value);
}

/** `82.1` → `"82,1"` */
export function formatDecimal(value: number) {
  return oneDecimal.format(value);
}
