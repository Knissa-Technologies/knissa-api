import { DashboardRepository } from "../repositories/DashboardRepository.js";

export class GetDashboardService {

  private readonly repository = new DashboardRepository();

  async execute(userId: string) {

    const user = await this.repository.getUser(userId);

    const wallets = await this.repository.getWallets(userId);

    const recentTransactions =
      await this.repository.getRecentTransactions(userId);

    const transactions =
      await this.repository.countTransactions(userId);

    const totalBalance = wallets.reduce(
      (total, wallet) => total + Number(wallet.balance),
      0,
    );

    return {
      user,

      summary: {
        totalBalance,
        wallets: wallets.length,
        transactions,
      },

      wallets,

      recentTransactions,
    };
  }

}