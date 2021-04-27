'use strict';

const express = require(`express`);
const request = require(`supertest`);

const offer = require(`./offer`);
const DataService = require(`../data-service/offer`);
const CommentService = require(`../data-service/comment`);

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

const createAPI = () => {
  const app = express();
  const cloneData = JSON.parse(JSON.stringify(mockData));
  app.use(express.json());
  offer(app, new DataService(cloneData), new CommentService(cloneData));
  return app;
};

describe(`API returns a list of all offers`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/offers`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns a list of 5 offers`, () => expect(response.body.length).toBe(5));
  test(`First offer's id equals "KMuPzP"`, () => expect(response.body[0].id).toBe(`KMuPzP`));
});

describe(`API returns an offer with given id`, () => {

  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/offers/KMuPzP`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Offer's title is "Куплю породистого кота"`, () => expect(response.body.title).toBe(`Куплю породистого кота`));
});

describe(`API creates an offer if data is valid`, () => {

  const newOffer = {
    category: [`Котики`],
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `offer`,
    sum: 100500
  };
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/offers`)
      .send(newOffer);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));
  test(`Returns offer created`, () => expect(response.body).toEqual(expect.objectContaining(newOffer)));
  test(`Offers count is changed`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(6))
  );
});

describe(`API refuses to create an offer if data is invalid`, () => {

  const newOffer = {
    category: `Котики`,
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `offer`,
    sum: 100500
  };
  const app = createAPI();

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
    category: `Котики`,
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    sum: 100500
  };
  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .put(`/offers/KMuPzP`)
      .send(newOffer);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns changed offer`, () => expect(response.text).toEqual(`Updated`));
  test(`Offer is really changed`, () => request(app)
    .get(`/offers/KMuPzP`)
    .expect((res) => expect(res.body.title).toBe(`Дам погладить котика`))
  );
});

test(`API returns status code 404 when trying to change non-existent offer`, () => {

  const app = createAPI();

  const validOffer = {
    category: `Это`,
    title: `валидный`,
    description: `объект`,
    picture: `объявления`,
    type: `однако`,
    sum: 404
  };

  return request(app)
    .put(`/offers/NOEXST`)
    .send(validOffer)
    .expect(HttpCode.NOT_FOUND);
});

test(`API returns status code 400 when trying to change an offer with invalid data`, () => {

  const app = createAPI();

  const invalidOffer = {
    category: `Это`,
    title: `невалидный`,
    description: `объект`,
    picture: `объявления`,
    type: `нет поля sum`
  };

  return request(app)
    .put(`/offers/NOEXST`)
    .send(invalidOffer)
    .expect(HttpCode.BAD_REQUEST);
});

describe(`API correctly deletes an offer`, () => {

  const app = createAPI();
  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/offers/KMuPzP`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns deleted offer`, () => expect(response.body.id).toBe(`KMuPzP`));
  test(`Offer count is 5 now`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(5))
  );

});

test(`API refuses to delete non-existent offer`, () => {

  const app = createAPI();
  return request(app)
    .delete(`/offers/NOEXST`)
    .expect(HttpCode.NOT_FOUND);

});
