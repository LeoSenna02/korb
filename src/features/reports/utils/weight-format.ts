function formatDecimal(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatWeightGramsForReport(valueGrams: number) {
  const absoluteValue = Math.abs(valueGrams);

  if (absoluteValue >= 1000) {
    return `${formatDecimal(valueGrams / 1000)} kg`;
  }

  return `${formatDecimal(valueGrams)} g`;
}

export function formatWeightGramsCompact(valueGrams: number) {
  const absoluteValue = Math.abs(valueGrams);

  if (absoluteValue >= 1000) {
    return `${formatDecimal(valueGrams / 1000)}kg`;
  }

  return `${formatDecimal(valueGrams)}g`;
}
