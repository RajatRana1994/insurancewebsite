module.exports = {
    'success': function (message, result = undefined) {
        return {
            success: 200,
            message: message,
            result: result
        };
    },
    'invalid_error': function (message = 'Invalid Data.', error = undefined) {
        return {
            success: 203,
            message: message,
            error: error
        };
    },
    'database_error': function (message = "Something went wrong.", error = undefined) {
        return {
            success: 202,
            message: message,
            error: error
        };
    },
    'unknown_error': function (message = "Unknown error.", error = undefined) {
        return {
            success: 204,
            message: message,
            error: error
        };
    },
    'no_record': function (message) {
        return {
            success: 205,
            message: (message) ? message : 'No Record Found.'
        };
    },
    'required_fields': function (message) {
        return {
            success: 201,
            message: (message) ? message : 'Please fill required fields.'
        };
    },
    'authorization_failed': function (message) {
        return {
            success: 404,
            message: (message) ? message : 'Authorization failed.'
        };
    }
};