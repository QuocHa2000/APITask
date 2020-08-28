const {
    sellerChangeStatusOfOrder,
    buyerChangeStatusOfOrder,
    checkGetOrder
} = require('../../validate/order.validate');
const { validateInput } = require('../../utils/validate-input');
const orderService = require('./order.service');
const errorMessage = require('../../utils/error-message');
const orderStatus = require('../../utils/order-status');

module.exports.purchaseProductMiddleware = async function(req, res, next) {
    try {
        const cart = req.user.cart;
        if (cart.length === 0) {
            throw new Error(errorMessage.CART_EMPTY);
        }
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.sellerChangeOrderStatusMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(
            req.body,
            sellerChangeStatusOfOrder
        );
        if (validateError) {
            throw validateError;
        }
        let queryConditions = {};
        const status = req.body.status;
        if (status === orderStatus.SHIPPING) {
            queryConditions = {
                _id: req.body.orderId,
                seller: req.user._id,
                status: orderStatus.READY,
            };
        } else {
            queryConditions = {
                _id: req.body.orderId,
                seller: req.user._id,
                status: orderStatus.PENDING,
            };
        }
        const order = await orderService.getOne(queryConditions);
        if (!order) {
            throw new Error(errorMessage.ORDER_NOT_EXIST);
        }
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.buyerChangeOrderStatusMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, buyerChangeStatusOfOrder);
        if (validateError) {
            throw validateError;
        }
        let queryConditions;
        const status = req.body.status;
        if (status === orderStatus.FINISHED) {
            queryConditions = {
                _id: req.body.orderId,
                buyer: req.user._id,
                status: orderStatus.SHIPPING,
            };
        } else {
            queryConditions = {
                _id: req.body.orderId,
                buyer: req.user._id,
                status: orderStatus.PENDING,
            };
        }
        const order = await orderService.getOne(queryConditions);
        if (!order) {
            throw new Error(errorMessage.ORDER_NOT_EXIST);
        }
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.getMyOrderMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkGetOrder);
        if (validateError) {
            throw validateError;
        }
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}