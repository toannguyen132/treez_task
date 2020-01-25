const models = require('../models');
const Inventory = models.Inventory;
const Order = models.Order;
const OrderItem = models.OrderItem;

const seed = async function() {
  /**
   * Create table inventory and migrate data
   */
  await Promise.all([
    Inventory.create({
      name: 'test inventory',
      description: 'test description',
      price: 10,
      quantity: 100
    }), 
    Inventory.create({
      name: 'test inventory 2',
      description: 'test description 2',
      price: 20,
      quantity: 200
    }), 
  ]).then(() => console.log("Seeded Inventory successfully"));
  // --------------------------------------------------
  /**
   * Create table Order and migrate data
   */
  
  await Order.create({
    email: 'admin@treez.com',
    date: new Date(),
    status: 'created'
  }).then("Seeded Order successfully");
  // --------------------------------------------------
  /**
   * Create table OrderItem and migrate data
   */
  await Promise.all([
    OrderItem.create({
      orderId: 1,
      inventoryId: 1,
      quantity: 1,
      price: 10
    }),
    OrderItem.create({
      orderId: 1,
      inventoryId: 2,
      quantity: 2,
      price: 20
    })
  ]).then(() => console.log("Seeded Order Item successfully"));
}

seed();