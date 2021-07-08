"use strict";
const {Model} = require(`sequelize`);

const Aliase = require(`./aliase`);
const defineCategory = require(`./category`);
const defineComment = require(`./comment`);
const defineOffer = require(`./offer`);
const defineType = require(`./type`);
const defineUser = require(`./user`);

class OfferCategory extends Model {}

const define = (sequelize) => {
  const Category = defineCategory(sequelize);
  const Comment = defineComment(sequelize);
  const Offer = defineOffer(sequelize);
  const Type = defineType(sequelize);
  const User = defineUser(sequelize);

  Offer.hasMany(Comment, {as: Aliase.COMMENTS, foreignKey: `offerId`});
  Comment.belongsTo(Offer, {foreignKey: `offerId`});

  Offer.belongsTo(Type, {as: Aliase.TYPE, foreignKey: `typeId`});
  Type.hasMany(Offer, {foreignKey: `typeId`});

  OfferCategory.init({}, {
    sequelize,
    modelName: `OfferCategory`,
    tableName: `offerCategories`,
    timestamps: false
  });

  Offer.belongsToMany(Category, {through: OfferCategory, as: Aliase.CATEGORIES});
  Category.belongsToMany(Offer, {through: OfferCategory, as: Aliase.OFFERS});
  Category.hasMany(OfferCategory, {as: Aliase.OFFER_CATEGORIES});

  User.hasMany(Offer, {as: Aliase.OFFERS, foreignKey: `userId`});
  Offer.belongsTo(User, {as: Aliase.USER, foreignKey: `userId`});

  User.hasMany(Comment, {as: Aliase.COMMENTS, foreignKey: `userId`});
  Comment.belongsTo(User, {as: Aliase.USER, foreignKey: `userId`});

  return {Category, Comment, Offer, Type, OfferCategory, User};
};

module.exports = define;
