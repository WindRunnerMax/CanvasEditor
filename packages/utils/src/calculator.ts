export const toFixedNumber = (num: number, fractionDigits: number = 0) => {
  const times = Math.pow(10, fractionDigits);
  const roundNum = Math.round(num * times);
  return roundNum / times;
};
