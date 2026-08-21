export interface CreateExchangeRateDTO {
  baseCurrencyId: string;
  quoteCurrencyId: string;

  rate: number;

  provider?: string;

  validFrom?: Date;
  validUntil?: Date | null;
}
