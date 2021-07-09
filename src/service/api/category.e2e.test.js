'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const category = require(`./category`);
const DataService = require(`../data-service/category`);
const initDB = require(`../lib/init-db`);
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
    "comments": [
      {"text": `Совсем немного... Вы что?! В магазине дешевле. А сколько игр в комплекте?`, "user": `petrov@example.com`},
      {"text": `Вы что?! В магазине дешевле.`, "user": `petrov@example.com`},
      {"text": `Совсем немного... Вы что?! В магазине дешевле.`, "user": `petrov@example.com`},
      {"text": `С чем связана продажа? Почему так дешёво? Продаю в связи с переездом. Отрываю от сердца. Совсем немного...`, "user": `petrov@example.com`}
    ]
  },
  {
    "typeId": 2,
    "title": `Куплю детские санки`,
    "description": `Даю недельную гарантию. Бонусом отдам все аксессуары. Не пытайтесь торговаться. Цену вещам я знаю. Две страницы заляпаны свежим кофе.`,
    "sum": 40536,
    "picture": `item11.jpg`,
    "categories": [`Игры`],
    "comments": [
      {"text": `Оплата наличными или перевод на карту?`, "user": `petrov@example.com`},
      {"text": `С чем связана продажа? Почему так дешёво? Вы что?! В магазине дешевле. Оплата наличными или перевод на карту?`, "user": `petrov@example.com`}
    ]
  },
  {
    "typeId": 1,
    "title": `Куплю детские санки`,
    "description": `Две страницы заляпаны свежим кофе. Если найдёте дешевле — сброшу цену. Таких предложений больше нет! Бонусом отдам все аксессуары.`,
    "sum": 55539,
    "picture": `item11.jpg`,
    "categories": [`Игры`],
    "comments": [
      {"text": `Почему в таком ужасном состоянии? Вы что?! В магазине дешевле. Оплата наличными или перевод на карту?`, "user": `petrov@example.com`}
    ]
  },
  {
    "typeId": 2,
    "title": `Продам коллекцию журналов «Огонёк»`,
    "description": `Не пытайтесь торговаться. Цену вещам я знаю. Это настоящая находка для коллекционера! Кому нужен этот новый телефон, если тут такое... Таких предложений больше нет!`,
    "sum": 45253,
    "picture": `item2.jpg`,
    "categories": [`Животные`],
    "comments": [
      {"text": `С чем связана продажа? Почему так дешёво? Оплата наличными или перевод на карту?`, "user": `petrov@example.com`}
    ]
  },
  {
    "typeId": 1,
    "title": `Продам отличную подборку фильмов на VHS`,
    "description": `Две страницы заляпаны свежим кофе. Если найдёте дешевле — сброшу цену. Даю недельную гарантию. Кому нужен этот новый телефон, если тут такое...`,
    "sum": 82467,
    "picture": `item11.jpg`,
    "categories": [`Животные`],
    "comments": [
      {"text": `С чем связана продажа? Почему так дешёво? А сколько игр в комплекте?`, "user": `petrov@example.com`},
      {"text": `Неплохо, но дорого. А сколько игр в комплекте? Продаю в связи с переездом. Отрываю от сердца.`, "user": `petrov@example.com`}
    ]
  }
];

const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});

const app = express();
app.use(express.json());

beforeAll(async () => {
  await initDB(mockDB, {categories: mockCategories, offers: mockOffers, types: mockTypes, users: mockUsers});
  category(app, new DataService(mockDB));
});

describe(`API returns category list`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/categories`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns list of 3 categories`, () => expect(response.body.length).toBe(3));

  test(`Category names are "Животные", "Игры", "Журналы"`,
      () => expect(response.body).toEqual(
          expect.arrayContaining([{"id": 1, "image": `cat01.jpg`, "name": `Животные`}, {"id": 2, "image": `cat02.jpg`, "name": `Журналы`}, {"id": 3, "image": `cat03.jpg`, "name": `Игры`}])
      )
  );

});
