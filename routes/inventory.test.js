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

describe('Test the inventories endpoints', () => {

  // the sample inventory added in every test to check
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
  test('It should response corresponding inventory when request to /inventories/:id ', async () => {
    const resp = await request(app).get(`${PATH}/${createdItem.id}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.id).toEqual(createdItem.id);
  });

  // test get single inventory
  test('It should response 400 if request invalid id', async () => {
    const resp = await request(app).get(`${PATH}/0`);
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toHaveProperty('message');
  });

  // test get single inventory
  test('It should response 404 if request non-existed inventory', async () => {
    const resp = await request(app).get(`${PATH}/9999999`);
    console.log(resp.body);
    expect(resp.statusCode).toBe(404);
    expect(resp.body).toHaveProperty('message');
  });

  // test create inventory
  test('It should create new inventory', async () => {
    const id = createdItem.id;

    const findResp = await request(app).get(`${PATH}/${id}`);
    expect(findResp.statusCode).toBe(200);
    expect(findResp.body.id).not.toBeFalsy();
  });

  // test create inventory
  test('It should response 400 when create new inventory with invalid data', async () => {
    const id = createdItem.id;
    const invalidData = {...sampleInventory, price: -1, quanlity: "one hundred"};

    const findResp = await request(app)
      .post(`${PATH}`)
      .send(invalidData)

    expect(findResp.statusCode).toBe(400);
    expect(findResp.body).toHaveProperty('message');
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

  // test edit inventory
  test('It should response error if edit with invalid data', async () => {
    const id = createdItem.id;
    const editedData = {
      name: 'new name',
      price: 10,
      quantity: -200
    };

    const resp = await request(app)
      .put(`${PATH}/${id}`)
      .send(editedData)
      .set('Accept', 'application/json');

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toHaveProperty('message');
  });

  // test delete inventory
  test('It should response 404 after delete an inventory', async () => {
    const id = createdItem.id;

    // delete inventory
    const deleteResp = await request(app)
      .delete(PATH + `/${id}`);
    expect(deleteResp.statusCode).toBe(200);

    // it should
    const findResp = await request(app).get(`${PATH}/${inventory.id}`);
    expect(findResp.statusCode).toBe(404);
  });

});