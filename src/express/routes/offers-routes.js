'use strict';

const {Router} = require(`express`);
const multer = require(`multer`);
const path = require(`path`);
const {nanoid} = require(`nanoid`);
const {ensureArray} = require(`../../utils`);
const api = require(`../api`).getAPI();

const UPLOAD_DIR = `../upload/img/`;
const OFFERS_PER_PAGE = 8;

const offersRouter = new Router();

const uploadDirAbsolute = path.resolve(__dirname, UPLOAD_DIR);
const storage = multer.diskStorage({
  destination: uploadDirAbsolute,
  filename: (req, file, cb) => {
    const uniqueName = nanoid(10);
    const extension = file.originalname.split(`.`).pop();
    cb(null, `${uniqueName}.${extension}`);
  }
});
const upload = multer({storage});

offersRouter.get(`/category/:id`, async (req, res) => {
  let {page = 1} = req.query;
  const {id} = req.params;
  page = +page;
  const limit = OFFERS_PER_PAGE;
  const offset = (page - 1) * OFFERS_PER_PAGE;

  const {count, offers} = await api.getOffers({limit, offset, comments: true});
  const categories = await api.getCategories(true);

  const totalPages = Math.ceil(count / OFFERS_PER_PAGE);
  res.render(`offers/category`, {categories, offers, page, totalPages, id, count});
});

offersRouter.get(`/add`, async (req, res) => {
  const categories = await api.getCategories();
  res.render(`offers/ticket-add`, {categories});
});

offersRouter.post(`/add`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const offerData = {
    picture: file ? file.filename : ``,
    sum: body.price,
    typeId: Number(body.action),
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.categories),
    userId: 1
  };
  try {
    await api.createOffer(offerData);
    res.redirect(`/my`);
  } catch (error) {
    res.redirect(`back`);
  }
});

offersRouter.get(`/edit/:id`, async (req, res) => {
  const {id} = req.params;
  const [offer, categories] = await Promise.all([
    api.getOffer(id),
    api.getCategories()
  ]);
  res.render(`offers/ticket-edit`, {offer, categories});
});

offersRouter.post(`/edit/:id`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const {id} = req.params;
  const offerData = {
    picture: file ? file.filename : body[`old-image`],
    sum: body.price,
    typeId: Number(body.action),
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.categories),
    userId: 1
  };
  try {
    await api.editOffer(id, offerData);
    res.redirect(`/my`);
  } catch (error) {
    res.redirect(`/offers/edit/${id}`);
  }
});


offersRouter.get(`/:id`, async (req, res) => {
  const {id} = req.params;
  const offer = await api.getOffer(id, true);
  res.render(`offers/ticket`, {offer});
});

module.exports = offersRouter;
