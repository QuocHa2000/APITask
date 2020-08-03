const Joi = require('joi');

const joiFunction = function(body, schema) {
    const joiVal = Joi.validate(body, schema);
    if (joiVal.error) {
        return {
            code: 1,
            message: joiVal.error.message,
            data: "Invalid"
        }
    } else {
        return 0;
    }
}


module.exports.joiFunction = joiFunction;