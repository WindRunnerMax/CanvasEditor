export const LOG_LEVEL = {
  INFO: 0,
  WARNING: 1,
  ERROR: 2,
};

export class Logger {
  constructor(private level: number) {}

  info(...args: unknown[]) {
    if (this.level <= LOG_LEVEL.INFO) {
      console.log("Editor Log: ", ...args);
    }
  }

  trace(...args: unknown[]) {
    if (this.level <= LOG_LEVEL.INFO) {
      console.trace("Editor Trace: ", ...args);
    }
  }

  warning(...args: unknown[]) {
    if (this.level <= LOG_LEVEL.WARNING) {
      console.warn("Editor Warning: ", ...args);
    }
  }

  error(...args: unknown[]) {
    if (this.level <= LOG_LEVEL.ERROR) {
      console.error("Editor Error: ", ...args);
    }
  }
}
