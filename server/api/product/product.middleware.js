const { validateInput } = require('../../utils/validate-input');
const {
    checkProductDetail,
    checkUpdateProductSchema,
    checkChangeProductStatus,
    checkPostProduct
} = require('../../validate/product.validate');

module.exports.productDetailMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.params, checkProductDetail);
        if (validateError) throw validateError;
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.updateProductMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkUpdateProductSchema);
        if (validateError) throw validateError;
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.changeProductStatusMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkChangeProductStatus);
        if (validateError) throw validateError;
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.postProductMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkPostProduct);
        if (validateError) throw validateError;
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}