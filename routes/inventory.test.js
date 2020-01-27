const request     = require('supertest');
const app         = require('../app');
const Models      = require('../models')
const sequelize   = Models.sequelize;
const Inventory   = Models.Inventory;

const PATH = "/inventories";

// close the connection after finishing the test
afterAll((done) => {
  sequelize.close().then(() => done());
});

describe('Test the inventories PATH', () => {

  const sampleInventory = {
    name: "test inventory",
    description: "sample description",
    price: 19.5,
    quantity: 100
  };

  let createdItem = null;

  // create new inventory before each test
  beforeEach(async () => {
    const resp = await request(app)
      .post(PATH)
      .send(sampleInventory)
      .set('Accept', 'application/json');
      
    expect(resp.statusCode).toBe(200);
    expect(resp.body.id).not.toBeFalsy();

    createdItem = await Inventory.findByPk(resp.body.id);

    expect(createdItem).not.toBeFalsy();
  });

  // delete inventory after each test
  afterEach(async () => {
    if (createdItem) {
      createdItem.destroy({force: true});
    }
  });

  // test list inventories
  test('It should get all inventories', async (done) => {
    const resp = await request(app).get(PATH);
    expect(resp.statusCode).toBe(200)
    done();
  });

  // test get single inventory
  test('It should get a single inventory', async () => {
    const resp = await request(app).get(`${PATH}/${createdItem.id}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.id).toEqual(createdItem.id);
  });

  // test create inventory
  test('It should create new inventory', async () => {
    const id = createdItem.id;

    const findResp = await request(app).get(`${PATH}/${id}`);
    expect(findResp.statusCode).toBe(200);
    expect(findResp.body.id).not.toBeFalsy();

  });

  // test edit inventory
  test('It should edit inventory', async () => {
    const id = createdItem.id;
    const editedData = {
      name: 'new name',
      price: 10,
      quantity: 20
    };

    const resp = await request(app)
      .put(`${PATH}/${id}`)
      .send(editedData)
      .set('Accept', 'application/json');

    expect(resp.statusCode).toBe(200);
    expect(resp.body.id).not.toBeFalsy();
    expect(resp.body.name).toEqual(editedData.name);
    expect(resp.body.price).toEqual(editedData.price);
    expect(resp.body.quantity).toEqual(editedData.quantity);
  });

  // test delete inventory
  test('It should able to delete inventory', async () => {
    const id = createdItem.id;

    // delete inventory
    const deleteResp = await request(app)
      .delete(PATH + `/${id}`);
    expect(deleteResp.statusCode).toBe(200);

    // find the inventory again and check deleted
    const findResp = await request(app).get(`${PATH}/${inventory.id}`);
    expect(findResp.statusCode).toBe(404);
  });

});