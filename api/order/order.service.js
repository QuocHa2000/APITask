const orderModel = require('./order.model');

module.exports.getOne = async function(query, selected) {
    const order = await orderModel.findOne(query, selected);
    return order;
}

module.exports.getById = async function(id, selected) {
    const order = await orderModel.findById(id, selected);
    return order;
}

module.exports.getByQuery = async function({ query, page, perPage, selected, sort }) {
    let orders;
    if (page && perPage) {
        orders = await orderModel.find(query, selected)
            .sort(sort)
            .limit(perPage)
            .skip((page - 1) * perPage)
    } else {
        orders = await orderModel.find(query, selected)
            .sort(sort)
    }
    return orders;
}
module.exports.create = async function(data) {
    const order = await orderModel.create(data);
    return order;
}
module.exports.updateOne = async function(query, data, option) {
    const order = await orderModel.findOneAndUpdate(query, data, { new: true, ...option });
    return order;
}
module.exports.updateById = async function(id, data, option) {
    const order = await orderModel.findByIdAndUpdate(id, data, { new: true, ...option });
    return order;
}
module.exports.populateOne = async function({ query, sort, populate, page, perPage }) {
    let doc;
    if (page && perPage) {
        doc = await orderModel.findOne(query)
            .populate(populate)
            .sort(sort)
            .limit(perPage)
            .skip((page - 1) * perPage)
    } else {
        doc = await orderModel.findOne(query)
            .populate(populate)
            .sort(sort)
    }
    return doc;
}
module.exports.populate = async function({ query, sort, populate, page, perPage }) {
    let docs;
    if (page && perPage) {
        docs = await orderModel.find(query)
            .populate(populate)
            .sort(sort)
            .limit(perPage)
            .skip((page - 1) * perPage)
    } else {
        docs = await orderModel.find(query)
            .populate(populate)
            .sort(sort)
    }
    return docs;
}
module.exports.insertMany = async function(data, option) {
    const orders = await orderModel.insertMany(data, option);
    return orders;
}
module.exports.distinct = async function(_id) {
    const orders = await orderModel.distinct(_id);
    return orders;
}
module.exports.aggregate = async function(update) {
    const orders = await orderModel.aggregate(update);
    return orders;
}