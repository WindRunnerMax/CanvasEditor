declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}
declare const __DEV__: boolean;

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production";
  }
}
