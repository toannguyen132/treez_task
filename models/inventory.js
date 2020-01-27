const Sequelize   = require('sequelize');

module.exports = function(model) {
  return model.define('inventory', {
    name: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    price: {
      type: Sequelize.DECIMAL(10, 2)
    },
    quantity: {
      type: Sequelize.INTEGER
    },
  }, {
    paranoid: true,
  });
};

