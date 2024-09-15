export const noZero = (num: number) => {
  // COMPAT: 避免出现 0 值以及 0.5 值的不确定性
  return Math.max(num, 1);
};

export const noFloat = (num: number, forward = true) => {
  // COMPAT: 避免出现小数
  return forward ? Math.ceil(num) : Math.floor(num);
};
