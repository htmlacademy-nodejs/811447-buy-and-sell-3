"use strict";

const defineModels = require(`../models`);
const Aliase = require(`../models/aliase`);
const {getCategoryImageName} = require(`../../utils`);
const {getLogger} = require(`../lib/logger`);
const logger = getLogger({name: `generate`});

module.exports = async (sequelize, {categories, offers, types, users}) => {
  const {Category, Offer, Type, User} = defineModels(sequelize);
  await sequelize.sync({force: true});

  const categoryModels = await Category.bulkCreate(
      categories.map((item, index) => ({name: item, image: getCategoryImageName(index + 1)}))
  );

  await Type.bulkCreate(
      types.map((item) => ({name: item}))
  );

  const categoryIdByName = categoryModels.reduce((acc, next) => ({
    [next.name]: next.id,
    ...acc
  }), {});

  const userModels = await User.bulkCreate(users, {include: [Aliase.OFFERS, Aliase.COMMENTS]});

  const userIdByEmail = userModels.reduce((acc, next) => ({
    [next.email]: next.id,
    ...acc
  }), {});

  offers.forEach((offer) => {
    offer.userId = userIdByEmail[offer.user];
    offer.comments.forEach((comment) => {
      comment.userId = userIdByEmail[comment.user];
    });
  });

  const offerPromises = offers.map(async (offer) => {
    const offerModel = await Offer.create(offer, {include: [Aliase.COMMENTS, Aliase.TYPE]});
    await offerModel.addCategories(
        offer.categories.map(
            (name) => categoryIdByName[name]
        )
    );
  });

  try {
    await Promise.all(offerPromises);
  } catch (error) {
    logger.error(error);
  }
};
