'use strict';

const express = require(`express`);
const request = require(`supertest`);

const category = require(`./category`);
const DataService = require(`../data-service/category`);
const {HttpCode} = require(`../../constants`);

const mockData = [
  {
    "id": `KMuPzP`,
    "type": `offer`,
    "title": `Куплю породистого кота`,
    "description": `Если найдёте дешевле — сброшу цену. Даю недельную гарантию. Мой дед не мог её сломать.\`, Кому нужен этот новый телефон, если тут такое...`,
    "sum": 40245,
    "picture": `item12.jpg`,
    "category": [`Животные`],
    "comments": [
      {"id": `ZPKYFX`, "offerId": `KMuPzP`, "text": `Совсем немного... Вы что?! В магазине дешевле. А сколько игр в комплекте?`},
      {"id": `QqIUlz`, "offerId": `KMuPzP`, "text": `Вы что?! В магазине дешевле.`},
      {"id": `FxUfWn`, "offerId": `KMuPzP`, "text": `Совсем немного... Вы что?! В магазине дешевле.`},
      {"id": `SmeUFI`, "offerId": `KMuPzP`, "text": `С чем связана продажа? Почему так дешёво? Продаю в связи с переездом. Отрываю от сердца. Совсем немного...`}
    ]
  },
  {
    "id": `1e6rsz`,
    "type": `sale`,
    "title": `Куплю детские санки`,
    "description": `Даю недельную гарантию. Бонусом отдам все аксессуары. Не пытайтесь торговаться. Цену вещам я знаю. Две страницы заляпаны свежим кофе.`,
    "sum": 40536,
    "picture": `item11.jpg`,
    "category": [`Игры`],
    "comments": [
      {"id": `spcwHC`, "offerId": `1e6rsz`, "text": `Оплата наличными или перевод на карту?`},
      {"id": `b4x6mz`, "offerId": `1e6rsz`, "text": `С чем связана продажа? Почему так дешёво? Вы что?! В магазине дешевле. Оплата наличными или перевод на карту?`}
    ]
  },
  {
    "id": `UcU0Fi`,
    "type": `sale`,
    "title": `Куплю детские санки`,
    "description": `Две страницы заляпаны свежим кофе. Если найдёте дешевле — сброшу цену. Таких предложений больше нет! Бонусом отдам все аксессуары.`,
    "sum": 55539,
    "picture": `item11.jpg`,
    "category": [`Разное`],
    "comments": [
      {"id": `g6IzF6`, "offerId": `UcU0Fi`, "text": `Почему в таком ужасном состоянии? Вы что?! В магазине дешевле. Оплата наличными или перевод на карту?`}
    ]
  },
  {
    "id": `lngpH6`,
    "type": `offer`,
    "title": `Продам коллекцию журналов «Огонёк»`,
    "description": `Не пытайтесь торговаться. Цену вещам я знаю. Это настоящая находка для коллекционера! Кому нужен этот новый телефон, если тут такое... Таких предложений больше нет!`,
    "sum": 45253,
    "picture": `item2.jpg`,
    "category": [`Книги`],
    "comments": [
      {"id": `47uTlq`, "offerId": `lngpH6`, "text": `С чем связана продажа? Почему так дешёво? Оплата наличными или перевод на карту?`}
    ]
  },
  {
    "id": `fjSOzE`,
    "type": `sale`,
    "title": `Продам отличную подборку фильмов на VHS`,
    "description": `Две страницы заляпаны свежим кофе. Если найдёте дешевле — сброшу цену. Даю недельную гарантию. Кому нужен этот новый телефон, если тут такое...`,
    "sum": 82467,
    "picture": `item11.jpg`,
    "category": [`Посуда`],
    "comments": [
      {"id": `eTmK5g`, "offerId": `fjSOzE`, "text": `С чем связана продажа? Почему так дешёво? А сколько игр в комплекте?`},
      {"id": `ceeLlj`, "offerId": `fjSOzE`, "text": `Неплохо, но дорого. А сколько игр в комплекте? Продаю в связи с переездом. Отрываю от сердца.`}
    ]
  }
];

const app = express();
app.use(express.json());
category(app, new DataService(mockData));

describe(`API returns category list`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/categories`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns list of 3 categories`, () => expect(response.body.length).toBe(5));

  test(`Category names are "Животные", "Игры", "Разное", "Книги", "Посуда"`,
      () => expect(response.body).toEqual(
          expect.arrayContaining([`Животные`, `Игры`, `Разное`, `Книги`, `Посуда`])
      )
  );

});
