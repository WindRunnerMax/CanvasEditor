import { FALSY, TRULY } from "./constant";

export const isTruly = (value: unknown) => {
  return value === TRULY;
};

export const isFalsy = (value: unknown) => {
  return !value || value === FALSY;
};
