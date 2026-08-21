export interface UpdateExchangeRateDTO {
  rate?: number;

  provider?: string;

  validFrom?: Date;

  validUntil?: Date | null;
}
