const registerModel = require('./auth.model');

module.exports.getOne = async function(query, selected) {
    const doc = await registerModel.findOne(query, selected);
    return doc;
}

module.exports.getById = async function(id, selected) {
    const doc = await registerModel.findById(id, selected);
    return doc;
}

module.exports.getByQuery = async function({ query, page, perPage, selected, sort }) {
    let docs;
    if (page && perPage) {
        docs = await registerModel.find(query, selected)
            .sort(sort)
            .limit(perPage)
            .skip((page - 1) * perPage)
    } else {
        docs = await registerModel.find(query, selected)
            .sort(sort)
    }
    return docs;
}
module.exports.create = async function(data) {
    const doc = await registerModel.create(data);
    return doc;
}
module.exports.updateOne = async function(query, data, option) {
    const doc = await registerModel.findOneAndUpdate(query, data, { new: true, ...option });
    return doc;
}
module.exports.updateById = async function(id, data, option) {
    const doc = await registerModel.findByIdAndUpdate(id, data, { new: true, ...option });
    return doc;
}
module.exports.populate = async function({ query, sort, populate, page, perPage }) {
    let docs;
    if (page && perPage) {
        docs = await registerModel.find(query)
            .populate(populate)
            .sort(sort)
            .limit(perPage)
            .skip((page - 1) * perPage)
    } else {
        docs = await registerModel.find(query)
            .populate(populate)
            .sort(sort)
    }
    return docs;
}
module.exports.insertMany = async function(data, option) {
    const orders = await registerModel.insertMany(data, option);
    return orders;
}