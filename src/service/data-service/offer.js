'use strict';
const Aliase = require(`../models/aliase`);

class OfferService {
  constructor(sequelize) {
    this._Offer = sequelize.models.Offer;
    this._Comment = sequelize.models.Comment;
    this._Category = sequelize.models.Category;
    this._Type = sequelize.models.Type;
    this._User = sequelize.models.User;
  }

  async create(offerData) {
    const offer = await this._Offer.create(offerData);
    await offer.addCategories(offerData.categories.map((category) => Number(category)));
    return offer.get();
  }

  async drop(id) {
    const deletedRows = await this._Offer.destroy({
      where: {id}
    });
    return !!deletedRows;
  }

  async findAll(needComments) {
    const include = [
      Aliase.CATEGORIES,
      Aliase.TYPE,
      {
        model: this._User,
        as: Aliase.USER,
        attributes: {
          exclude: [`passwordHash`]
        }
      }
    ];

    if (needComments) {
      include.push({
        model: this._Comment,
        as: Aliase.COMMENTS,
        include: [
          {
            model: this._User,
            as: Aliase.USER,
            attributes: {
              exclude: [`passwordHash`]
            }
          }
        ]
      });
    }
    const offers = await this._Offer.findAll({
      attributes: [
        `id`,
        `title`,
        `description`,
        `sum`,
        `picture`,
        `createdAt`
      ],
      include
    });
    return offers.map((item) => item.get());
  }

  findOne(id) {
    return this._Offer.findByPk(id, {include: [Aliase.CATEGORIES, Aliase.TYPE, Aliase.COMMENTS]});
  }

  async update(id, offer) {
    const [affectedRows] = await this._Offer.update(offer, {
      where: {id}
    });

    return !!affectedRows;
  }

  async findPage({limit, offset}) {
    const {count, rows} = await this._Offer.findAndCountAll({
      limit,
      offset,
      include: [Aliase.CATEGORIES, Aliase.TYPE],
      distinct: true
    });
    return {count, offers: rows};
  }

}

module.exports = OfferService;
