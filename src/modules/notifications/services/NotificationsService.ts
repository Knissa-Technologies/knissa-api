import { randomBytes } from "crypto";

import { CreateNotificationDTO } from "../dtos/CreateNotificationDTO.js";
import { NotificationsRepository } from "../repositories/NotificationsRepository.js";

export class NotificationsService {
  private notificationsRepository: NotificationsRepository;

  constructor() {
    this.notificationsRepository = new NotificationsRepository();
  }

  // ======================================================
  // CREATE
  // ======================================================

  async create(userId: string, data: CreateNotificationDTO) {
    const accountIds = await this.getAccountIdsByUserId(userId);

    if (!accountIds.includes(data.accountId)) {
      throw new Error("You are not authorized to use this account.");
    }

    const notificationNumber = this.generateNotificationNumber();

    return this.notificationsRepository.create({
      ...data,
      notificationNumber,
    });
  }
  // ======================================================
  // FIND BY ID
  // ======================================================

  async findById(id: string) {
    const notification = await this.notificationsRepository.findById(id);

    if (!notification) {
      throw new Error("Notification not found.");
    }

    return notification;
  }

  // ======================================================
  // FIND BY ACCOUNT
  // ======================================================

  async findByAccountId(accountId: string) {
    return this.notificationsRepository.findByAccountId(accountId);
  }

  // ======================================================
  // GET UNREAD COUNT BY ACCOUNT
  // ======================================================

  async getUnreadCount(userId: string) {
    const accountIds = await this.getAccountIdsByUserId(userId);

    const count =
      await this.notificationsRepository.countUnreadByAccountIds(accountIds);

    return {
      count,
    };
  }

  // ======================================================
  // MARK AS READ
  // ======================================================

  async markAsRead(id: string) {
    const notification = await this.findById(id);

    if (notification.status === "READ") {
      return notification;
    }

    return this.notificationsRepository.markAsRead(id);
  }

  // ======================================================
  // USER → PROFILE → ACCOUNTS
  // ======================================================

  async getAccountIdsByUserId(userId: string): Promise<string[]> {
    const profile =
      await this.notificationsRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new Error("Profile not found.");
    }

    const accounts = await this.notificationsRepository.findAccountsByProfileId(
      profile.id,
    );

    return accounts.map((account) => account.id);
  }

  // ======================================================
  // FIND MY NOTIFICATIONS
  // ======================================================

  async findMyNotifications(userId: string) {
    const accountIds = await this.getAccountIdsByUserId(userId);

    return this.notificationsRepository.findByAccountIds(accountIds);
  }

  // ======================================================
  // FIND MY NOTIFICATION BY ID
  // ======================================================

  async findMyNotificationById(userId: string, notificationId: string) {
    const accountIds = await this.getAccountIdsByUserId(userId);

    const notification =
      await this.notificationsRepository.findByIdAndAccountIds(
        notificationId,
        accountIds,
      );

    if (!notification) {
      throw new Error("Notification not found.");
    }

    return notification;
  }

  // ======================================================
  // GET MY UNREAD COUNT
  // ======================================================

  async getMyUnreadCount(userId: string) {
    const accountIds = await this.getAccountIdsByUserId(userId);

    const count =
      await this.notificationsRepository.countUnreadByAccountIds(accountIds);

    return {
      count,
    };
  }

  // ======================================================
  // MARK MY NOTIFICATION AS READ
  // ======================================================

  async markMyNotificationAsRead(userId: string, notificationId: string) {
    const notification = await this.findMyNotificationById(
      userId,
      notificationId,
    );

    if (notification.status === "READ") {
      return notification;
    }

    return this.notificationsRepository.markAsRead(notificationId);
  }

  // ======================================================
  // GENERATE NOTIFICATION NUMBER
  // ======================================================

  private generateNotificationNumber(): string {
    return `NTF-${randomBytes(6).toString("hex").toUpperCase()}`;
  }
}
