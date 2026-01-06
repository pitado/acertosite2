export const CATEGORY_MAP: Record<string, string[]> = {
  Transporte: ["Gasolina", "Pedágio", "Estacionamento", "Uber/Taxi", "Ônibus/Metrô"],
  Alimentação: ["Comida", "Bebida", "Mercado"],
  Estadia: ["Acomodação", "Taxas"],
  Ingressos: ["Show/Evento", "Passeio", "Museu"],
  Diversos: ["Outros"],
};

export const CATEGORY_LIST = Object.keys(CATEGORY_MAP);

export const formatBRL = (n: number) => `R$ ${Number(n).toFixed(2)}`;
