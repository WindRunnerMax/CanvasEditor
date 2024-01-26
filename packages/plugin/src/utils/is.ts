import { FALSE, TRUE } from "./constant";

export const isTrue = (value: unknown) => {
  return value === TRUE;
};

export const isFalse = (value: unknown) => {
  return !value || value === FALSE;
};
