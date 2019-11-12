const Validator = require('validator');
const isEmpty = require('is-empty');

module.exports = function validateRegisterInput(data) {
    let errors = [];

    /**Convert empty feild to empty string */
    data.username = !isEmpty(data.username) ? data.username : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.fullname = !isEmpty(data.fullname) ? data.fullname : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.password2 = !isEmpty(data.password2) ? data.password2 : "";

    // Name checks
    if (Validator.isEmpty(data.username)) {
        errors.push("Name field is required");
    }

    //Fullname Check
    if(Validator.isEmpty(data.fullname)){
        // errors.fullname= "Fullname is required"
        errors.push("Fullname is required");
    }

    // Email checks
    if (Validator.isEmpty(data.email)) {
        // errors.email = "Email field is required";
        errors.push("Email field is required");
    } else if (!Validator.isEmail(data.email)) {
        // errors.email = "Email is invalid";
        errors.push("Email is invalid");
    }

    // Password checks
    if (Validator.isEmpty(data.password)) {
        // errors.password = "Password field is required";
        errors.push("Password feild is required");
    }
    if (Validator.isEmpty(data.password2)) {
        // errors.password2 = "Confirm password field is required";
        errors.push("Confirm password feild is required");
    }
    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        // errors.password = "Password must be at least 6 characters";
        errors.push("Password must be at least 6 characters");
    }
    if (!Validator.equals(data.password, data.password2)) {
        // errors.password2 = "Passwords must match";
        errors.push("Passwords must match");
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
}