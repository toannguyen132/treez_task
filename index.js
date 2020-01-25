const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const PORT = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

const inventoryRoute = require('./routes/inventory');
const orderRoute = require('./routes/order');
const ServiceError = require('./utils/serviceError');


app.get('/', (req, res) => res.send('OK'))
app.post('/', function (req, res) {
  res.send('hello world')
})

app.use('/inventories', inventoryRoute);
app.use('/orders', orderRoute);

// handle error
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

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))