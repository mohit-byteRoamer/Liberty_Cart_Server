const calculatePercentage = (thisMonth, lastMonth) => {
  if (lastMonth == 0) return thisMonth * 100;
  const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
  return percent.toFixed(0);
};

export { calculatePercentage };
