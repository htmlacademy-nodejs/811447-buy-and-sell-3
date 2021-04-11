'use strict';

const {nanoid} = require(`nanoid`);
const {MAX_ID_LENGTH} = require(`../../constants`);

class CommentService {
  constructor(offers) {
    this._comments = offers.reduce((comments, offer) => comments.concat(offer.comments), []);
  }

  create(offerId, comment) {
    const newComment = Object.assign({...comment, id: nanoid(MAX_ID_LENGTH), offerId});

    this._comments.push(newComment);
    return newComment;
  }

  drop(id) {
    const comment = this._comments.find((item) => item.id === id);

    if (!comment) {
      return null;
    }

    this._comments = this._comments.filter((item) => item.id !== id);
    return comment;
  }

  findAll(offerId) {
    return this._comments.filter((item) => item.offerId === offerId);
  }
}

module.exports = CommentService;
