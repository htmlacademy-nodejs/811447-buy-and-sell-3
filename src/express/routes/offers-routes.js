'use strict';

const {Router} = require(`express`);
const csrf = require(`csurf`);
const {ensureArray} = require(`../../utils`);
const api = require(`../api`).getAPI();
const upload = require(`../../service/middlewares/upload`);
const auth = require(`../../service/middlewares/auth`);

const csrfProtection = csrf();

const OFFERS_PER_PAGE = 8;

const offersRouter = new Router();

offersRouter.get(`/category/:id`, async (req, res) => {
  const {user} = req.session;
  let {page = 1} = req.query;
  const {id} = req.params;
  page = +page;
  const limit = OFFERS_PER_PAGE;
  const offset = (page - 1) * OFFERS_PER_PAGE;

  const {count, offers} = await api.getOffers({limit, offset, comments: true});
  const categories = await api.getCategories(true);

  const totalPages = Math.ceil(count / OFFERS_PER_PAGE);
  res.render(`offers/category`, {categories, offers, page, totalPages, id, count, user});
});

offersRouter.get(`/add`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {error} = req.query;
  const categories = await api.getCategories();
  res.render(`offers/ticket-add`, {categories, error, user, csrfToken: req.csrfToken()});
});

offersRouter.post(`/add`, auth, upload.single(`avatar`), csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {body, file} = req;
  const offerData = {
    picture: file ? file.filename : ``,
    sum: body.price,
    typeId: Number(body.action),
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.categories),
    userId: user.id
  };
  try {
    await api.createOffer(offerData);
    res.redirect(`/my`);
  } catch (error) {
    res.redirect(`/offers/add?error=${encodeURIComponent(error.response.data)}`);
  }
});

offersRouter.get(`/edit/:id`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const {error} = req.query;
  const [offer, categories] = await Promise.all([
    api.getOffer(id),
    api.getCategories()
  ]);
  res.render(`offers/ticket-edit`, {id, offer, categories, error, user, csrfToken: req.csrfToken()});
});

offersRouter.post(`/edit/:id`, auth, upload.single(`avatar`), csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {body, file} = req;
  const {id} = req.params;
  const offerData = {
    picture: file ? file.filename : body[`old-image`],
    sum: body.price,
    typeId: Number(body.action),
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.categories),
    userId: user.id
  };
  try {
    await api.editOffer(id, offerData);
    res.redirect(`/my`);
  } catch (error) {
    res.redirect(`/offers/edit/${id}?error=${encodeURIComponent(error.response.data)}`);
  }
});


offersRouter.get(`/:id`, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const {error} = req.query;
  const offer = await api.getOffer(id, true);
  res.render(`offers/ticket`, {offer, id, error, user, csrfToken: req.csrfToken()});
});

offersRouter.post(`/:id/comments`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const {comment} = req.body;

  try {
    await api.createComment(id, {userId: user.id, text: comment});
    res.redirect(`/offers/${id}`);
  } catch (error) {
    res.redirect(`/offers/${id}?error=${encodeURIComponent(error.response.data)}`);
  }
});

module.exports = offersRouter;
