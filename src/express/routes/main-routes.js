'use strict';

const {Router} = require(`express`);
const api = require(`../api`).getAPI();
const upload = require(`../../service/middlewares/upload`);

const OFFERS_PER_PAGE = 8;

const mainRouter = new Router();

mainRouter.get(`/`, async (req, res) => {
  const {user} = req.session;
  let {page = 1} = req.query;
  page = +page;
  const limit = OFFERS_PER_PAGE;
  const offset = (page - 1) * OFFERS_PER_PAGE;

  const [
    {count, offers},
    categories
  ] = await Promise.all([
    api.getOffers({limit, offset}),
    api.getCategories(true)
  ]);

  const totalPages = Math.ceil(count / OFFERS_PER_PAGE);
  res.render(`main`, {offers, categories, page, totalPages, user});
});

mainRouter.get(`/register`, (req, res) => {
  const {error} = req.query;
  res.render(`register`, {error});
});

mainRouter.post(`/register`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const userData = {
    avatar: file ? file.filename : ``,
    name: body[`user-name`],
    email: body[`user-email`],
    password: body[`user-password`],
    passwordRepeated: body[`user-password-again`]
  };

  try {
    await api.createUser(userData);
    res.redirect(`/login`);
  } catch (error) {
    res.redirect(`/register?error=${encodeURIComponent(error.response.data)}`);
  }
});

mainRouter.get(`/login`, (req, res) => {
  const {error} = req.query;
  res.render(`login`, {error});
});

mainRouter.post(`/login`, async (req, res) => {
  try {
    const user = await api.auth(req.body[`user-email`], req.body[`user-password`]);
    req.session.user = user;
    res.redirect(`/`);
  } catch (error) {
    res.redirect(`/login?error=${encodeURIComponent(error.response.data)}`);
  }
});

mainRouter.get(`/logout`, (req, res) => {
  delete req.session.user;
  res.redirect(`/`);
});

mainRouter.get(`/search`, async (req, res) => {
  const {user} = req.session;
  try {
    const {search} = req.query;
    const results = await api.search(search);
    res.render(`search`, {
      results,
      user
    });
  } catch (error) {
    res.render(`search`, {
      results: [],
      user
    });
  }
});

module.exports = mainRouter;
