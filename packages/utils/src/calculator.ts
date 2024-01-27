export const toFixedNumber = (num: number, fractionDigits = 0) => {
  const times = Math.pow(10, fractionDigits);
  const roundNum = Math.round(num * times);
  return roundNum / times;
};
