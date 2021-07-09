'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);
const initDB = require(`../lib/init-db`);
const offer = require(`./offer`);
const DataService = require(`../data-service/offer`);
const CommentService = require(`../data-service/comment`);

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
  }];

const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});

const createAPI = async () => {
  await initDB(mockDB, {categories: mockCategories, offers: mockOffers, types: mockTypes, users: mockUsers});
  const app = express();
  app.use(express.json());
  offer(app, new DataService(mockDB), new CommentService(mockDB));
  return app;
};

describe(`API returns a list of all offers`, () => {
  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app)
      .get(`/offers`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns a list of 5 offers`, () => expect(response.body.length).toBe(5));
});

describe(`API returns an offer with given id`, () => {

  let response;
  let app;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .get(`/offers/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Offer's title is "Куплю породистого кота"`, () => expect(response.body.title).toBe(`Куплю породистого кота`));
});

describe(`API creates an offer if data is valid`, () => {

  const newOffer = {
    categories: [1],
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    typeId: 2,
    sum: 100500,
    userId: 1
  };

  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/offers`)
      .send(newOffer);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));
  test(`Offers count is changed`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(6))
  );
});

describe(`API refuses to create an offer if data is invalid`, () => {

  const newOffer = {
    categories: [1],
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    typeId: 2,
    sum: 100500
  };
  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`Without any required property response code is 400`, async () => {
    for (const key of Object.keys(newOffer)) {
      const badOffer = {...newOffer};
      delete badOffer[key];
      await request(app)
        .post(`/offers`)
        .send(badOffer)
        .expect(HttpCode.BAD_REQUEST);
    }
  });
});

describe(`API changes existent offer`, () => {

  const newOffer = {
    categories: [1],
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    typeId: 2,
    sum: 100500,
    userId: 1
  };
  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .put(`/offers/2`)
      .send(newOffer);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Offer is really changed`, () => request(app)
    .get(`/offers/2`)
    .expect((res) => expect(res.body.title).toBe(`Дам погладить котика`))
  );
});

test(`API returns status code 404 when trying to change non-existent offer`, async () => {

  const app = await createAPI();

  const validOffer = {
    categories: [1],
    title: `валидный`,
    description: `объект`,
    picture: `объявления`,
    typeId: `однако`,
    sum: 404,
    userId: 1
  };

  return request(app)
    .put(`/offers/20`)
    .send(validOffer)
    .expect(HttpCode.NOT_FOUND);
});

test(`API returns status code 400 when trying to change an offer with invalid data`, async () => {

  const app = await createAPI();

  const invalidOffer = {
    categories: [1],
    title: `невалидный`,
    description: `объект`,
    picture: `объявления`,
    typeId: `нет поля sum`
  };

  return request(app)
    .put(`/offers/20`)
    .send(invalidOffer)
    .expect(HttpCode.BAD_REQUEST);
});

describe(`API correctly deletes an offer`, () => {

  let app;
  let response;

  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .delete(`/offers/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Offer count is 4 now`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(4))
  );

});

test(`API refuses to delete non-existent offer`, async () => {

  const app = await createAPI();
  return request(app)
    .delete(`/offers/20`)
    .expect(HttpCode.NOT_FOUND);

});
