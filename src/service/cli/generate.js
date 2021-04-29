'use strict';
const fs = require(`fs`).promises;
const {nanoid} = require(`nanoid`);
const {getLogger} = require(`../lib/logger`);
const logger = getLogger({name: `generate`});

const {
  getRandomInt,
  shuffle,
  getPictureFileName
} = require(`../../utils`);

const DEFAULT_COUNT = 1;
const FILE_NAME = `mocks.json`;
const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;
const FILE_COMMENTS_PATH = `./data/comments.txt`;

const MAX_ID_LENGTH = 6;
const MAX_COMMENTS = 4;

const OfferType = {
  OFFER: `offer`,
  SALE: `sale`,
};


const SumRestrict = {
  MIN: 1000,
  MAX: 100000,
};

const PictureRestrict = {
  MIN: 1,
  MAX: 16,
};

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.split(`\n`).slice(0, -1);
  } catch (err) {
    logger.error(err);
    return [];
  }
};

const generateComments = (count, comments, offerId) => (
  Array(count).fill({}).map(() => ({
    id: nanoid(MAX_ID_LENGTH),
    offerId,
    text: shuffle(comments.slice(0, -1))
      .slice(0, getRandomInt(1, 3))
      .join(` `),
  }))
);

const generateOffers = (count, titles, categories, sentences, comments) => (
  Array(count).fill({}).map(() => {
    const id = nanoid(MAX_ID_LENGTH);
    return {
      id,
      type: OfferType[Object.keys(OfferType)[Math.floor(Math.random() * Object.keys(OfferType).length)]],
      title: titles[getRandomInt(0, titles.length - 1)],
      description: shuffle(sentences).slice(1, 5).join(` `),
      sum: getRandomInt(SumRestrict.MIN, SumRestrict.MAX),
      picture: getPictureFileName(getRandomInt(PictureRestrict.MIN, PictureRestrict.MAX)),
      category: [categories[getRandomInt(0, categories.length - 1)]],
      comments: generateComments(getRandomInt(1, MAX_COMMENTS), comments, id),
    };
  })
);

module.exports = {
  name: `--generate`,
  async run(args) {
    const sentences = await readContent(FILE_SENTENCES_PATH);
    const titles = await readContent(FILE_TITLES_PATH);
    const categories = await readContent(FILE_CATEGORIES_PATH);
    const comments = await readContent(FILE_COMMENTS_PATH);

    const [count] = args;
    const countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;
    const content = JSON.stringify(generateOffers(countOffer, titles, categories, sentences, comments));

    try {
      await fs.writeFile(FILE_NAME, content);
      logger.info(`Операция завершилась успешно. Файл создан.`);

    } catch (err) {
      logger.error(`Не удалось записать данные в файл...`);
    }
  }
};
