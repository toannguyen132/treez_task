const Sequelize = require('sequelize');

module.exports = function(model) {
  return model.define('order_item', {
    orderId: {
      type: Sequelize.INTEGER
    },
    inventoryId: {
      type: Sequelize.INTEGER
    },
    quantity: {
      type: Sequelize.INTEGER
    },
    price: {
      type: Sequelize.DECIMAL
    }
  });
};
