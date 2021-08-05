'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);
const user = require(`./user`);
const initDB = require(`../lib/init-db`);
const DataService = require(`../data-service/user`);
const {HttpCode} = require(`../../constants`);

const mockCategories = [
  `Животные`,
  `Журналы`,
  `Игры`
];

const mockTypes = [`offer`, `sale`];

const mockUsers = [
  {
    name: `Иван Иванов`,
    email: `ivanov@example.com`,
    passwordHash: `ivanov`,
    avatar: `avatar01.jpg`
  },
  {
    name: `Пётр Петров`,
    email: `petrov@example.com`,
    passwordHash: `petrov`,
    avatar: `avatar02.jpg`
  }
];

const mockOffers = [
  {
    "typeId": 1,
    "title": `Куплю породистого кота`,
    "description": `Если найдёте дешевле — сброшу цену. Даю недельную гарантию. Мой дед не мог её сломать.\`, Кому нужен этот новый телефон, если тут такое...`,
    "sum": 40245,
    "picture": `item12.jpg`,
    "categories": [`Животные`],
    "userId": 1,
    "comments": [
      {"text": `Совсем немного... Вы что?! В магазине дешевле. А сколько игр в комплекте?`, "userId": 2},
      {"text": `Вы что?! В магазине дешевле.`, "userId": 2},
      {"text": `Совсем немного... Вы что?! В магазине дешевле.`, "userId": 2},
      {"text": `С чем связана продажа? Почему так дешёво? Продаю в связи с переездом. Отрываю от сердца. Совсем немного...`, "userId": 2}
    ]
  },
  {
    "typeId": 2,
    "title": `Куплю детские санки`,
    "description": `Даю недельную гарантию. Бонусом отдам все аксессуары. Не пытайтесь торговаться. Цену вещам я знаю. Две страницы заляпаны свежим кофе.`,
    "sum": 40536,
    "picture": `item11.jpg`,
    "categories": [`Игры`],
    "userId": 1,
    "comments": [
      {"text": `Оплата наличными или перевод на карту?`, "userId": 1},
      {"text": `С чем связана продажа? Почему так дешёво? Вы что?! В магазине дешевле. Оплата наличными или перевод на карту?`, "userId": 1}
    ]
  },
  {
    "typeId": 1,
    "title": `Куплю детские санки`,
    "description": `Две страницы заляпаны свежим кофе. Если найдёте дешевле — сброшу цену. Таких предложений больше нет! Бонусом отдам все аксессуары.`,
    "sum": 55539,
    "picture": `item11.jpg`,
    "categories": [`Игры`],
    "userId": 1,
    "comments": [
      {"text": `Почему в таком ужасном состоянии? Вы что?! В магазине дешевле. Оплата наличными или перевод на карту?`, "userId": 2}
    ]
  },
  {
    "typeId": 2,
    "title": `Продам коллекцию журналов «Огонёк»`,
    "description": `Не пытайтесь торговаться. Цену вещам я знаю. Это настоящая находка для коллекционера! Кому нужен этот новый телефон, если тут такое... Таких предложений больше нет!`,
    "sum": 45253,
    "picture": `item2.jpg`,
    "categories": [`Животные`],
    "userId": 1,
    "comments": [
      {"text": `С чем связана продажа? Почему так дешёво? Оплата наличными или перевод на карту?`, "userId": 2}
    ]
  },
  {
    "typeId": 1,
    "title": `Продам отличную подборку фильмов на VHS`,
    "description": `Две страницы заляпаны свежим кофе. Если найдёте дешевле — сброшу цену. Даю недельную гарантию. Кому нужен этот новый телефон, если тут такое...`,
    "sum": 82467,
    "picture": `item11.jpg`,
    "categories": [`Животные`],
    "userId": 1,
    "comments": [
      {"text": `С чем связана продажа? Почему так дешёво? А сколько игр в комплекте?`, "userId": 2},
      {"text": `Неплохо, но дорого. А сколько игр в комплекте? Продаю в связи с переездом. Отрываю от сердца.`, "userId": 2}
    ]
  }];

const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});

const createAPI = async () => {
  await initDB(mockDB, {categories: mockCategories, offers: mockOffers, types: mockTypes, users: mockUsers});
  const app = express();
  app.use(express.json());
  user(app, new DataService(mockDB));
  return app;
};

describe(`API refuses to create user if data is invalid`, () => {
  const validUserData = {
    name: `Сидор Сидоров`,
    email: `sidorov@example.com`,
    password: `sidorov`,
    passwordRepeated: `sidorov`,
    avatar: `sidorov.jpg`
  };

  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`Without any required property response code is 400`, async () => {
    for (const key of Object.keys(validUserData)) {
      const badUserData = {...validUserData};
      delete badUserData[key];
      await request(app)
        .post(`/user`)
        .send(badUserData)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

  test(`When field type is wrong response code is 400`, async () => {
    const badUsers = [
      {...validUserData, firstName: true},
      {...validUserData, email: 1}
    ];
    for (const badUserData of badUsers) {
      await request(app)
        .post(`/user`)
        .send(badUserData)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

  test(`When field value is wrong response code is 400`, async () => {
    const badUsers = [
      {...validUserData, password: `short`, passwordRepeated: `short`},
      {...validUserData, email: `invalid`}
    ];
    for (const badUserData of badUsers) {
      await request(app)
        .post(`/user`)
        .send(badUserData)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

  test(`When password and passwordRepeated are not equal, code is 400`, async () => {
    const badUserData = {...validUserData, passwordRepeated: `not sidorov`};
    await request(app)
      .post(`/user`)
      .send(badUserData)
      .expect(HttpCode.BAD_REQUEST);
  });

  test(`When email is already in use status code is 400`, async () => {
    const badUserData = {...validUserData, email: `ivanov@example.com`};
    await request(app)
      .post(`/user`)
      .send(badUserData)
      .expect(HttpCode.BAD_REQUEST);
  });
});
