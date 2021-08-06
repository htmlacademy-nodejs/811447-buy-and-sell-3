'use strict';
const {Router} = require(`express`);
const sequelize = require(`../lib/sequelize`);
const defineModels = require(`../models`);
const category = require(`./category`);
const offer = require(`./offer`);
const search = require(`./search`);
const user = require(`./user`);

const {
  CategoryService,
  SearchService,
  OfferService,
  CommentService,
  UserService
} = require(`../data-service`);

const app = new Router();
defineModels(sequelize);

(async () => {
  category(app, new CategoryService(sequelize));
  search(app, new SearchService(sequelize));
  offer(app, new OfferService(sequelize), new CommentService(sequelize));
  user(app, new UserService(sequelize));
})();

module.exports = app;
