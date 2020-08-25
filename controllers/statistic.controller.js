const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');

module.exports.productStatisticForAdmin = async function(req, res) {
    try {
        const products = await productModel.distinct('_id');
        const sellers = await productModel.distinct('owner');
        let boughtProducts = await orderModel.aggregate([
            { $match: { status: 'finished' } },
            { $unwind: "$products" },
            { $group: { _id: null, total: { $sum: '$products.amount' } } }
        ])
        let pendingProducts = await orderModel.aggregate([
            { $match: { status: { $nin: ['finished', 'canceled'] } } },
            { $unwind: "$products" },
            { $group: { _id: null, total: { $sum: '$products.amount' } } }
        ])
        let availableProducts = await productModel.aggregate([
            { $match: { status: { $ne: 'blocked' } } },
            { $group: { _id: null, total: { $sum: "$quantity" } } }
        ])
        const empty = [{ total: 0 }];
        if (boughtProducts.length === 0) {
            boughtProducts = empty;
        }
        if (pendingProducts.length === 0) {
            pendingProducts = empty;
        }
        if (availableProducts.length === 0) {
            availableProducts = empty;
        }

        const result = {
            amountOfProducts: products.length,
            amountOfSellers: sellers.length,
            amountOfBoughtProducts: boughtProducts[0].total,
            amountOfPendingProducts: pendingProducts[0].total,
            quantityOfAvailableProducts: availableProducts[0].total
        }
        res.json({
            code: 0,
            message: 'Get statistic of product for admin successfully',
            data: result
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        })
    }
}

module.exports.memberStatisticForAdmin = async function(req, res) {
    try {
        const members = await userModel.distinct('_id');
        const users = await userModel.aggregate([
            { $match: { role: "user" } }
        ]);
        const enterprises = await userModel.aggregate([
            { $match: { role: "enterprise" } }
        ])
        const inactivatedUsers = await userModel.aggregate([
            { $match: { $or: [{ active: false }, { status: { $ne: 'active' } }] } }
        ])
        const result = {
            amountOfMembers: members.length,
            amountOfUsers: users.length,
            amountOfEnterprises: enterprises.length,
            amountOfInactivatedUsers: inactivatedUsers.length
        }
        res.json({
            code: 0,
            message: 'Get member statistic for admin successfully',
            data: result
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        })
    }
}
module.exports.revenueStatisticForAdmin = async function(req, res) {
    try {
        let paidRevenue = await orderModel.aggregate([
            { $match: { status: 'finished' } },
            { $group: { _id: null, total: { $sum: '$totalCost' } } }
        ])
        let pendingRevenue = await orderModel.aggregate([
            { $match: { status: { $nin: ['finished', 'canceled'] } } },
            { $group: { _id: null, total: { $sum: '$totalCost' } } }
        ])
        let enterpriseRevenueRanking = await orderModel.aggregate([
            { $match: { status: 'finished' } },
            { $group: { _id: '$seller', totalRevenue: { $sum: '$totalCost' } } },
            { $sort: { totalRevenue: -1 } }
        ])
        const empty = [{ total: 0 }];
        if (enterpriseRevenueRanking.length === 0) {
            enterpriseRevenueRanking = [{ _id: null, totalRevenue: 0 }]
        }
        if (paidRevenue.length === 0) {
            paidRevenue = empty;
        }
        if (pendingRevenue.length === 0) {
            pendingRevenue = empty;
        }
        const result = {
            paidRevenue: paidRevenue[0].total,
            pendingRevenue: pendingRevenue[0].total,
            totalRevenue: paidRevenue[0].total + pendingRevenue[0].total,
            enterpriseHasHighestRevenue: enterpriseRevenueRanking[0],
            enterpriseHasLowestRevenue: enterpriseRevenueRanking[enterpriseRevenueRanking.length - 1]
        };
        res.json({
            code: 0,
            message: 'Get revenue statistic for admin successfully',
            data: result
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        })
    }
}
module.exports.orderStatisticForAdmin = async function(req, res) {
    try {
        const pendingOrders = await orderModel.aggregate([
            { $match: { status: 'pending' } }
        ]);
        const readyOrders = await orderModel.aggregate([
            { $match: { status: 'ready' } }
        ]);
        const shippingOrders = await orderModel.aggregate([
            { $match: { status: 'shipping' } }
        ]);
        const finishedOrders = await orderModel.aggregate([
            { $match: { status: 'finished' } }
        ]);
        const canceledOrders = await orderModel.aggregate([
            { $match: { status: 'canceled' } }
        ]);
        const orders = await orderModel.distinct('_id');

        const result = {
            amountOfOrders: orders.length,
            amountOfCanceledOrders: canceledOrders.length,
            amountOfFinishedOrders: finishedOrders.length,
            amountOfPendingOrder: pendingOrders.length,
            amountOfReadyOrders: readyOrders.length,
            amountOfShippingOrders: shippingOrders.length
        };
        res.json({
            code: 0,
            message: 'Get order statistic successfully',
            data: result
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        })
    }
}
module.exports.productStatisticForEnterprise = async function(req, res) {
    try {
        const products = await productModel.aggregate([
            { $match: { owner: req.user._id } }
        ])
        let boughtProducts = await orderModel.aggregate([
            { $match: { status: 'finished', seller: req.user._id } },
            { $unwind: "$products" },
            { $group: { _id: null, total: { $sum: '$products.amount' } } }
        ])
        let pendingProducts = await orderModel.aggregate([
            { $match: { status: { $nin: ['finished', 'canceled'] }, seller: req.user._id } },
            { $unwind: "$products" },
            { $group: { _id: null, total: { $sum: '$products.amount' } } }
        ])
        const empty = [{ total: 0 }];
        if (boughtProducts.length === 0) {
            boughtProducts = empty;
        }
        if (pendingProducts.length === 0) {
            pendingProducts = empty;
        }
        const result = {
            amountOfProducts: products.length,
            amountBoughtProducts: boughtProducts[0].total,
            amountOfPendingProducts: pendingProducts[0].total
        };
        res.json({
            code: 0,
            message: 'Get product statistic for enterprise successfully',
            data: result
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        })
    }
}
module.exports.orderStatisticForEnterprise = async function(req, res) {
    try {
        const pendingOrders = await orderModel.aggregate([
            { $match: { status: 'pending', seller: req.user._id } }
        ]);
        const readyOrders = await orderModel.aggregate([
            { $match: { status: 'ready', seller: req.user._id } }
        ]);
        const shippingOrders = await orderModel.aggregate([
            { $match: { status: 'shipping', seller: req.user._id } }
        ]);
        const finishedOrders = await orderModel.aggregate([
            { $match: { status: 'finished', seller: req.user._id } }
        ]);
        const canceledOrders = await orderModel.aggregate([
            { $match: { status: 'canceled', seller: req.user._id } }
        ]);
        const orders = await orderModel.aggregate([
            { $match: { seller: req.user._id, seller: req.user._id } }
        ]);

        const result = {
            amountOfOrders: orders.length,
            amountOfCanceledOrders: canceledOrders.length,
            amountOfFinishedOrders: finishedOrders.length,
            amountOfPendingOrder: pendingOrders.length,
            amountOfReadyOrders: readyOrders.length,
            amountOfShippingOrders: shippingOrders.length
        };

        res.json({
            code: 0,
            message: 'Get order statistic for enterprise successfully',
            data: result
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        })
    }
}
module.exports.revenueStatisticForEnterprise = async function(req, res) {
    try {
        let paidRevenue = await orderModel.aggregate([
            { $match: { status: 'finished', seller: req.user._id } },
            { $group: { _id: null, total: { $sum: '$totalCost' } } }
        ])
        let pendingRevenue = await orderModel.aggregate([
            { $match: { status: { $nin: ['finished', 'canceled'] }, seller: req.user._id } },
            { $group: { _id: null, total: { $sum: '$totalCost' } } }
        ])
        const empty = [{ total: 0 }];
        if (paidRevenue.length === 0) {
            paidRevenue = empty;
        }
        if (pendingRevenue.length === 0) {
            pendingRevenue = empty;
        }
        const result = {
            paidRevenue: paidRevenue[0].total,
            pendingRevenue: pendingRevenue[0].total,
            totalRevenue: paidRevenue[0].total + pendingRevenue[0].total
        };
        res.json({
            code: 0,
            message: "Get revenue statistic for enterprise successfully",
            data: result
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        })
    }
}