const Sequelize   = require('sequelize');

module.exports = function(model) {
  return model.define('order', {
    email: {
      type: Sequelize.STRING
    },
    date: {
      type: Sequelize.DATE
    },
    status: {
      type: Sequelize.ENUM('created', 'canceled', 'completed')
    },
  });
};
