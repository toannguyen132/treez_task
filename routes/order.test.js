const request     = require('supertest');
const app         = require('../app');
const Models      = require('../models')
const sequelize   = Models.sequelize;
const Inventory   = Models.Inventory;
const OrderItem   = Models.OrderItem;
const Order       = Models.Order;

const PATH_ORDER = "/orders";
const PATH_INVENTORY = "/inventories";

// close the connection after finishing the test
afterAll((done) => {
  sequelize.close().then(() => done());
});


describe('Test orders endpoints', () => {

  const sampleInventories = [{
    name: "test inventory 1",
    description: "sample description",
    price: 10,
    quantity: 100
  }, {
    name: "test inventory 2",
    description: "sample description",
    price: 20,
    quantity: 200
  }]

  const sampleOrder = {
    email: "sample@test.com",
    items: []
  };

  let createdInventories = [];
  let createdOrder = null;

  // create new inventory before each test
  beforeEach(async () => {
    // reset global variable
    createdInventories = [];
    createdOrder = null;
    sampleOrder.items = [];

    // create inventories first
    for (let item of sampleInventories) {
      let resp = await request(app)
        .post(PATH_INVENTORY)
        .send(item)
        .set('Accept', 'application/json');

      expect(resp.statusCode).toBe(200);
      expect(resp.body.id).not.toBeFalsy();

      let inventory = await Inventory.findByPk(resp.body.id)
      expect(inventory).not.toBeFalsy();
      createdInventories.push(inventory);
    }

    // assign inventory id to order item
    for (let item of createdInventories) {
      sampleOrder.items.push({
        inventoryId: item.id,
        quantity: 10
      });
    }

    // create order
    let resp = await request(app)
      .post(PATH_ORDER)
      .send(sampleOrder)
      .set('Accept', 'application/json');
      
    expect(resp.statusCode).toBe(200);
    expect(resp.body.id).not.toBeFalsy();

    createdOrder = await Order.findByPk(resp.body.id, {
      include: {
        model: OrderItem
      }
    });

    expect(createdOrder).not.toBeFalsy();
  });

  // delete inventory after each test
  afterEach(async () => {
    if (createdOrder) {
      await createdOrder.destroy({force: true});
    }
    if (createdInventories) {
      for (let item of createdInventories) {
        await item.destroy({force: true});
      }
    }
  });

  /**
   * BEGIN TEST
   */

  // test list inventories
  test('It should response with order list', async () => {
    const resp = await request(app).get(PATH_ORDER);
    expect(resp.statusCode).toBe(200)
  });

  // test get single inventory
  test('It should response with single order', async () => {
    const resp = await request(app).get(`${PATH_ORDER}/${createdOrder.id}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.id).toEqual(createdOrder.id);
  });

  // test get single inventory
  test('It should response 404 if request non exist order', async () => {
    const resp = await request(app).get(`${PATH_ORDER}/9999999999`);
    expect(resp.statusCode).toBe(404);
    expect(resp.body).toHaveProperty('message');
  });

  // test get single inventory
  test('It should response 400 if request invaid id', async () => {
    const resp = await request(app).get(`${PATH_ORDER}/0`);
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toHaveProperty('message');
  });
  
  // test get create new order
  test('It should response with detail of order after creating', async () => {
    const orderData = {
      email: "neworder@test.com",
      items: []
    };
    for (let item of createdInventories) {
      orderData.items.push({
        inventoryId: item.id,
        quantity: 5
      });
    }

    const resp = await request(app)
      .post(PATH_ORDER)
      .send(orderData);

    expect(resp.statusCode).toBe(200)
    expect(resp.body.id).not.toBeFalsy();
    expect(resp.body.order_items).toHaveLength(createdInventories.length);

    const inventoryResp = await request(app)
      .get(`${PATH_INVENTORY}/${createdInventories[0].id}`)
    
    expect(inventoryResp.statusCode).toBe(200);
    // the first order take 10, the second order take 5, so the amount left is 85
    expect(inventoryResp.body.quantity).toEqual( sampleInventories[0].quantity - 10 - 5 );

    // manually delete 
    let order = await Order.findByPk(resp.body.id);
    order.destroy({force: true})

    expect(resp.statusCode).toBe(200)
  });

  // test create new order with failed information
  test('It should response error when creating order with wrong email', async () => {
    const orderData = {
      email: "not an email",
      items: []
    };

    for (let item of createdInventories) {
      orderData.items.push({
        inventoryId: item.id,
        quantity: 5
      });
    }

    const resp = await request(app)
      .post(PATH_ORDER)
      .send(orderData);

    expect(resp.statusCode).toBe(400)

  });

  // test create new order with failed information
  test('It should response error when creating order with item quantity', async () => {
    const orderData = {
      email: "correct@email.com",
      items: []
    };

    for (let item of createdInventories) {
      orderData.items.push({
        inventoryId: item.id,
        quantity: 9999
      });
    }

    const resp = await request(app)
      .post(PATH_ORDER)
      .send(orderData);

    expect(resp.statusCode).toBe(400)
  });

  // test edit order
  test('It should response OK to edit request', async () => {
    const editedOrderData = {
      email: 'test@gmail.com'
    }

    const resp = await request(app)
      .put(`${PATH_ORDER}/${createdOrder.id}`)
      .send(editedOrderData);

    expect(resp.statusCode).toBe(200);
    expect(resp.body.order_items).toHaveLength(2); // the order items should be the same
  });

  // test edit order
  test('It should response 400 if edit with invalid data', async () => {
    const editedOrderData = {
      email: 'this is not an email'
    }

    const resp = await request(app)
      .put(`${PATH_ORDER}/${createdOrder.id}`)
      .send(editedOrderData);

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toHaveProperty('message');
  });

  // test edit order
  test('It should response the correct quantity when edit', async () => {
    const editedOrderData = {
      email: 'test@gmail.com',
      items: [{
        inventoryId: createdInventories[0].id,
        quantity: 10
      }]
    }

    const resp = await request(app)
      .put(`${PATH_ORDER}/${createdOrder.id}`)
      .send(editedOrderData);

    expect(resp.statusCode).toBe(200);

    // sampleInventories
    const getResp = await request(app)
      .get(`${PATH_INVENTORY}/${createdInventories[1].id}`);
    
    expect(getResp.statusCode).toBe(200);
    // the quantity of the 2nd inventory should be rollbacked
    expect(getResp.body.quantity).toEqual(sampleInventories[1].quantity);
  });

  // test cancel order
  test('It should response ok when delete', async () => {
    const resp = await request(app)
      .delete(`${PATH_ORDER}/${createdOrder.id}`);

    expect(resp.statusCode).toBe(200);
    
    const getResp = await request(app)
      .get(`${PATH_ORDER}/${createdOrder.id}`)
    
    expect(getResp.statusCode).toBe(200);
    expect(getResp.body.status).toEqual('canceled');
  }); 
});