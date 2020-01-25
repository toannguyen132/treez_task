const Inventory     = require('../models').Inventory;
const Joi           = require('@hapi/joi');
const ServiceError  = require('./../utils/serviceError');
const _             = require('lodash');

/** Validations */
const createSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  quantity: Joi.number().positive().required()
});
const editSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  price: Joi.number().positive(),
  quantity: Joi.number().positive()
});
const findSchema = Joi.object({
  id: Joi.number().positive().required()
});

/**
 * GET
 * list all inventory
 */
const index = function(req, res) {
  Inventory.findAll().then(inventories => {
    res.json(inventories);
  });
}

/**
 * GET
 * show single inventory
 */
const show = function(req, res, next) {
  let validateResult = findSchema.validate(req.params);
  if (validateResult.error) {
    next(new ServiceError(400, _.get(validateResult, 'error.details[0].message')));
  }

  let id = validateResult.value.id
  Inventory.findById(id).then((inventory) => {
    res.json(inventory);
  });
}

/**
 * POST
 * create new inventory
 */
const create = async function(req, res, next) {
  try {
    let validateResult = createSchema.validate(req.body);
    if (validateResult.error) {
      throw new ServiceError(400, _.get(validateResult, 'error.details[0].message'));
    } 
  
    let inventory = await Inventory.create(validateResult.value);
    res.json({
      message: "created successfully",
      data: inventory
    });
  } catch (e) {
    console.log(e.message);
    next(e);
  }
}

const edit = async function(req, res, next) {
  try {
    let findValidation = findSchema.validate(req.params);
    let editValidation = editSchema.validate(req.body);

    if (findValidation.error) {
      throw new ServiceError(400, _.get(findValidation, 'error.details[0].message'));
    }
    if (editValidation.error) {
      throw new ServiceError(400, _.get(editValidation, 'error.details[0].message'));
    }

    let id = findValidation.value.id;
    let inventoryData = editValidation.value;

    const result = await Inventory.update(inventoryData, 
      {
        where: {id: id}
      });
      
    if (result[0]) {
      res.json({
        message: "Update successfully"
      });
    } else {
      throw new ServiceError(400, "Cannot find inventory");
    }

  } catch (e) {
    next(e);
  }
}

/**
 * Delete a inventory
 */
const remove = async function(req, res, next) {
  try {
    let validateResult = findSchema.validate(req.params);
    if (validateResult.error) {
      next(new ServiceError(400, _.get(validateResult, 'error.details[0].message')));
    }
  
    let id = validateResult.value.id;
    let inventory = Inventory.findById(id);
    if (inventory.deleted) {
      next(new ServiceError(400, `Error: ${inventory.name} has been deleted already`));
    }
    inventory.deleted = true;
    await inventory.save()
    res.json({
      message: `Error: ${inventory.name} has been deleted successfully!`
    })
  } catch (e) {
    next(e)
  }
}

module.exports = {
  index,
  show,
  create,
  remove,
  edit
};