function generateService(model) {
    const service = {};
    service.getOne = async function(query, selected) {
        const doc = await model.findOne(query, selected);
        return doc;
    }

    service.getById = async function(id, selected) {
        const doc = await model.findById(id, selected);
        return doc;
    }

    service.getByQuery = async function({ query, page, perPage, selected, sort }) {
        let docs;
        if (page && perPage) {
            docs = await model.find(query, selected)
                .sort(sort)
                .limit(perPage)
                .skip((page - 1) * perPage)
        } else {
            docs = await model.find(query, selected)
                .sort(sort)
        }
        return docs;
    }
    service.create = async function(data) {
        const doc = await model.create(data);
        return doc;
    }
    service.updateOne = async function(query, data, option) {
        const doc = await model.findOneAndUpdate(query, data, { new: true, ...option });
        return doc;
    }
    service.updateById = async function(id, data, option) {
        const doc = await model.findByIdAndUpdate(id, data, { new: true, ...option });
        return doc;
    }
    service.populate = async function({ query, sort, populate, page, perPage }) {
        let docs;
        if (page && perPage) {
            docs = await model.find(query)
                .populate(populate)
                .sort(sort)
                .limit(perPage)
                .skip((page - 1) * perPage)
        } else {
            docs = await model.find(query)
                .populate(populate)
                .sort(sort)
        }
        return docs;
    }
    service.populateOne = async function({ query, sort, populate, page, perPage }) {
        let doc;
        if (page && perPage) {
            doc = await model.findOne(query)
                .populate(populate)
                .sort(sort)
                .limit(perPage)
                .skip((page - 1) * perPage)
        } else {
            doc = await model.findOne(query)
                .populate(populate)
                .sort(sort)
        }
        return doc;
    }
    service.insertMany = async function(data, option) {
        const orders = await model.insertMany(data, option);
        return orders;
    }
    return service;
}


module.exports = {
    generateService
}