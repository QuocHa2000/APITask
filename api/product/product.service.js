const productModel = require('./product.model');

module.exports.getOne = async function(query, selected) {
    const product = await productModel.findOne(query, selected);
    return product;
}

module.exports.getById = async function(id, selected) {
    const product = await productModel.findById(id, selected);
    return product;
}

module.exports.getByQuery = async function({ query, page, perPage, selected, sort }) {
    let products;
    if (page && perPage) {
        products = await productModel.find(query, selected)
            .sort(sort)
            .limit(perPage)
            .skip((page - 1) * perPage)
    } else {
        products = await productModel.find(query, selected)
            .sort(sort)
    }
    return products;
}
module.exports.create = async function(data) {
    const product = await productModel.create(data);
    return product;
}
module.exports.updateOne = async function(query, data, option) {
    const product = await productModel.findOneAndUpdate(query, data, { new: true, ...option });
    return product;
}
module.exports.updateById = async function(id, data, option) {
    const product = await productModel.findByIdAndUpdate(id, data, { new: true, ...option });
    return product;
}
module.exports.populate = async function({ query, projection, sort, populate, page, perPage }) {
    const products = await productModel.find(query, projection)
        .populate(populate)
        .sort(sort)
        .limit(perPage)
        .skip((page - 1) * perPage)
    return products;
}
module.exports.distinct = async function(_id) {
    const products = await productModel.distinct(_id);
    return products;
}
module.exports.aggregate = async function(update) {
    const products = await productModel.aggregate(update);
    return products;
}