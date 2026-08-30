import { createHash, randomBytes } from "crypto";

import { CreateApiKeyDTO } from "../dtos/CreateApiKeyDTO.js";
import { ApiKeysRepository } from "../repositories/ApiKeysRepository.js";

export class ApiKeysService {
  private apiKeysRepository: ApiKeysRepository;

  constructor() {
    this.apiKeysRepository = new ApiKeysRepository();
  }

  // ======================================================
  // CREATE API KEY
  // ======================================================

  async create(userId: string, data: CreateApiKeyDTO) {
    const accountIds = await this.getAccountIdsByUserId(userId);

    if (!accountIds.includes(data.accountId)) {
      throw new Error("You are not authorized to use this account.");
    }

    const apiKeyNumber = this.generateApiKeyNumber();

    // API Key secreta — será mostrada apenas uma vez
    const rawKey = this.generateApiKey();

    // Prefixo para identificação
    const prefix = rawKey.substring(0, 12);

    // Hash que será armazenado no banco
    const keyHash = this.hashApiKey(rawKey);

    const apiKey = await this.apiKeysRepository.create({
      apiKeyNumber,
      accountId: data.accountId,
      name: data.name,
      prefix,
      keyHash,
      expiresAt: data.expiresAt,
    });

    return {
      ...apiKey,
      key: rawKey,
    };
  }

  // ======================================================
  // GET ALL MY API KEYS
  // ======================================================

  async findAll(userId: string) {
    const accountIds = await this.getAccountIdsByUserId(userId);

    return this.apiKeysRepository.findAllByAccountIds(accountIds);
  }

  // ======================================================
  // GET API KEY BY ID
  // ======================================================

  async findById(userId: string, id: string) {
    const accountIds = await this.getAccountIdsByUserId(userId);

    const apiKey = await this.apiKeysRepository.findByIdAndAccountIds(
      id,
      accountIds,
    );

    if (!apiKey) {
      throw new Error("API key not found.");
    }

    return apiKey;
  }

  // ======================================================
  // REVOKE API KEY
  // ======================================================

  async revoke(userId: string, id: string) {
    await this.findById(userId, id);

    return this.apiKeysRepository.revoke(id);
  }

  // ======================================================
  // DELETE API KEY
  // ======================================================

  async delete(userId: string, id: string) {
    await this.findById(userId, id);

    return this.apiKeysRepository.delete(id);
  }

  // ======================================================
  // GENERATE RAW API KEY
  // ======================================================

  private generateApiKey(): string {
    return `kn_live_${randomBytes(32).toString("hex")}`;
  }

  // ======================================================
  // GENERATE API KEY NUMBER
  // ======================================================

  private generateApiKeyNumber(): string {
    return `KEY-${randomBytes(6).toString("hex").toUpperCase()}`;
  }

  // ======================================================
  // HASH API KEY
  // ======================================================

  private hashApiKey(apiKey: string): string {
    return createHash("sha256").update(apiKey).digest("hex");
  }

  // ======================================================
  // GET USER ACCOUNT IDS
  // ======================================================

  private async getAccountIdsByUserId(userId: string): Promise<string[]> {
    const profile = await this.apiKeysRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new Error("Profile not found.");
    }

    const accounts = await this.apiKeysRepository.findAccountsByProfileId(
      profile.id,
    );

    return accounts.map((account) => account.id);
  }
}
