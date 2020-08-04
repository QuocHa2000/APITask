const user = require('../models/user.model');
const product = require('../models/product.model');
const order = require('../models/order.model');
const Joi = require('joi');
const { checkUpdateProduct } = require('../validate/updateproduct.validate');
const { joiFunction } = require('../utils/joival');

module.exports.getCart = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 4;
        let skip = (page - 1) * perPage;
        const result = await user.find({ _id: req.user._id })
            .populate({ path: 'cart.productDetail' })
            .limit(perPage)
            .skip(skip);
        res.json({
            code: 0,
            message: "Get your cart successfully",
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.addToCart = async function(req, res) {
    try {
        const joiVal = joiFunction(req.body, checkUpdateProduct);
        if (joiVal) throw joiVal;
        const addProduct = await product.findOne({ _id: req.params.id });
        if (!addProduct) throw { code: 1, message: 'Product doesn\'t exist', data: 'Invalid' };
        let existProduct = req.user.cart.find((product) => product.productDetail.toString() == addProduct._id);
        if (existProduct) {
            existProduct.amount += parseInt(req.body.amount);
        } else {
            req.user.cart.push({ productDetail: req.params.id, amount: req.body.amount, pick: true });
        }
        await req.user.save();
        const data = await user.findOne({ _id: req.user._id }).populate('cart.productDetail');
        res.json({
            code: 0,
            message: 'Add product to cart successfully',
            data: data
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.removeProduct = async function(req, res) {
    try {
        const result = await user.findOneAndUpdate({ _id: req.user._id }, { $pull: { cart: { _id: req.params.id } } });
        res.json({
            code: 0,
            message: "Remove product from your cart successfully",
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.purchaseProduct = async function(req, res) {
    try {
        const allProduct = [...req.user.cart];
        if (allProduct === []) throw {
            code: 1,
            message: 'Cart is empty',
            data: "Error"
        }
        let needProduct;
        let existOrder;
        let pushProduct;
        for (item of allProduct) {
            if (item.pick == true) {
                needProduct = await product.findOne({ _id: item.productDetail });
                existOrder = await order.findOne({ owner: needProduct.owner, buyer: req.user._id, status: 'waitingforconfirming' });
                pushProduct = { product: needProduct, sellPrice: needProduct.sellPrice, amount: item.amount, totalProductPrice: needProduct.sellPrice * item.amount };
                if (existOrder) {
                    const existProduct = existOrder.products.find((i) => i.product._id.toString() == item.productDetail.toString());
                    if (existProduct) {
                        existProduct.amount += pushProduct.amount;
                    } else {
                        existOrder.products.push(pushProduct);
                    }
                    await existOrder.save();
                } else {
                    await order.create({
                        products: [pushProduct],
                        buyer: req.user._id,
                        owner: needProduct.owner,
                        status: 'waitingforconfirming'
                    })
                }
                await user.findOneAndUpdate({ _id: req.user._id }, { $pull: { cart: { productDetail: needProduct._id } } });
            }
        }
        res.json({
            code: 0,
            message: "Purchase product successfully",
            data: 'Ok'
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.changePickProduct = async function(req, res) {
    try {
        const needProduct = await product.findOne({ _id: req.params.id });
        if (!needProduct) throw {
            code: 1,
            message: 'Product doesn\'t exists',
            data: 'Error'
        }
        let pickProduct = req.user.cart.find((item) => item.productDetail.toString() === req.params.id.toString());
        if (!pickProduct) throw { code: 1, message: 'Product doesn\'t exist in your cart', data: "Error" };
        if (pickProduct.pick === true) {
            pickProduct.pick = false;
        } else {
            pickProduct.pick = true;
        }
        await req.user.save();
        const result = await user.findOne({ _id: req.user._id }).populate('cart.productDetail');
        res.json({
            code: 0,
            message: 'Pick or unpick product successfully',
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.changePickAll = async function(req, res) {
    try {
        if (req.body.pick === 'false') req.user.cart.map((product) => product.pick = false)
        else req.user.cart.map((product) => product.pick = true);
        await req.user.save();
        const result = await user.findOne({ _id: req.user._id }).populate('cart.productDetail').select({ password: 0 });
        res.json({
            code: 0,
            message: 'Change pick all successfully',
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.confirmOrder = async function(req, res) {
    try {
        const needOrder = await order.findOne({ _id: req.params.id });
        if (!needOrder) throw { code: 1, message: 'Order doesn\'t exists', data: 'Error' };
        if (req.user._id.toString() !== needOrder.owner.toString() || needOrder.status !== 'waitingforconfirming') {
            throw {
                code: 1,
                message: 'You are not allowed to access',
                data: 'Error'
            }
        }
        const result = await order.findOneAndUpdate({ _id: req.params.id }, { $set: { status: 'waitingforgettingorder' } });
        res.json({
            code: 0,
            message: 'Confirm order successfully',
            data: result
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.gettingOrder = async function(req, res) {
    try {
        const needOrder = await order.findOne({ _id: req.params.id });
        if (!needOrder) throw { code: 1, message: 'Order doesn\'t exists', data: 'Error' };
        if (req.user._id.toString() !== needOrder.owner.toString() || needOrder.status !== 'waitingforgettingorder') {
            throw {
                code: 1,
                message: 'You are not allowed to access',
                data: 'Error'
            }
        }
        const result = await order.findOneAndUpdate({ _id: req.params.id }, { $set: { status: 'shipping' } })
        res.json({
            code: 0,
            message: 'Getting order successfully',
            data: result
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.updateProduct = async function(req, res) {
    try {
        const needProduct = await product.findOne({ _id: req.params.id });
        if (!needProduct) throw {
            code: 1,
            message: 'Product doesn\'t exists',
            data: 'Error'
        }
        const joiVal = joiFunction(req.body, checkUpdateProduct);
        if (joiVal) throw joiVal;
        const needUser = req.user;
        const userCart = needUser.cart.find((item) => item.productDetail == req.params.id);
        userCart.amount = req.body.amount;
        await needUser.save();
        const result = await user.findOne({ _id: req.user._id }).populate('cart.productDetail');
        res.json({
            code: 0,
            message: "Update amount product successfully",
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.myOrder = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        const result = await order.find({ buyer: req.user._id })
            .populate({ path: 'buyer', select: { email: 1, phone: 1, name: 1 } })
            .populate({ path: 'owner', select: { email: 1 } })
            .limit(perPage)
            .skip(skip);
        res.json({
            code: 0,
            message: 'Get my orders successfully',
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.myCanceledOrder = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        const result = await order.find({ buyer: req.user._id, status: 'Canceled' })
            .populate({ path: 'buyer', select: { email: 1, phone: 1, name: 1 } })
            .populate({ path: 'owner', select: { email: 1 } })
            .limit(perPage)
            .skip(skip);
        res.json({
            code: 0,
            message: 'Get my canceled order successfully',
            data: result
        })
    } catch (error) {
        res.json(result);
    }
}
module.exports.getOrder = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        const result = await order.find({ owner: req.user._id })
            .populate({ path: 'buyer', select: { email: 1, phone: 1, name: 1 } })
            .populate({ path: 'owner', select: { email: 1 } })
            .limit(perPage)
            .skip(skip);
        res.json({
            code: 0,
            message: 'Get all orders successfully',
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.finishOrder = async function(req, res) {
    try {
        const needOrder = await order.findOne({ _id: req.params.id });
        if (!needOrder) throw {
            code: 1,
            message: 'Order doesn\'t exists',
            data: "Error"
        }
        if (needOrder.buyer.toString() !== req.user._id.toString() || needOrder.status !== 'shipping')
            throw {
                code: 1,
                message: 'You are not allowed to access',
                data: 'Invalid'
            };
        await product.findOneAndUpdate({ _id: needOrder.product }, { $inc: { amount: -(needOrder.amount), sold: needOrder.amount } });
        const result = await order.findOneAndUpdate({ _id: req.params.id }, { $set: { status: 'completed' } })
        res.json({
            code: 0,
            message: 'Finish order successfully',
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.cancelOrder = async function(req, res) {
    try {
        let result;
        const needOrder = await order.findOne({ _id: req.params.id });
        if (needOrder.status !== 'waitingforconfirming') throw {
            code: 1,
            message: 'You are not allowed to access',
            data: "Error"
        }
        result = await order.findOneAndUpdate({ $and: [{ _id: req.params.id }, { $or: [{ owner: req.user._id }, { buyer: req.user._id }] }] }, { $set: { status: 'Canceled' } });
        res.json({
            code: 0,
            message: "Cancel order successfully",
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}