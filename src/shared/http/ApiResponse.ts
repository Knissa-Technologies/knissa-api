export class ApiResponse {
  static success<T>(data: T, message = "Success") {
    return {
      success: true,

      message,

      data,
    };
  }

  static error(message: string) {
    return {
      success: false,

      message,
    };
  }
}
