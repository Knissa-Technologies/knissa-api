export interface CreateExchangeRateDTO {
  baseCurrencyId: string;
  quoteCurrencyId: string;
  rate: number;
  source?: string;
}