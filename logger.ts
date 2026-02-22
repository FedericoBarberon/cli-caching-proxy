export enum LogLevel {
  INFO = "INFO",
  DEBUG = "DEBUG",
  ERROR = "ERROR",
}

export function log(logLevel: LogLevel, message: string) {
  console.log(`[${logLevel}]: ${message}`);
}
