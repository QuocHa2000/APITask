const productService = require('./product.service.js');

module.exports.findProduct = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        const foundProducts = await productService.populate({
            query: { $text: { $search: req.query.productName } },
            projection: { score: { $meta: 'textScore' } },
            sort: { score: { $meta: 'textScore' } },
            populate: {
                path: 'owner',
                select: { email: 1, phone: 1, status: 1, role: 1 },
            },
            page,
            perPage
        })
        res.json({
            code: 0,
            message: 'Find productModel successfully',
            data: foundProducts,
            totalPage: Math.ceil(foundProducts.length / perPage),
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};

module.exports.getProduct = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        const result = await productService.populate({
            query: { status: 'active' },
            populate: {
                path: 'owner',
                select: { email: 1, phone: 1, status: 1, role: 1 },
            },
            page: page,
            perPage: perPage
        })
        res.json({
            code: 0,
            message: 'Get productModel successfully',
            data: result,
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};

module.exports.productDetail = async function(req, res) {
    try {
        const result = await productService.getById(req.params.id);
        res.json({
            code: 0,
            message: 'Get productService detail successfully',
            data: result,
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};
module.exports.getMyProduct = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        const result = await productService.getByQuery({
            query: { owner: req.user._id },
            page: page,
            perPage: perPage,
            selected: { owner: 0 }
        })
        res.json({
            code: 0,
            message: 'Get my products successfully',
            data: result,
            totalPage: Math.ceil(result.length / perPage),
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        });
    }
};

module.exports.updateProduct = async function(req, res) {
    try {
        let productImage = [];
        for (let file of req.files) {
            productImage.push(file.path.replace(/\\/g, '/'));
        }
        const result = await productService.updateOne({ _id: req.body._id, owner: req.user._id }, { $set: req.body, productImage });
        res.json({
            code: 0,
            message: ' Update product successfully',
            data: result,
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        });
    }
};

module.exports.changeProductStatus = async function(req, res) {
    try {
        const result = await productService.updateOne({
            _id: req.body._id,
            owner: req.user._id,
        }, { status: req.body.status });
        res.json({
            code: 0,
            message: 'Change product status successfully',
            data: result,
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        });
    }
};

module.exports.postProduct = async function(req, res) {
    try {
        let productImage = [];
        for (let file of req.files) {
            productImage.push(file.path.replace(/\\/g, '/'));
        }
        const newProduct = {
            ...req.body,
            owner: req.user._id,
            sold: 0,
            productImage: productImage
        }
        const result = await productService.create(newProduct);
        res.json({
            code: 0,
            data: result,
            message: 'Post product successfully',
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        });
    }
};