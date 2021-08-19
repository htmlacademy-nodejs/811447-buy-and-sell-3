'use strict';

const {Router} = require(`express`);
const api = require(`../api`).getAPI();
const auth = require(`../../service/middlewares/auth`);

const myRouter = new Router();

myRouter.get(`/`, auth, async (req, res) => {
  const {user} = req.session;
  const offers = await api.getOffers({comments: true});
  res.render(`my-tickets`, {offers, user});
});

myRouter.get(`/comments`, auth, async (req, res) => {
  const {user} = req.session;
  const offers = await api.getOffers({comments: true});
  res.render(`comments`, {offers: offers.slice(0, 3), user});
});

module.exports = myRouter;
