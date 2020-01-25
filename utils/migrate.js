var models = require('../models');
var Inventory = models.Inventory;
var Order = models.Order;
var OrderItem = models.OrderItem;

var migrate = async function() {
  await models.sequelize.drop();
  /**
   * Create table Order and migrate data
   */
  await Order.sync({force: true})
  // --------------------------------------------------
  /**
   * Create table inventory and migrate data
   */
  await Inventory.sync({force: true})
  // --------------------------------------------------
  /**
   * Create table OrderItem and migrate data
   */
  await OrderItem.sync({force: true})
}

migrate();