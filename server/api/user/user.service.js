const userModel = require('./user.model');

module.exports.getOne = async function(query, selected) {
    const user = await userModel.findOne(query, selected);
    return user;
}

module.exports.getById = async function(id, selected) {
    const user = await userModel.findById(id, selected);
    return user;
}

module.exports.getByQuery = async function({ query, page, perPage, selected, sort }) {
    let users;
    if (page && perPage) {
        users = await userModel.find(query, selected)
            .sort(sort)
            .limit(perPage)
            .skip((page - 1) * perPage)
    } else {
        users = await userModel.find(query, selected)
            .sort(sort)
    }
    return users;
}
module.exports.create = async function(data) {
    const user = await userModel.create(data);
    return user;
}
module.exports.findAndUpdateOne = async function(query, data, option) {
    const user = await userModel.findOneAndUpdate(query, data, { new: true, ...option });
    return user;
}
module.exports.findAndUpdateById = async function(id, data, option) {
    const user = await userModel.findByIdAndUpdate(id, data, { new: true, ...option });
    return user;
}
module.exports.updateOne = async function(query, data, option) {
    const user = await userModel.updateOne(query, data, option);
    return user;
}
module.exports.populate = async function({ query, projection, sort, populate, page, perPage }) {
    let users;
    if (page && perPage) {
        users = await userModel.find(query, projection)
            .populate(populate)
            .sort(sort)
            .limit(perPage)
            .skip((page - 1) * perPage)
    } else {
        users = await userModel.find(query, projection)
            .populate(populate)
            .sort(sort)
    }
    return users;
}
module.exports.populateOne = async function({ query, sort, projection, populate, page, perPage }) {
    let doc;
    if (page && perPage) {
        doc = await userModel.findOne(query, projection)
            .populate(populate)
            .sort(sort)
            .limit(perPage)
            .skip((page - 1) * perPage)
    } else {
        doc = await userModel.findOne(query, projection)
            .populate(populate)
            .sort(sort)
    }
    return doc;
}
module.exports.insertMany = async function(data, option) {
    const users = await userModel.insertMany(data, option);
    return users;
}
module.exports.distinct = async function(_id) {
    const users = await userModel.distinct(_id);
    return users;
}
module.exports.aggregate = async function(update) {
    const users = await userModel.aggregate(update);
    return users;
}