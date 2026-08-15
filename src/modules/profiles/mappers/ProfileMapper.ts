export class ProfileMapper {
  static toResponse(profile: any) {
    return {
      id: profile.id,
      profileNumber: profile.profileNumber,

      userId: profile.userId,

      displayName: profile.displayName,
      legalName: profile.legalName,

      firstName: profile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName,

      birthDate: profile.birthDate,

      phoneCountryCode: profile.phoneCountryCode,
      phoneNumber: profile.phoneNumber,

      avatarUrl: profile.avatarUrl,

      languageCode: profile.languageCode,
      languageId: profile.languageId,

      timezoneId: profile.timezoneId,

      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}