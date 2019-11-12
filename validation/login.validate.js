const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateLoginInput(data) {
    let errors = [];
    // Convert empty fields to an empty string so we can use validator functions
    data.username = !isEmpty(data.usernameLogin) ? data.usernameLogin : "";
    data.password = !isEmpty(data.passwordLogin) ? data.passwordLogin : "";
    // Email checks
    if (Validator.isEmpty(data.username)) {
        // errors.username = "Username field is required";
        errors.push('Username field is required');
    }
    // Password checks
    if (Validator.isEmpty(data.password)) {
        // errors.password = "Password field is required";
        errors.push('Password field is required');
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};