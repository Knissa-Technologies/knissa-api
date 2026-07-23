export interface PaymentDTO {
    walletId: string;
    amount: number;
    beneficiary: string;
    description?: string;
}