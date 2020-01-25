const Sequelize             = require('sequelize');
const createOrderModel      = require('./order');
const createOrderItemModel  = require('./orderItem');
const createInventoryModel    = require('./inventory');

// establish connection
const sequelize = new Sequelize('treez', 'root', 'rootpassword', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

// define models
const Order = createOrderModel(sequelize);
const OrderItem = createOrderItemModel(sequelize);
const Inventory = createInventoryModel(sequelize);

// Associations between models
Order.hasMany(OrderItem, {foreignKey: 'orderId'});
OrderItem.belongsTo(Inventory, {foreignKey: 'inventoryId'});
// Order.belongsToMany(Inventory, {through: OrderItem});
// Inventory.belongsToMany(Order, {through: OrderItem});

module.exports = {
  sequelize: sequelize,
  Order: Order,
  OrderItem: OrderItem,
  Inventory: Inventory,
};
