const calculatePercentage = (thisMonth, lastMonth) => {
  if (lastMonth == 0) return thisMonth * 100;
  const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
  return percent.toFixed(0);
};

const getChartData = ({ length, docArray, today, property }) => {
  const data = new Array(length).fill(0);

  docArray.forEach((element) => {
    const creationDate = new Date(element.createdAt);
    const monthDiff =
      (today.getFullYear() - creationDate.getFullYear()) * 12 +
      today.getMonth() -
      creationDate.getMonth();

    if (monthDiff >= 0 && monthDiff < length) {
      data[length - monthDiff - 1] += property ? Math.round(Number(element[property] )): 1;
    }
  });

  return data;
};

export { calculatePercentage, getChartData };
