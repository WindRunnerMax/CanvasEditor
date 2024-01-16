export const LOG_LEVEL = {
  DEBUG: -1,
  INFO: 0,
  WARNING: 1,
  ERROR: 2,
};

export class Logger {
  constructor(private level: number) {}

  debug(...args: unknown[]) {
    if (this.level <= LOG_LEVEL.DEBUG) {
      console.log("DEBUG: ", ...args);
    }
  }

  info(...args: unknown[]) {
    if (this.level <= LOG_LEVEL.INFO) {
      console.log("Log: ", ...args);
    }
  }

  warning(...args: unknown[]) {
    if (this.level <= LOG_LEVEL.WARNING) {
      console.warn("Warning: ", ...args);
    }
  }

  error(...args: unknown[]) {
    if (this.level <= LOG_LEVEL.ERROR) {
      console.error("Error: ", ...args);
    }
  }

  trace(...args: unknown[]) {
    if (this.level <= LOG_LEVEL.ERROR) {
      console.trace("Trace: ", ...args);
    }
  }
}
