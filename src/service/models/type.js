'use strict';

const {DataTypes, Model} = require(`sequelize`);

class Type extends Model {}

const define = (sequelize) => Type.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: `Type`,
  tableName: `types`,
  timestamps: false
});

module.exports = define;
