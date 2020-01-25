const Models = require('../models'); 
const sequelize = Models.sequelize;
const Order = Models.Order;
const OrderItem = Models.OrderItem;
const Inventory = Models.Inventory;
const ServiceError = require('../utils/serviceError');
const Joi = require('@hapi/joi');

// create validation
const createSchema = Joi.object({
  email: Joi.string().email().required(),
  date: Joi.date(),
  status: Joi.string().valid('created', 'canceled', 'completed'),
  items: Joi.array().items(
    Joi.object({
      inventoryId: Joi.number().required(),
      quantity: Joi.number().min(1).required()
    })
  ).required()
});

// edit validation
const editSchema = Joi.object({
  email: Joi.string().email(),
  date: Joi.date(),
  status: Joi.string().valid('created', 'canceled', 'completed'),
  items: Joi.array().items(
    Joi.object({
      inventoryId: Joi.number().required(),
      quantity: Joi.number().min(1).required()
    })
  )
})

// find schema
const findSchema = Joi.object({
  id: Joi.number().min(0).required()
})

/**
 * GET
 * list all inventory
 */
const index = function(req, res) {
  Order.findAll().then(inventories => {
    res.json(inventories);
  });
}

/**
 * GET
 * show single inventory and its order items
 */
const show = function(req, res, next) {
  let id = req.params.id;
  Order.findByPk(id, {
    include: [{
      model: OrderItem,
      include: [
        Inventory
      ]
    }]
  }).then((order) => {
    if (order) {
      res.json(order);
    }
    throw new Error("No order found");
  }).catch((err) => {
    next(new ServiceError(400, err.message));
  })
}

/**
 * POST
 * create new inventory
 */
const create = async function(req, res, next) {
  let order = createSchema.validate(req.body);
  if (order.error) {
    next(new ServiceError(400, order.error.details[0].message));
  }

  try {
    let orderValue = order.value;

    // create order
    const orderObject = await Order.create({
      email: orderValue.email,
      date: new Date(),
      status: 'created'
    });
    const orderId = orderObject.id;
    
    // create order items data
    // validate inventory id and quantity
    orderValue.items.forEach(async (item) => {
      const inventory = await Inventory.findByPk(item.inventoryId);
      if (!inventory) {
        next(new ServiceError(400, `Inventory id ${item.inventoryId} is not found`));
      }
      if (inventory.quantity < item.quantity) {
        next(new ServiceError(400, `Inventory id ${item.inventoryId} does not have enough quantity`));
      }

      inventory.quantity -= item.quantity;
      inventory.save();

      await OrderItem.create({
        inventoryId: item.inventoryId,
        quantity: item.quantity,
        orderId: orderId,
        price: inventory.price
      });
    });

    res.json({
      message: "Create order successfully"
    });

  } catch (e) {
    next(new ServiceError(400, e.message));
  }
}

/**
 * Cancel an order
 */
const cancel = async function(req, res, next) {
  try {
    // get order
    let orderResult = findSchema.validate(req.params);
    if (orderResult.error) {
      throw new ServiceError(400, e.message);
    }

    let order = await Order.findByPk(orderResult.value.id, {
      include: [{
        model: OrderItem,
        include: [Inventory]
      }]
    });

    if (order.status == 'canceled') {
      throw new ServiceError(400, "Error: Order has been canceled already!")
    }

    // update order
    order.status = 'canceled';
    order.save();
  
    // update inventory
    for (let orderItem of order.order_items) {
      if (orderItem.inventory){
        await Inventory.update({
          quantity: orderItem.inventory.quantity + orderItem.quantity
        }, {
          where: {id: orderItem.inventoryId}
        });
      }
    }

    res.json({
      message: "Order has been canceled!"
    });
    
  } catch (e) {
    next(e);
  }
}

const _clearOrderItem = async function(orderId) {
  const orderItems = await OrderItem.findAll({
    where: {orderId: orderId}
  },{
    include: [Inventory]
  });

  for (let orderItem of orderItems) {
    inventory = await Inventory.findByPk(orderItem.inventoryId);
    inventory.quantity += orderItem.quantity;
    await inventory.save();
    await orderItem.destroy();
  }
}

const _addOrderItem = async function(items) {
  for (let orderItem of items) {
    await OrderItem.create(orderItem);
  }
}

const _deductInventoryQuantity = async function(orderItems) {
  for (let orderItem of orderItems) {
    inventory = await Inventory.findByPk(orderItem.inventoryId);
    inventory.quantity -= orderItem.quantity;
    inventory.save();
  }
}

/**
 * Edit an order
 */
const edit = async function(req, res, next) {
  try {
    const findValidation = findSchema.validate(req.params);
    const editValidation = editSchema.validate(req.body);
    if (findValidation.error) {
      throw new ServiceError(400, _.get(findValidation, 'error.details[0].message'));
    }
    if (editValidation.error) {
      throw new ServiceError(400, _.get(editValidation, 'error.details[0].message'));
    }

    await sequelize.transaction(async () => {
      const orderData = editValidation.value;
      const order = await Order.findByPk(findValidation.value.id, {
        include: [{
          model: OrderItem,
          include: [Inventory]
        }]
      });

      // edit order
      await order.update(orderData, {
        fields: ['email', 'date']
      })

      // update order id
      orderItemsData = orderData.items.map(item => {
        item.orderId = order.id
        return item;
      });

      // remove all inventory out
      await _clearOrderItem(findValidation.value.id);

      // add new order item back
      await _addOrderItem(orderData.items);

      // update inventory quantity
      await _deductInventoryQuantity(orderData.items);
    });

    const newOrder = await Order.findByPk(findValidation.value.id, {
      include: [{
        model: OrderItem,
        include: [Inventory]
      }]
    });

    res.json({
      message: "Update Successfully",
      data: newOrder
    });

  } catch (e) {
    console.error(e);
    console.log(e.message);
    next(e);
  }
}

module.exports = {
  index,
  show,
  create,
  cancel,
  edit
};