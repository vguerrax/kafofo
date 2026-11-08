export function progressLabel(total: number, purchased: number) {
  return total === 0
    ? 'Lista vazia'
    : `${purchased} de ${total} comprados · ${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format((purchased * 100) / total)}%`;
}
export function quantityInput(value: string) {
  const text = value.trim();
  return text ? text.replace(',', '.') : null;
}
