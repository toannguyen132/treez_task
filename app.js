const express = require('express');
const bodyParser = require('body-parser')
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

const inventoryRoute = require('./routes/inventory');
const orderRoute = require('./routes/order');
const ServiceError = require('./utils/serviceError');

// inventories endpoint
app.use('/inventories', inventoryRoute);

// orders endpoint
app.use('/orders', orderRoute);

// central error handling
app.use((err, req, res, next) => {
  if (err instanceof ServiceError) {
    res.status(err.statusCode).send({
      message: err.message
    });
  } else {
    res.status(400).send({
      message: "Error has been occurred!"
    });
  }
})

module.exports = app;