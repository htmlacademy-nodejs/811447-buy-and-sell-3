'use strict';

module.exports.getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.shuffle = (someArray) => {
  for (let i = someArray.length - 1; i > 0; i--) {
    const randomPosition = Math.floor(Math.random() * i);
    [someArray[i], someArray[randomPosition]] = [someArray[randomPosition], someArray[i]];
  }

  return someArray;
};

module.exports.getPictureFileName = (number) => {
  const numberFormatted = new Intl.NumberFormat(`ru-RU`, {
    minimumIntegerDigits: 2
  }).format(number);
  return `item${numberFormatted}.jpg`;
};

module.exports.getCategoryImageName = (number) => {
  const numberFormatted = new Intl.NumberFormat(`ru-RU`, {
    minimumIntegerDigits: 2
  }).format(number);
  return `cat${numberFormatted}.jpg`;
};

module.exports.ensureArray = (value) => Array.isArray(value) ? value : [value];
