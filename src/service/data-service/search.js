'use strict';

class SearchService {
  constructor(offers) {
    this._offers = offers;
  }

  findAll(query) {
    return this._offers.filter((offer) => offer.title.toLowerCase().includes(query.toLowerCase()));
  }
}

module.exports = SearchService;
