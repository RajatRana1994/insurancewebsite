var express = require('express');
var router = express.Router();
var isset = require('isset');
var empty = require('is-empty');
var validator = require('validator');
var Response = require('../jsonResponses');
var externalFunctions = require('../externalFunctions');
var valid = require('../valid');
var md5 = require('md5');
var random = require('crypto-random-string');
var url = require('url');
var fs = require('fs');
var moment = require('moment-timezone');
var promise = require('promise');
var request = require('request');
var db = require('../db_function');

var app_config = require('../app_config');
const ItemPerPage = 10;

var loggedInUserResult = {};
var sqlDateTime = "";

router.use(function (req, res, next) {
    if (isset(req.body.user_id) && !empty(req.body.user_id)) {
        externalFunctions.getUserDetails(req).then(function (user_result) {
            loggedInUserResult = user_result;
            var now = new Date;
            var utc_timestamp = now.valueOf();
            req.body.created_at = utc_timestamp;
            sqlDateTime = moment().format("YYYY-MM-DD");
            next();
        }).catch(function (error) {
            return res.status(400).json(error);
        });
    } else {
        var now = new Date;
        var utc_timestamp = now.valueOf();
        req.body.created_at = utc_timestamp;
        sqlDateTime = moment().format("YYYY-MM-DD");
        next();
    }
});

var getVehicleYear = function (req, res) {
    var Query = "https://www.carqueryapi.com/api/0.3/?cmd=getYears";
    request.get({
        url: Query,
        headers: {
            'User-Agent': 'request'
        }
    }, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            const info = JSON.parse(body);
            result = {"min_year": parseInt(info.Years.min_year), "max_year": info.Years.max_year};
            res.send(result);
        } else {
            res.send("");
        }
    });
}

var getVehicleMake = function (req, res) {
    var Query = "https://www.carqueryapi.com/api/0.3/?cmd=getMakes&year=" + req.query.year + "&sold_in_us=1";
    request.get({
        url: Query,
        headers: {
            'User-Agent': 'request'
        }
    }, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            const info = JSON.parse(body);
            res.send(info.Makes);
        } else {
            res.send([]);
        }
    });
}
var getVehicleModel = function (req, res) {
    var Query = "https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=" + req.query.make + "&year=" + req.query.year + "&sold_in_us=1";
    request.get({
        url: Query,
        headers: {
            'User-Agent': 'request'
        }
    }, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            const info = JSON.parse(body);
            res.send(info.Models);
        } else {
            res.send([]);
        }
    });
}

var getVehicleTrim = function (req, res) {
    var Query = "https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=" + req.query.make + "&model=" + req.query.model + "&sold_in_us=1";
    request.get({
        url: Query,
        headers: {
            'User-Agent': 'request'
        }
    }, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            const info = JSON.parse(body);
            res.send(info.Trims);
        } else {
            res.send([]);
        }
    });
}

var checkEmailPhoneExistence = function (req, res) {
    try {
        if (!valid(req.body.email) || !valid(req.body.phone_number) || !valid(req.body.country_code)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        externalFunctions.uniqueEmail(req).then(function (email_status) {
            externalFunctions.uniquePhoneNumber(req).then(function (phone_status) {
                return res.status(200).json(Response.success("Email/phone does not exists"));
            }).catch(function (error) {
                return res.status(400).json(error);
            });
        }).catch(function (error) {
            return res.status(400).json(error);
        });
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
};

var signup = function (req, res) {
    try {
        if (!valid(req.body.name) || !valid(req.body.email) || !valid(req.body.phone_number) || !valid(req.body.password) || !valid(req.body.country_code)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        if (isset(req.body.email) && !empty(req.body.email) && !validator.isEmail(req.body.email)) {
            return res.status(400).json(Response.invalid_error("Email is not valid"));
        }
        externalFunctions.uniqueEmail(req).then(function (email_status) {
            externalFunctions.uniquePhoneNumber(req).then(function (phone_status) {
                try {
                    var postData = {
                        name: req.body.name,
                        email: req.body.email,
                        password: md5(req.body.password),
                        country_code: req.body.country_code,
                        phone_number: req.body.phone_number,
                        profile_image: "",
                        latitude: valid(req.body.latitude) ? req.body.latitude : "",
                        longitude: valid(req.body.longitude) ? req.body.longitude : "",
                        device_type: valid(req.body.device_type) ? req.body.device_type : "",
                        device_token: valid(req.body.device_token) ? req.body.device_token : "",
                        authentication_token: random({
                            length: 50
                        }),
                        phone_is_verified: 1,
                        status: 1,
                        signup_date: sqlDateTime,
                        created_at: req.body.created_at
                    }
                    db.insertData('app_users', postData).then(function (result) {
                        req.body.user_id = result.insertId;
                        externalFunctions.getUserDetails(req).then(function (user_result) {
                            return res.status(200).json(Response.success("User registered successfully", user_result));
                        }).catch(function (error) {
                            return res.status(400).json(error);
                        });
                    }).catch(function (error) {
                        return res.status(400).json(Response.database_error(error.sqlMessage));
                    });
                } catch (error) {
                    return res.status(400).json(Response.invalid_error(error));
                }
            }).catch(function (error) {
                return res.status(400).json(error);
            });
        }).catch(function (error) {
            return res.status(400).json(error);
        });
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
};

var updatePhoneVerifiedStatus = function (req, res) {
    try {
        if (!valid(req.body.user_id)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        if (loggedInUserResult.deleted_status == 1)
            return res.status(200).json(Response.unknown_error("Your account deleted, please contact to admin"));

        var updateData = {
            phone_is_verified: 1,
            status: 1
        };
        where = "id = " + req.body.user_id;
        db.updateWhere('app_users', updateData, where).then(function (result) {
            return res.status(200).json(Response.success("Phone number verified successfully"));
        }).catch(function (error) {
            return res.status(400).json(Response.database_error(error.sqlMessage));
        });
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var login = function (req, res) {
    try {
        if (!valid(req.body.email) || !valid(req.body.password)) {
            res.status(400).json(Response.required_fields("Please send required fields"));
        }
        if (isset(req.body.email) && !empty(req.body.email) && !validator.isEmail(req.body.email)) {
            return res.status(400).json(Response.invalid_error("Email is not valid"));
        }
        var where = "email = '" + req.body.email + "' AND password = '" + md5(req.body.password) + "'";
        db.getWhere("app_users", where).then(function (user_result) {
            if (!valid(user_result)) {
                return res.status(400).json(Response.invalid_error("Email/Password is not valid"));
            } else {
                if (user_result[0].status != 1)
                    return res.status(200).json(Response.invalid_error("Account not activated"));
                else if (user_result[0].phone_is_verified != 1)
                    return res.status(400).json(Response.invalid_error("Phone number not verified"));
                else if (user_result[0].deleted_status == 1)
                    return res.status(400).json(Response.invalid_error("Your account deleted, please contact to admin"));
                else {
                    var update_where = "id = " + user_result[0].id;
                    db.updateWhere('app_users', {authentication_token: random({length: 50})}, update_where).then(function (result) {
                        req.body.user_id = user_result[0].id;
                        externalFunctions.getUserDetails(req).then(function (user_result) {
                            return res.status(200).json(Response.success("User logged in successfully", user_result));
                        }).catch(function (error) {
                            return res.status(400).json(error);
                        });
                    }).catch(function (error) {
                        return res.status(400).json(Response.database_error(error.sqlMessage));
                    });
                }
            }
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var logout = function (req, res) {
    try {
        if (!valid(req.body.user_id)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        if (loggedInUserResult.deleted_status == 1)
            return res.status(400).json(Response.invalid_error("Your account deleted, please contact to admin"));

        var updateData = {
            device_type: "",
            device_token: "",
            authentication_token: ""
        };
        where = "id = " + req.body.user_id;
        db.updateWhere('app_users', updateData, where).then(function (result) {
            return res.status(200).json(Response.success("Logout successfully"));
        }).catch(function (error) {
            return res.status(400).json(Response.database_error(error.sqlMessage));
        });
    } catch (error) {
        return res.status(400).json(Response.invalid_error(req.body.__messages('something_went_wrong'), error.message));
    }
};

var changePassword = function (req, res) {
    try {
        if (!valid(req.body.user_id) || !valid(req.body.old_password) || !valid(req.body.new_password)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        if (md5(req.body.old_password) != loggedInUserResult.password) {
            return res.status(400).json(Response.invalid_error("Old password is not correct"));
        }
        var updateData = {
            password: md5(req.body.new_password)
        };
        where = "id = " + req.body.user_id;
        db.updateWhere('app_users', updateData, where).then(function (result) {
            return res.status(200).json(Response.success("Password changed successfully"));
        }).catch(function (error) {
            return res.status(400).json(Response.database_error(error.sqlMessage));
        });
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var addAccidentClaim = function (req, res) {
    try {
        if (!valid(req.body.user_id) || !valid(req.body.accident_date) || !valid(req.body.accident_time) || !valid(req.body.accident_location) || !valid(req.body.any_injury) || !valid(req.body.accident_description) || !valid(req.body.vehicle_damage_description) || !valid(req.body.police_report_filed) || !valid(req.body.witness_name) || !valid(req.body.witness_phone_number) || !valid(req.body.witness_address) || !valid(req.body.witness_description)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        if (req.body.police_report_filed == 'yes') {
            if (!valid(req.body.officer_name) || !valid(req.body.police_address) || !valid(req.body.badge) || !valid(req.body.report) || !valid(req.body.report_date) || !valid(req.body.report_time)) {
                return res.status(400).json(Response.required_fields("Please send required fields"));
            }
        }
        externalFunctions.uploadSingleImage(req, app_config.directoryPath.accident).then(function (image_url) {
            var postData = {
                user_id: req.body.user_id,
                accident_date: req.body.accident_date,
                accident_time: req.body.accident_time,
                accident_location: req.body.accident_location,
                any_injury: req.body.any_injury,
                accident_description: req.body.accident_description,
                vehicle_damage_description: req.body.vehicle_damage_description,
                image: image_url,
                created_at: req.body.created_at
            }
            db.insertData('accident_info', postData).then(function (result) {
                var accident_id = result.insertId;
                var otherPostData = {
                    accident_id: accident_id,
                    police_report_filed: req.body.police_report_filed,
                    officer_name: req.body.officer_name,
                    police_address: req.body.police_address,
                    badge: req.body.badge,
                    report: req.body.report,
                    report_date: req.body.report_date,
                    report_time: req.body.report_time,
                    witness_name: req.body.witness_name,
                    witness_phone_number: req.body.witness_phone_number,
                    witness_address: req.body.witness_address,
                    witness_description: req.body.witness_description,
                    driver_name: req.body.driver_name,
                    license_no: req.body.license_no,
                    driver_address: req.body.driver_address,
                    driver_phone_no: req.body.driver_phone_no,
                    driver_owner_same: req.body.driver_owner_same,
                    year: (req.body.year != '') ? parseInt(req.body.year) : 0,
                    lic_plate: req.body.lic_plate,
                    vin: (req.body.vin != '') ? parseInt(req.body.vin) : 0,
                    color: req.body.color,
                    created_at: req.body.created_at
                }
                db.insertData('accident_other_info', otherPostData).then(function (other_result) {
                    return res.status(200).json(Response.success("Claim addedd successfully"));
                }).catch(function (error) {
                    return res.status(400).json(Response.database_error(error.sqlMessage));
                });
            }).catch(function (error) {
                return res.status(400).json(Response.database_error(error.sqlMessage));
            });
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error("Something went wrong"));
        });
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var getAccidentClaim = function (req, res) {
    try {
        if (!valid(req.body.user_id)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var query = "select * from accident_info where user_id = " + req.body.user_id;
        db.dbQuery(query).then(function (result) {
            if (!valid(result)) {
                return res.status(400).json(Response.invalid_error("Something went wrong"));
            } else {
                return res.status(200).json(Response.success("Claim List", result));
            }
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var getAccidentClaimDetails = function (req, res) {
    try {
        if (!valid(req.body.user_id) || !valid(req.body.accident_id)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var query = "select accident_info.*,accident_other_info.police_report_filed,accident_other_info.officer_name,accident_other_info.police_address,accident_other_info.badge,accident_other_info.report,accident_other_info.report_date,accident_other_info.report_time,accident_other_info.witness_name,accident_other_info.witness_phone_number,accident_other_info.witness_address,accident_other_info.witness_description from accident_info JOIN accident_other_info ON accident_other_info.accident_id = accident_info.id where accident_info.id = " + req.body.accident_id;
        db.dbQuery(query).then(function (result) {
            if (!valid(result)) {
                return res.status(400).json(Response.invalid_error("Something went wrong"));
            } else {
                return res.status(200).json(Response.success("Claim Details", result[0]));
            }
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var manageUserAddress = function (req, res) {
    try {
        if (!valid(req.body.user_id) || !valid(req.body.req_type)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var req_type = parseInt(req.body.req_type);
        switch (req_type) {
            case 1:
                var query = "select * from  user_address where user_id = " + req.body.user_id;
                db.dbQuery(query).then(function (result) {
                    return res.status(200).json(Response.success("User Address List", result));
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 2:
                if (!valid(req.body.name) || !valid(req.body.address) || !valid(req.body.type) || !valid(req.body.build_year) || !valid(req.body.latitude) || !valid(req.body.longitude)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                if (parseInt(req.body.type) > 2) {
                    return res.status(400).json(Response.invalid_error("Please send valid address type"));
                }
                externalFunctions.uploadSingleImage(req, app_config.directoryPath.user_address).then(function (image_url) {
                    var postData = {
                        user_id: req.body.user_id,
                        name: req.body.name,
                        address: req.body.address,
                        type: parseInt(req.body.type),
                        build_year: parseInt(req.body.build_year),
                        image: image_url,
                        latitude: req.body.latitude,
                        longitude: req.body.longitude,
                        created_at: req.body.created_at
                    }
                    db.insertData('user_address', postData).then(function (result) {
                        return res.status(200).json(Response.success("Address addedd successfully"));
                    }).catch(function (error) {
                        return res.status(400).json(Response.database_error(error.sqlMessage));
                    });
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error("Something went wrong"));
                });
                break;

            case 3:
                if (!valid(req.body.address_id) || !valid(req.body.name) || !valid(req.body.address) || !valid(req.body.type) || !valid(req.body.build_year) || !valid(req.body.latitude) || !valid(req.body.longitude)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                if (parseInt(req.body.type) > 2) {
                    return res.status(400).json(Response.invalid_error("Please send valid address type"));
                }
                var query = "select * from  user_address where user_id = " + req.body.user_id + " AND id = " + req.body.address_id;
                db.dbQuery(query).then(function (address_result) {
                    if (!valid(address_result)) {
                        return res.status(400).json(Response.invalid_error("Address is not valid"));
                    } else {
                        where = "id = " + req.body.address_id;
                        if (valid(req.files.image)) {
                            externalFunctions.uploadSingleImage(req, app_config.directoryPath.user_address).then(function (image_url) {
                                var updatePostData = {
                                    name: req.body.name,
                                    address: req.body.address,
                                    type: parseInt(req.body.type),
                                    build_year: parseInt(req.body.build_year),
                                    latitude: req.body.latitude,
                                    longitude: req.body.longitude,
                                    image: image_url,
                                }
                                db.updateWhere('user_address', updatePostData, where).then(function (result) {
                                    if (valid(address_result[0].image)) {
                                        externalFunctions.deleteSingleFileFromS3(address_result[0].image, app_config.directoryPath.user_address).then(function (delImgRes) {
                                            return res.status(200).json(Response.success("Address updated successfully"));
                                        }).catch(function (error) {
                                            return res.status(400).json(Response.database_error(error.sqlMessage));
                                        });
                                    } else {
                                        return res.status(200).json(Response.success("Address updated successfully"));
                                    }
                                }).catch(function (error) {
                                    return res.status(400).json(Response.database_error(error.sqlMessage));
                                });
                            }).catch(function (error) {
                                return res.status(400).json(Response.invalid_error("Something went wrong"));
                            });
                        } else {
                            var updatePostData = {
                                name: req.body.name,
                                address: req.body.address,
                                type: parseInt(req.body.type),
                                build_year: parseInt(req.body.build_year),
                                latitude: req.body.latitude,
                                longitude: req.body.longitude
                            }
                            db.updateWhere('user_address', updatePostData, where).then(function (result) {
                                return res.status(200).json(Response.success("Address updated successfully"));
                            }).catch(function (error) {
                                return res.status(400).json(Response.database_error(error.sqlMessage));
                            });
                        }
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 4:
                if (!valid(req.body.address_id)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from  user_address where user_id = " + req.body.user_id + " AND id = " + req.body.address_id;
                db.dbQuery(query).then(function (address_result) {
                    if (!valid(address_result)) {
                        return res.status(400).json(Response.invalid_error("Address is not valid"));
                    } else {
                        db.dbQuery("delete from user_address where id=" + req.body.address_id).then(function (result) {
                            if (valid(address_result[0].image)) {
                                externalFunctions.deleteSingleFileFromS3(address_result[0].image, app_config.directoryPath.user_address).then(function (delImgRes) {
                                    return res.status(200).json(Response.success("Address deleted successfully"));
                                }).catch(function (error) {
                                    return res.status(400).json(Response.database_error(error.sqlMessage));
                                });
                            } else {
                                return res.status(200).json(Response.success("Address deleted successfully"));
                            }
                        }).catch(function (error) {
                            return res.status(400).json(Response.invalid_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            default:
                return res.status(400).json(Response.invalid_error("Request type not valid"));
        }
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var manageUserVehicle = function (req, res) {
    try {
        if (!valid(req.body.user_id) || !valid(req.body.req_type)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var req_type = parseInt(req.body.req_type);
        switch (req_type) {
            case 1:
                var query = "select * from user_vehicles where user_id = " + req.body.user_id;
                db.dbQuery(query).then(function (result) {
                    return res.status(200).json(Response.success("User Vehicle List", result));
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 2:
                if (!valid(req.body.year) || !valid(req.body.make) || !valid(req.body.model) || !valid(req.body.vehicle_usage) || !valid(req.body.ownership) || !valid(req.body.vin) || !valid(req.body.miles_covered) || !valid(req.body.lic_plate)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var postData = {
                    user_id: req.body.user_id,
                    year: parseInt(req.body.year),
                    make: req.body.make,
                    model: req.body.model,
                    vehicle_usage: req.body.vehicle_usage,
                    ownership: req.body.ownership,
                    vin: parseInt(req.body.vin),
                    miles_covered: parseFloat(req.body.miles_covered),
                    lic_plate: req.body.lic_plate,
                    created_at: req.body.created_at
                }
                db.insertData('user_vehicles', postData).then(function (result) {
                    return res.status(200).json(Response.success("Vehicle addedd successfully"));
                }).catch(function (error) {
                    return res.status(400).json(Response.database_error(error.sqlMessage));
                });

                break;

            case 3:
                if (!valid(req.body.vehicle_id) || !valid(req.body.year) || !valid(req.body.make) || !valid(req.body.model) || !valid(req.body.vehicle_usage) || !valid(req.body.ownership) || !valid(req.body.vin) || !valid(req.body.miles_covered) || !valid(req.body.lic_plate)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from  user_vehicles where user_id = " + req.body.user_id + " AND id = " + req.body.vehicle_id;
                db.dbQuery(query).then(function (veh_result) {
                    if (!valid(veh_result)) {
                        return res.status(400).json(Response.invalid_error("Vehicle is not valid"));
                    } else {
                        where = "id = " + req.body.vehicle_id;
                        var updatePostData = {
                            year: parseInt(req.body.year),
                            make: req.body.make,
                            model: req.body.model,
                            vehicle_usage: req.body.vehicle_usage,
                            ownership: req.body.ownership,
                            vin: parseInt(req.body.vin),
                            miles_covered: parseFloat(req.body.miles_covered),
                            lic_plate: req.body.lic_plate
                        }
                        db.updateWhere('user_vehicles', updatePostData, where).then(function (result) {
                            return res.status(200).json(Response.success("Vehicle updated successfully"));
                        }).catch(function (error) {
                            return res.status(400).json(Response.database_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 4:
                if (!valid(req.body.vehicle_id)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from  user_vehicles where user_id = " + req.body.user_id + " AND id = " + req.body.vehicle_id;
                db.dbQuery(query).then(function (veh_result) {
                    if (!valid(veh_result)) {
                        return res.status(400).json(Response.invalid_error("Vehicle is not valid"));
                    } else {
                        db.dbQuery("delete from user_vehicles where id=" + req.body.vehicle_id).then(function (result) {
                            return res.status(200).json(Response.success("Vehicle deleted successfully"));
                        }).catch(function (error) {
                            return res.status(400).json(Response.invalid_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            default:
                return res.status(400).json(Response.invalid_error("Request type not valid"));
        }
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var manageUserFamilyMember = function (req, res) {
    try {
        if (!valid(req.body.user_id) || !valid(req.body.req_type)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var req_type = parseInt(req.body.req_type);
        switch (req_type) {
            case 1:
                var query = "select * from user_family_member where user_id = " + req.body.user_id;
                db.dbQuery(query).then(function (result) {
                    return res.status(200).json(Response.success("User Family Member List", result));
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 2:
                if (!valid(req.body.name) || !valid(req.body.relation) || !valid(req.body.dob)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var postData = {
                    user_id: req.body.user_id,
                    name: req.body.name,
                    relation: req.body.relation,
                    dob: req.body.dob,
                    created_at: req.body.created_at
                }
                db.insertData('user_family_member', postData).then(function (result) {
                    return res.status(200).json(Response.success("Member addedd successfully"));
                }).catch(function (error) {
                    return res.status(400).json(Response.database_error(error.sqlMessage));
                });

                break;

            case 3:
                if (!valid(req.body.family_member_id) || !valid(req.body.name) || !valid(req.body.relation) || !valid(req.body.dob)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from user_family_member where user_id = " + req.body.user_id + " AND id = " + req.body.family_member_id;
                db.dbQuery(query).then(function (mem_result) {
                    if (!valid(mem_result)) {
                        return res.status(400).json(Response.invalid_error("Member is not valid"));
                    } else {
                        where = "id = " + req.body.family_member_id;
                        var updatePostData = {
                            name: req.body.name,
                            relation: req.body.relation,
                            dob: req.body.dob
                        }
                        db.updateWhere('user_family_member', updatePostData, where).then(function (result) {
                            return res.status(200).json(Response.success("Member updated successfully"));
                        }).catch(function (error) {
                            return res.status(400).json(Response.database_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 4:
                if (!valid(req.body.family_member_id)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from user_family_member where user_id = " + req.body.user_id + " AND id = " + req.body.family_member_id;
                db.dbQuery(query).then(function (mem_result) {
                    if (!valid(mem_result)) {
                        return res.status(400).json(Response.invalid_error("Member is not valid"));
                    } else {
                        db.dbQuery("delete from user_family_member where id=" + req.body.family_member_id).then(function (result) {
                            return res.status(200).json(Response.success("Member deleted successfully"));
                        }).catch(function (error) {
                            return res.status(400).json(Response.invalid_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            default:
                return res.status(400).json(Response.invalid_error("Request type not valid"));
        }
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var managePets = function (req, res) {
    try {
        if (!valid(req.body.user_id) || !valid(req.body.req_type)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var req_type = parseInt(req.body.req_type);
        switch (req_type) {
            case 1:
                var query = "select * from user_pets where user_id = " + req.body.user_id;
                db.dbQuery(query).then(function (result) {
                    return res.status(200).json(Response.success("Pet List", result));
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 2:
                if (!valid(req.body.pet_type) || !valid(req.body.breed) || !valid(req.body.pet_name) || !valid(req.body.pet_dob)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var postData = {
                    user_id: req.body.user_id,
                    pet_type: req.body.pet_type,
                    breed: req.body.breed,
                    pet_name: req.body.pet_name,
                    pet_dob: req.body.pet_dob,
                    created_at: req.body.created_at
                }
                db.insertData('user_pets', postData).then(function (result) {
                    return res.status(200).json(Response.success("Pet addedd successfully"));
                }).catch(function (error) {
                    return res.status(400).json(Response.database_error(error.sqlMessage));
                });

                break;

            case 3:
                if (!valid(req.body.pet_id) || !valid(req.body.pet_type) || !valid(req.body.breed) || !valid(req.body.pet_name) || !valid(req.body.pet_dob)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from user_pets where user_id = " + req.body.user_id + " AND id = " + req.body.pet_id;
                db.dbQuery(query).then(function (pet_result) {
                    if (!valid(pet_result)) {
                        return res.status(400).json(Response.invalid_error("Pet is not valid"));
                    } else {
                        where = "id = " + req.body.pet_id;
                        var updatePostData = {
                            pet_type: req.body.pet_type,
                            breed: req.body.breed,
                            pet_name: req.body.pet_name,
                            pet_dob: req.body.pet_dob
                        }
                        db.updateWhere('user_pets', updatePostData, where).then(function (result) {
                            return res.status(200).json(Response.success("Pet updated successfully"));
                        }).catch(function (error) {
                            return res.status(400).json(Response.database_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 4:
                if (!valid(req.body.pet_id)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from user_pets where user_id = " + req.body.user_id + " AND id = " + req.body.pet_id;
                db.dbQuery(query).then(function (pet_result) {
                    if (!valid(pet_result)) {
                        return res.status(400).json(Response.invalid_error("Pet is not valid"));
                    } else {
                        db.dbQuery("delete from user_pets where id=" + req.body.pet_id).then(function (result) {
                            return res.status(200).json(Response.success("Pet deleted successfully"));
                        }).catch(function (error) {
                            return res.status(400).json(Response.invalid_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            default:
                return res.status(400).json(Response.invalid_error("Request type not valid"));
        }
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var manageUserAsset = function (req, res) {
    try {
        if (!valid(req.body.user_id) || !valid(req.body.req_type)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var req_type = parseInt(req.body.req_type);
        switch (req_type) {
            case 1:
                var query = "select * from user_asset where user_id = " + req.body.user_id;
                db.dbQuery(query).then(function (result) {
                    return res.status(200).json(Response.success("Asset List", result));
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 2:
                if (!valid(req.body.asset_name) || !valid(req.body.type) || !valid(req.body.brand) || !valid(req.body.year)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                externalFunctions.uploadSingleImage(req, app_config.directoryPath.user_asset).then(function (image_url) {
                    var postData = {
                        user_id: req.body.user_id,
                        asset_name: req.body.asset_name,
                        type: req.body.type,
                        brand: req.body.brand,
                        year: parseInt(req.body.year),
                        image: image_url,
                        created_at: req.body.created_at
                    }
                    db.insertData('user_asset', postData).then(function (result) {
                        return res.status(200).json(Response.success("Asset addedd successfully"));
                    }).catch(function (error) {
                        return res.status(400).json(Response.database_error(error.sqlMessage));
                    });
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error("Something went wrong"));
                });
                break;

            case 3:
                if (!valid(req.body.asset_id) || !valid(req.body.asset_name) || !valid(req.body.type) || !valid(req.body.brand) || !valid(req.body.year)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from user_asset where user_id = " + req.body.user_id + " AND id = " + req.body.asset_id;
                db.dbQuery(query).then(function (asset_result) {
                    if (!valid(asset_result)) {
                        return res.status(400).json(Response.invalid_error("Asset is not valid"));
                    } else {
                        where = "id = " + req.body.asset_id;
                        if (valid(req.files.image)) {
                            externalFunctions.uploadSingleImage(req, app_config.directoryPath.user_asset).then(function (image_url) {
                                var updatePostData = {
                                    asset_name: req.body.asset_name,
                                    type: req.body.type,
                                    brand: req.body.brand,
                                    year: parseInt(req.body.year),
                                    image: image_url,
                                }
                                db.updateWhere('user_asset', updatePostData, where).then(function (result) {
                                    if (valid(asset_result[0].image)) {
                                        externalFunctions.deleteSingleFileFromS3(asset_result[0].image, app_config.directoryPath.user_asset).then(function (delImgRes) {
                                            return res.status(200).json(Response.success("Asset updated successfully"));
                                        }).catch(function (error) {
                                            return res.status(400).json(Response.database_error(error.sqlMessage));
                                        });
                                    } else {
                                        return res.status(200).json(Response.success("Asset updated successfully"));
                                    }
                                }).catch(function (error) {
                                    return res.status(400).json(Response.database_error(error.sqlMessage));
                                });
                            }).catch(function (error) {
                                return res.status(400).json(Response.invalid_error("Something went wrong"));
                            });
                        } else {
                            var updatePostData = {
                                asset_name: req.body.asset_name,
                                type: req.body.type,
                                brand: req.body.brand,
                                year: parseInt(req.body.year)
                            }
                            db.updateWhere('user_asset', updatePostData, where).then(function (result) {
                                return res.status(200).json(Response.success("Asset updated successfully"));
                            }).catch(function (error) {
                                return res.status(400).json(Response.database_error(error.sqlMessage));
                            });
                        }
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 4:
                if (!valid(req.body.asset_id)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from  user_asset where user_id = " + req.body.user_id + " AND id = " + req.body.asset_id;
                db.dbQuery(query).then(function (asset_result) {
                    if (!valid(asset_result)) {
                        return res.status(400).json(Response.invalid_error("Asset is not valid"));
                    } else {
                        db.dbQuery("delete from user_asset where id=" + req.body.asset_id).then(function (result) {
                            if (valid(asset_result[0].image)) {
                                externalFunctions.deleteSingleFileFromS3(asset_result[0].image, app_config.directoryPath.user_asset).then(function (delImgRes) {
                                    return res.status(200).json(Response.success("Asset deleted successfully"));
                                }).catch(function (error) {
                                    return res.status(400).json(Response.database_error(error.sqlMessage));
                                });
                            } else {
                                return res.status(200).json(Response.success("Asset deleted successfully"));
                            }
                        }).catch(function (error) {
                            return res.status(400).json(Response.invalid_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            default:
                return res.status(400).json(Response.invalid_error("Request type not valid"));
        }
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var manageUserWork = function (req, res) {
    try {
        if (!valid(req.body.user_id) || !valid(req.body.req_type)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var req_type = parseInt(req.body.req_type);
        switch (req_type) {
            case 1:
                var query = "select * from user_work where user_id = " + req.body.user_id;
                db.dbQuery(query).then(function (result) {
                    return res.status(200).json(Response.success("Work List", result));
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 2:
                if (!valid(req.body.title) || !valid(req.body.company_name) || !valid(req.body.currently_working) || !valid(req.body.start_date) || !valid(req.body.location)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                if (req.body.currently_working == 0) {
                    if (!valid(req.body.end_date)) {
                        return res.status(400).json(Response.required_fields("Please send required fields"));
                    }
                }
                var postData = {
                    user_id: req.body.user_id,
                    title: req.body.title,
                    company_name: req.body.company_name,
                    currently_working: parseInt(req.body.currently_working),
                    start_date: req.body.start_date,
                    end_date: (req.body.currently_working == 0) ? req.body.end_date : '',
                    location: req.body.location,
                    created_at: req.body.created_at
                }
                db.insertData('user_work', postData).then(function (result) {
                    return res.status(200).json(Response.success("Work addedd successfully"));
                }).catch(function (error) {
                    return res.status(400).json(Response.database_error(error.sqlMessage));
                });

                break;

            case 3:
                if (!valid(req.body.work_id) || !valid(req.body.title) || !valid(req.body.company_name) || !valid(req.body.currently_working) || !valid(req.body.start_date) || !valid(req.body.location)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                if (req.body.currently_working == 0) {
                    if (!valid(req.body.end_date)) {
                        return res.status(400).json(Response.required_fields("Please send required fields"));
                    }
                }
                var query = "select * from user_work where user_id = " + req.body.user_id + " AND id = " + req.body.work_id;
                db.dbQuery(query).then(function (work_result) {
                    if (!valid(work_result)) {
                        return res.status(400).json(Response.invalid_error("Work is not valid"));
                    } else {
                        where = "id = " + req.body.work_id;
                        var updatePostData = {
                            title: req.body.title,
                            company_name: req.body.company_name,
                            currently_working: parseInt(req.body.currently_working),
                            start_date: req.body.start_date,
                            end_date: (req.body.currently_working == 0) ? req.body.end_date : '',
                            location: req.body.location,
                        }
                        db.updateWhere('user_work', updatePostData, where).then(function (result) {
                            return res.status(200).json(Response.success("Work updated successfully"));
                        }).catch(function (error) {
                            return res.status(400).json(Response.database_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 4:
                if (!valid(req.body.work_id)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from user_work where user_id = " + req.body.user_id + " AND id = " + req.body.work_id;
                db.dbQuery(query).then(function (work_result) {
                    if (!valid(work_result)) {
                        return res.status(400).json(Response.invalid_error("Work is not valid"));
                    } else {
                        db.dbQuery("delete from user_work where id=" + req.body.work_id).then(function (result) {
                            return res.status(200).json(Response.success("Work deleted successfully"));
                        }).catch(function (error) {
                            return res.status(400).json(Response.invalid_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            default:
                return res.status(400).json(Response.invalid_error("Request type not valid"));
        }
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var manageUserEducation = function (req, res) {
    try {
        if (!valid(req.body.user_id) || !valid(req.body.req_type)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var req_type = parseInt(req.body.req_type);
        switch (req_type) {
            case 1:
                var query = "select * from user_education where user_id = " + req.body.user_id;
                db.dbQuery(query).then(function (result) {
                    return res.status(200).json(Response.success("Work List", result));
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 2:
                if (!valid(req.body.school_college) || !valid(req.body.degree) || !valid(req.body.start_year) || !valid(req.body.end_year) || !valid(req.body.place)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }

                var postData = {
                    user_id: req.body.user_id,
                    school_college: req.body.school_college,
                    degree: req.body.degree,
                    start_year: parseInt(req.body.start_year),
                    end_year: parseInt(req.body.end_year),
                    place: req.body.place,
                    created_at: req.body.created_at
                }
                db.insertData('user_education', postData).then(function (result) {
                    return res.status(200).json(Response.success("Education addedd successfully"));
                }).catch(function (error) {
                    return res.status(400).json(Response.database_error(error.sqlMessage));
                });

                break;

            case 3:
                if (!valid(req.body.education_id) || !valid(req.body.school_college) || !valid(req.body.degree) || !valid(req.body.start_year) || !valid(req.body.end_year) || !valid(req.body.place)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from user_education where user_id = " + req.body.user_id + " AND id = " + req.body.education_id;
                db.dbQuery(query).then(function (edu_result) {
                    if (!valid(edu_result)) {
                        return res.status(400).json(Response.invalid_error("Education is not valid"));
                    } else {
                        where = "id = " + req.body.education_id;
                        var updatePostData = {
                            school_college: req.body.school_college,
                            degree: req.body.degree,
                            start_year: parseInt(req.body.start_year),
                            end_year: parseInt(req.body.end_year),
                            place: req.body.place
                        }
                        db.updateWhere('user_education', updatePostData, where).then(function (result) {
                            return res.status(200).json(Response.success("Education updated successfully"));
                        }).catch(function (error) {
                            return res.status(400).json(Response.database_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            case 4:
                if (!valid(req.body.education_id)) {
                    return res.status(400).json(Response.required_fields("Please send required fields"));
                }
                var query = "select * from user_education where user_id = " + req.body.user_id + " AND id = " + req.body.education_id;
                db.dbQuery(query).then(function (work_result) {
                    if (!valid(work_result)) {
                        return res.status(400).json(Response.invalid_error("Education is not valid"));
                    } else {
                        db.dbQuery("delete from user_education where id=" + req.body.education_id).then(function (result) {
                            return res.status(200).json(Response.success("Education deleted successfully"));
                        }).catch(function (error) {
                            return res.status(400).json(Response.invalid_error(error.sqlMessage));
                        });
                    }
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
                break;

            default:
                return res.status(400).json(Response.invalid_error("Request type not valid"));
        }
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var addPolicy = function (req, res) {
    try {
        var body = req.body
        if (!valid(body.registration_type) || !valid(body.user_id) || !valid(body.ins_type) || !valid(body.ins_provider) || !valid(body.pol_num) || !valid(body.pay_frequency) || !valid(body.next_pay_date) || !valid(body.effective_date) || !valid(body.expiry_date) || !valid(body.amount) || !valid(body.deductible)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        if(body.registration_type == "Manual" || body.registration_type == "Automatic"){
            externalFunctions.uploadMultipleFiles(req, app_config.directoryPath.appPolicy).then(function(imagePathArr) {
                var postData = {
                    type: body.ins_type,
                    ins_provider: body.ins_provider,
                    pol_num: body.pol_num,
                    pay_frequency: body.pay_frequency,
                    next_pay_date: body.next_pay_date,
                    effective_date: body.effective_date,
                    expiry_date : body.expiry_date,
                    amount : body.amount,
                    policy_description : body.policy_description || "",
                    deductible: body.deductible,
                    registration_type : body.registration_type,
                    image:valid(imagePathArr) ? JSON.stringify(imagePathArr) : '',
                    user_id : body.user_id,
                    status : 1,
                    policy_coverage: body.policy_coverage ? body.policy_coverage : "" || "",
                    created_at: Date.now()
                }
                db.insertData('app_policy', postData).then(function(result) {
                    return res.status(200).json(Response.success("Policy added successfully"));
                }).catch(function (error) {                
                    return res.status(400).json(Response.invalid_error(error.sqlMessage));
                });
            })
        }else{
            return res.status(400).json(Response.required_fields("Please send valid value 'Manual / Automatic'"));
        }
        
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}
var getPolicyList = function (req, res) {
    try {
        var body = req.body;
        if (!valid(body.user_id)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var query = "select * from app_policy where user_id = " + body.user_id;
        db.dbQuery(query).then(function (result) {
            if(!valid(result)){
                return res.status(200).json(Response.success("No Data Found", result=[]));
            }else{
                var policy = []
                result.forEach(function(res, i) {
                    var data = {
                        id : res.id,
                        type: res.type,
                        ins_provider: res.ins_provider,
                        pol_num: res.pol_num,
                        pay_frequency: res.pay_frequency,
                        next_pay_date: res.next_pay_date,
                        effective_date: res.effective_date,
                        expiry_date : res.expiry_date,
                        amount : res.amount,
                        policy_description : res.policy_description || "",
                        deductible: res.deductible,
                        registration_type : res.registration_type,
                        image: res.image ? JSON.parse(res.image) : [],
                        user_id : res.user_id,
                        status : (res.status != 0) ? "active" : "deactivate",
                        policy_coverage : res.policy_coverage ? res.policy_coverage : ""
                    }
                    console.log(res.policy_coverage[0]);
                    
                    policy.push(data)
                })
                return res.status(200).json(Response.success("Policy List", policy));
            }
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}
var getPolicyDetail = function (req, res) {
    try {
        if (!valid(req.body.policy_id)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var query = "select * from app_policy where id = " + req.body.policy_id;
        db.dbQuery(query).then(function (result) {
            if(!valid(result)){
                return res.status(200).json(Response.success("No Data Found", result=[]));
            }else{
            var policy = []
                result.forEach(function(res, i) {
                    var data = {
                        id : res.id,
                        type: res.type,
                        ins_provider: res.ins_provider,
                        pol_num: res.pol_num,
                        pay_frequency: res.pay_frequency,
                        next_pay_date: res.next_pay_date,
                        effective_date: res.effective_date,
                        expiry_date : res.expiry_date,
                        amount : res.amount,
                        
                        deductible: res.deductible,
                        registration_type : res.registration_type,
                        image: res.image ? JSON.parse(res.image) : [],
                        user_id : res.user_id,
                        policy_coverage : res.policy_coverage ? res.policy_coverage : ""
                    }
                    policy.push(data)
                })
            return res.status(200).json(Response.success("Policy Detail", policy));
            }
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}
var getCountForDashboard = function (req,res) {
    try {
        var body = req.body
        if (!valid(body.user_id)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        db.dbQuery("select * from app_policy where user_id = " + body.user_id).then(function (policyCount) {
            db.dbQuery("select * from app_quotes where user_id = " + body.user_id).then(function (quotesCount) {
                db.dbQuery("select * from add_claim_file where user_id = " + body.user_id).then(function (claimsCount) {
                    var data = {};
                    var policy_count = valid(policyCount) ? policyCount.length : 0
                    var quotes_count = valid(quotesCount) ? quotesCount.length : 0
                    var claims_count = valid(claimsCount) ? claimsCount.length : 0
                    data.policy_count = policy_count;
                    data.summary_count = quotes_count;
                    data.quotes_count = quotes_count;
                    data.claims_count = claims_count;
                    return res.status(200).json(Response.success("Updated results",data ));
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
            }).catch(function (error) {
                return res.status(400).json(Response.invalid_error(error));
            });
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }

}

var addQuotes = function(req, res) {
    try {
        var body = req.body
        if(!valid(body.user_id) || !valid(body.first_name) || !valid(body.last_name) || !valid(body.email) || !valid(body.phone_number) || !valid(body.question) || !valid(body.ins_type)){
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var postData = {
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            phone_number: body.phone_number,
            city: body.city || "",
            state: body.state || "",
            referredby: body.referredby || "",
            comment: body.comment || "",
            question: body.question,
            type: body.ins_type,
            user_id : parseInt(body.user_id),
            created_at: Date.now()
        }
        db.insertData('app_quotes', postData).then(function(result) {
            return res.status(200).json(Response.success("Quotes added successfully"));
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error.sqlMessage));
        });
    } catch (Error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var getQuotesList = function (req, res) {
    try {
        if (!valid(req.body.user_id)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var query = "select * from app_quotes where user_id = " + req.body.user_id;
        db.dbQuery(query).then(function (result) {
            if(!valid(result)){
                return res.status(200).json(Response.success("No Data Found", result=[]));
            }else{
                return res.status(200).json(Response.success("Quotes List", result));
            }
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}


 var addClaimFile = function(req,res) {
    try {
        var body = req.body
        if(!valid(body.user_id)){
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        externalFunctions.uploadMultipleFiles(req, app_config.directoryPath.appClaimFile).then(function(imagePathArr) {
        var postData = {
            accident_date: body.accident_date || "",
            accident_time: body.accident_time || "",
            accident_location: body.accident_location || "",
            any_injury: body.any_injury || "",
            accident_describe : body.accident_describe || "",
            choose_date : body.choose_date || "",
            accident_description: body.accident_description || "",
            phone_number: body.phone_number || "",
            user_id : parseInt(body.user_id),
            policy_id : parseInt(body.policy_id),
            image : valid(imagePathArr) ? JSON.stringify(imagePathArr) : '',
            type : body.ins_type || "",
            created_at: Date.now()
        }
        db.insertData('add_claim_file', postData).then(function(result) {
            return res.status(200).json(Response.success("Clsim File added successfully"));
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error.sqlMessage));
        });
    }).catch(function (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    });
    } catch (Error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var getClaimFileList = function (req, res) {
    try {
        if (!valid(req.body.user_id)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var query = "select * from add_claim_file where user_id = " + req.body.user_id;
        db.dbQuery(query).then(function (result) {
            if(!valid(result)){
                return res.status(200).json(Response.success("No Data Found", result=[]));
            }else{
            // console.log(result);
            var claimList = []
            result.forEach(function(res, i) {
                var list = {
                    id : res.id,
                    accident_date: res.accident_date || "",
                    accident_time: res.accident_time || "",
                    accident_location: res.accident_location || "",
                    any_injury: res.any_injury || "",
                    accident_describe : res.accident_describe || "",
                    choose_date: res.choose_date || "",
                    accident_description: res.accident_description || "",
                    phone_number: res.phone_number || "",
                    user_id : parseInt(res.user_id),
                    policy_id : res.policy_id,
                    image : res.image ? JSON.parse(res.image) : [],
                    type : res.type,
                }
                claimList.push(list)
            })
            return res.status(200).json(Response.success("Claim List", claimList));
        }
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var getClaimFiledetail = function (req, res) {
    try {
        if (!valid(req.body.claim_id)) {
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var query = "select * from add_claim_file where id = " + req.body.claim_id;
        db.dbQuery(query).then(function (result) {
            if(!valid(result)){
                return res.status(200).json(Response.success("No Data Found", result=[]));
            }else{
            var claimList = []
            result.forEach(function(res, i) {
                var list = {
                    id : res.id,
                    accident_date: res.accident_date || "",
                    accident_time: res.accident_time || "",
                    accident_location: res.accident_location || "",
                    any_injury: res.any_injury || "",
                    accident_describe : res.accident_describe || "",
                    choose_date: res.choose_date || "",
                    accident_description: res.accident_description || "",
                    phone_number: res.phone_number || "",
                    user_id : parseInt(res.user_id),
                    policy_id : res.policy_id,
                    image : res.image ? JSON.parse(res.image) : [],
                    type : res.type,
                }
                claimList.push(list)
            })
            return res.status(200).json(Response.success("Policy Detail", claimList));
        }
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var getBlogsList = function (req,res) {
    try {
        var body = req.body
        if(!valid(body.user_id)){
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var page = 1;
        var offset = 0;
        var limit = 20;
        var data = {};
        if(valid(body.page)){
            page = body.page;
            offset = (page-1)*20
        }
        if(!valid(body.type)){
            var query = "SELECT id,type,title,duration,image_1,likes,dislikes,views,share,likeduser FROM `blogs` LIMIT "+offset+","+limit
        }else{
            var query = "SELECT id,type,title,duration,image_1,likes,dislikes,views,share,likeduser FROM `blogs` WHERE type= "+body.type+" LIMIT "+offset+","+limit
        }
        db.dbQuery(query).then(function (result) {
            if(!valid(result)){
                return res.status(200).json(Response.success("No Data Found", result=[]));
            }else{
                result.forEach(function(res, i) {
                    var type = externalFunctions.getInsuranceType(res.type)
                    res.type = type;
                    var images = []
                    if(valid(res.image_1))
                        images.push(res.image_1)
                    if(valid(res.image_2))
                        images.push(res.image_2)
                    if(valid(res.image_3))
                        images.push(res.image_3)
                    if(valid(res.image_4))
                        images.push(res.image_4)

                    // images.push(valid(res.image_2) ? res.image_2 :"")
                    // images.push(valid(res.image_3) ? res.image_3 :"")
                    // images.push(valid(res.image_4) ? res.image_4 :"")
                    res.images = images
                    if(valid(res.likeduser)){
                        var userList = JSON.parse(res.likeduser);
                        userList = userList.filter(user => user==body.user_id)
                        
                       if(valid(userList)){
                        res.likeduser = true;
                       }else{
                        res.likeduser = false;
                       }
                    }else{
                        res.likeduser = false;
                    }
                })
                if(result.length<limit){
                    data.moreResult = false;
                }else{
                    data.moreResult = true;
                }
                data.blogsList = result;
                return res.status(200).json(Response.success("Blogs List", data));
            }
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}


var getBlogsDatail = function (req,res) {
    try {
        var body = req.body
        if(!valid(body.user_id) || !valid(body.blog_id)){
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var data = {};
        var query = "SELECT * FROM `blogs` where id = "+ body.blog_id
        db.dbQuery(query).then(function (result) {
            if(!valid(result)){
                return res.status(200).json(Response.success("No Data Found", result={}));
            }else{
                where = "id = " + body.blog_id;
                var updateData = {
                    views: result[0].views+1,
                };
                db.updateWhere('blogs', updateData, where).then(function (update) {
                    result.forEach(function(res, i) {
                        var type = externalFunctions.getInsuranceType(res.type)
                        res.type = type;
                        var images = []
                        if(valid(res.image_1))
                            images.push(res.image_1)
                        if(valid(res.image_2))
                            images.push(res.image_2)
                        if(valid(res.image_3))
                            images.push(res.image_3)
                        if(valid(res.image_4))
                            images.push(res.image_4)
                        res.images = images
                        if(valid(res.likeduser)){
                        var userList = JSON.parse(res.likeduser);
                        userList = userList.filter(user => user==body.user_id)
                        if(valid(userList)){
                            res.likeduser = true;
                        }else{
                            res.likeduser = false;
                        }
                        }else{
                            res.likeduser = false;
                        }
                    })
                    
                data.blogDatail = result[0];
                return res.status(200).json(Response.success("Blogs Detail", data));
                }).catch(function (error) {
                    return res.status(400).json(Response.database_error(error.sqlMessage));
                });
            }
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var socialBlog = function (req,res) {
    try {
    var body = req.body
    if(!valid(body.user_id) || !valid(body.blog_id) || !valid(body.likeStatus)){
        return res.status(400).json(Response.required_fields("Please send required fields"));
    }
    var where = "id = " + body.blog_id;
    db.dbQuery("SELECT likes,dislikes,views,share,likeduser FROM `blogs` Where id = "+body.blog_id ).then(function (result) {
        if(!valid(result)){
            return res.status(400).json(Response.required_fields("Invalid Blog ID"));
        }
        var likeduser = valid(result[0].likeduser) ? JSON.parse(result[0].likeduser) :result[0].likeduser
        if(body.likeStatus == 0){
            var updateData = {
                dislikes: result[0].dislikes+1
            };
            var message = "Your dislikes has been added successfully"
        }else if(body.likeStatus == 1){
            if(valid(likeduser)){
               likeduser.push(body.user_id);
                userID = JSON.stringify(likeduser)
            }else{
                var userID = JSON.stringify([body.user_id])
            }
            var updateData = {
                likes: result[0].likes+1,
                likeduser : userID
            };
            var message = "Your likes has been added successfully"
        }else{
            var updateData = {
                share: result[0].share+1
            };
            var message = "Blog Shared successfully"
        }
        // console.log(updateData);
        // return res.status(200).json(Response.success(updateData));
        db.updateWhere('blogs', updateData, where).then(function (result) {
            return res.status(200).json(Response.success(message));
        }).catch(function (error) {
            return res.status(400).json(Response.database_error(error.sqlMessage));
        });
    }).catch(function (error) {
        return res.status(400).json(Response.database_error(error.sqlMessage));
    });
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}


var getBlogsCategoryList = function (req,res) {
    var category = [
        {
            name : "Auto Insurance",
            value : 1
        },{
            name : "Home Insurance",
            value : 2
        },{
            name : "Business Insurance",
            value : 3
        },{
            name : "Work Compensation Insurance",
            value : 4
        },{
            name : "Renters Insurance",
            value : 5
        },{
            name : "Home Insurance Floater Insurance",
            value : 6
        },{
            name : "Motorcycle, RV, Boat Insurance",
            value : 7
        },{
            name : "Umbrella Insurance",
            value : 8
        },{
            name : "Small Group Benefits Insurance",
            value : 9
        },{
            name : "Life Insurance",
            value : 10
        },{
            name : "Health care Insurance",
            value : 11
        },{
            name : "Accident Insurance",
            value : 12
        },{
            name : "Dental Insurance",
            value : 13
        },{
            name : "Short-Term Medical Insurance",
            value : 14
        },{
            name : "Vision Insurance",
            value : 15
        },{
            name : "Medicare Insurance",
            value : 16
        },{
            name : "Medical Insurance",
            value : 17
        },{
            name : "Commercial Auto Insurance",
            value : 18
        },{
            name : "General Liability Insurance",
            value : 19
        },{
            name : "Professional Liability Insurance",
            value : 20
        },{
            name : "Cyber Insurance",
            value : 21
        },{
            name : "Surety Bonds Insurance",
            value : 22
        },{
            name : "Contact Us",
            value : 23
        }
]
return res.status(200).json(Response.success("Blogs Category List", category));
}

var getProfile = function (req,res) {
    try {
        var body = req.body
    if(!valid(body.user_id)){
        return res.status(400).json(Response.required_fields("Please send required fields"));
    }
    var query = "SELECT id,name,email,country_code,phone_number,profile_image,latitude,longitude,device_type,device_token,phone_is_verified,status,deleted_status,signup_date FROM `app_users` where id = "+ body.user_id
    db.dbQuery(query).then(function (result) {
        return res.status(200).json(Response.success("User Profile", result[0]));
    }).catch(function (error) {
        return res.status(400).json(Response.database_error(error.sqlMessage));
    });
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
    
}

var updateProfile = function (req,res) {
    try{
        var body = req.body;
        if(!valid(body.user_id)){
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var query = "SELECT * FROM `app_users` where id = "+ body.user_id
        db.dbQuery(query).then(function (result) {
            if (!valid(result)) {
                return res.status(400).json(Response.invalid_error("Invalid User !!"));
            }
            if (req.files && req.files.image && req.files.image.originalFilename != "") {
            externalFunctions.uploadSingleImage(req, app_config.directoryPath.profile).then(function (image_url) {
                var where = "id = " + body.user_id;
                var updateData = {
                    name: valid(body.name) ? body.name : result[0].name,
                    email: valid(body.email) ? body.email : result[0].email,
                    password: result[0].password,
                    country_code: valid(body.country_code) ? body.country_code : result[0].country_code,
                    phone_number: valid(body.phone_number) ? body.phone_number : result[0].phone_number,
                    profile_image: image_url,
                    latitude: valid(body.latitude) ? body.latitude : result[0].latitude,
                    longitude: valid(body.longitude) ? body.longitude : result[0].longitude,
                    device_type: valid(body.device_type) ? body.device_type : result[0].device_type,
                    device_token: valid(body.device_token) ? body.device_token : result[0].device_token,
                    authentication_token: result[0].authentication_token,
                    phone_is_verified: 1,
                    status: 1,
                    signup_date: result[0].signup_date,
                    created_at: result[0].created_at
                }
                db.updateWhere('app_users', updateData, where).then(function (result) {
                    return res.status(200).json(Response.success("Profile Updated successfully"));
                }).catch(function (error) {
                    return res.status(400).json(Response.database_error(error.sqlMessage));
                });

            })
        }else{
            var where = "id = " + body.user_id;
                var updateData = {
                    name: valid(req.body.name) ? req.body.name : result[0].name,
                    email: valid(req.body.email) ? req.body.email : result[0].email,
                    password: result[0].password,
                    country_code: valid(req.body.country_code) ? req.body.country_code :result[0].country_code,
                    phone_number: valid(req.body.phone_number) ? req.body.phone_number : result[0].phone_number,
                    profile_image: result[0].profile_image,
                    latitude: valid(req.body.latitude) ? req.body.latitude : result[0].latitude,
                    longitude: valid(req.body.longitude) ? req.body.longitude : result[0].longitude,
                    device_type: valid(req.body.device_type) ? req.body.device_type : result[0].device_type,
                    device_token: valid(req.body.device_token) ? req.body.device_token : result[0].device_token,
                    authentication_token: result[0].authentication_token,
                    phone_is_verified: 1,
                    status: 1,
                    signup_date: result[0].signup_date,
                    created_at: result[0].created_at
                }
                db.updateWhere('app_users', updateData, where).then(function (result) {
                    return res.status(200).json(Response.success("Profile Updated successfully"));
                }).catch(function (error) {
                    return res.status(400).json(Response.database_error(error.sqlMessage));
                });
        }
        }).catch(function (error) {
            return res.status(400).json(Response.database_error(error.sqlMessage));
        });
    } catch (error) {
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var addInsuranceByPicture = function (req,res) {
    try {
        var body = req.body
        if(!valid(body.user_id) || !valid(body.insurance_type) || !valid(req.files.image)){
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        externalFunctions.uploadMultipleFiles(req, app_config.directoryPath.appPolicy).then(function(imagePathArr) {
            var postData = {
                insurance_type : body.insurance_type,
                image :valid(imagePathArr) ? JSON.stringify(imagePathArr) : '',
                user_id : body.user_id,
                created_at : Date.now()
            }
            db.insertData('uploaded_insurance', postData).then(function(result) {
                return res.status(200).json(Response.success("Pictures uploaded successfully"));
            }).catch(function (error) {                
                return res.status(400).json(Response.invalid_error(error.sqlMessage));
            });
        })
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var getInsuranceByPicture = function (req,res) {
    try {
        var body = req.body
        if(!valid(body.user_id)){
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var query = "SELECT * FROM `uploaded_insurance` Where user_id = " + body.user_id
        db.dbQuery(query).then(function (result) {
            if(!valid(result)){
                return res.status(200).json(Response.success("No Data Found", result=[]));
            }else{
                var policy = []
                result.forEach(function(res, i) {
                    var data = {
                        id : res.id,
                        insurance_type: res.insurance_type,
                        image: res.image ? JSON.parse(res.image) : [],
                        user_id : res.user_id,
                    }
                    policy.push(data)
                })
                return res.status(200).json(Response.success("insurance List", policy));
            }
        }).catch(function (error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var deleteInsuranceByPicture = function (req,res) {
    try{
    var body = req.body
        if(!valid(body.ins_id)){
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var query = "SELECT * FROM `uploaded_insurance` Where id = " + body.ins_id
        db.dbQuery(query).then(function (result) {
            if(!valid(result)){
                return res.status(200).json(Response.success("Invalid Insurance"));
            }else{
                var imagesArr = valid(result[0].image) ? JSON.parse(result[0].image) : []
                db.dbQuery("delete from uploaded_insurance where id=" + body.ins_id).then(function(result) {
                    externalFunctions.deleteMultipleFileFromS3(imagesArr, app_config.directoryPath.appPolicy).then(function(delImgRes) {
                        return res.status(200).json(Response.success("Insurance Deleted successfully"));
                    }).catch(function(error) {
                        return res.status(400).json(Response.invalid_error(error));
                    });
                }).catch(function(error) {
                    return res.status(400).json(Response.invalid_error(error));
                });
            }
        })
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

var editInsuranceByPicture = function (req,res) {
    try{
        var body = req.body
        if(!valid(body.ins_id)){
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var query = "SELECT * FROM `uploaded_insurance` Where id = " + body.ins_id
        db.dbQuery(query).then(function (result) {
            if(!valid(result)){
                return res.status(200).json(Response.success("Invalid Insurance"));
            }else{
                var where = "id = " + body.ins_id;
                if (req.files && req.files.image && req.files.image[0].originalFilename != "") {
                    externalFunctions.uploadMultipleFiles(req, app_config.directoryPath.appPolicy).then(function(imagePathArr) {
                        var updatePostData = {
                            insurance_type : body.insurance_type || result[0].insurance_type,
                            image :valid(imagePathArr) ? JSON.stringify(imagePathArr) : result[0].image
                        }
                        db.updateWhere('uploaded_insurance', updatePostData, where).then(function(result) {
                            return res.status(200).json(Response.success("Insurance Updated successfully"));
                        }).catch(function(error) {
                            return res.status(400).json(Response.invalid_error(error));
                        });
                    }).catch(function(error) {
                        return res.status(400).json(Response.invalid_error(error));
                    });
                } else {
                    var updatePostData = {
                        insurance_type : body.insurance_type || result[0].insurance_type,
                            image : result[0].image,
                    }
                    db.updateWhere('uploaded_insurance', updatePostData, where).then(function(result) {
                        return res.status(200).json(Response.success("Insurance Updated successfully"));
                    }).catch(function(error) {
                        return res.status(400).json(Response.invalid_error(error));
                    });
                }
            }
        }).catch(function(error) {
            return res.status(400).json(Response.invalid_error(error));
        });
    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}



var sendNotification = function (req,res) {
    var query = "SELECT * FROM `app_policy` where status != 0"
    db.dbQuery(query).then(function (result) {
            result.forEach(function(res, i) {
                var date = new Date(res.next_pay_date);
                date.setDate(date.getDate() - 1);
                var postData = {
                    notifyDate : date,
                    message : "Your next paymant date",
                    user_id : res.user_id,
                    viewStatus : 0,
                    created_at : Date.now()
                }
                db.insertData('notification', postData).then(function(result) {
                    // return res.status(200).json(Response.success("Notification added successfully"));
                }).catch(function (error) {
                    return res.status(400).json(Response.invalid_error(error.sqlMessage));
                });
            })
            return res.status(200).json(Response.success("Notification added successfully"));
        }).catch(function (error) {
            return res.status(400).json(Response.database_error(error.sqlMessage));
        });
}

var getNotificatons = function (req,res) {
    try {
        var body = req.query
        if(!valid(body.user_id)){
            return res.status(400).json(Response.required_fields("Please send required fields"));
        }
        var date = new Date();
        // date.setDate(date.getDate());
        var newDate = date.toLocaleDateString()+" 00:00:00.000"
        var query = "SELECT * FROM `notification` where notifyDate = '"+ newDate + "' and user_id = "+body.user_id
        // console.log(query);
        db.dbQuery(query).then(function (result) {
            if(!valid(result)){
                return res.status(200).json(Response.success("No Data Found", result=[]));
            }
            return res.status(200).json(Response.success("Notification List", result));

            
        }).catch(function (error) {
            return res.status(400).json(Response.database_error(error.sqlMessage));
        });

    } catch(error){
        return res.status(400).json(Response.invalid_error("Something went wrong"));
    }
}

router.get('/getYearList', getVehicleYear);
router.get('/getMakeList', getVehicleMake);
router.get('/getModelList', getVehicleModel);
router.get('/getTrimList', getVehicleTrim);
router.post('/checkEmailPhoneExistence', checkEmailPhoneExistence);
router.post('/signup', signup);
router.post('/updatePhoneVerifiedStatus', updatePhoneVerifiedStatus);
router.post('/login', login);
router.post('/logout', logout);
router.post('/changePassword', changePassword);
router.post('/addClaim', addAccidentClaim);
router.post('/getClaim', getAccidentClaim);
router.post('/getClaimDetails', getAccidentClaimDetails);
router.post('/manageUserAddress', manageUserAddress);
router.post('/manageUserVehicle', manageUserVehicle);
router.post('/manageUserFamilyMember', manageUserFamilyMember);
router.post('/managePets', managePets);
router.post('/manageUserAsset', manageUserAsset);
router.post('/manageUserWork', manageUserWork);
router.post('/manageUserEducation', manageUserEducation);

router.post('/addPolicy', addPolicy);
router.post('/getPolicyList', getPolicyList);
router.post('/getCountForDashboard', getCountForDashboard);
router.post('/getPolicyDetail', getPolicyDetail);
router.post('/addQuotes', addQuotes);
router.post('/getQuotesList', getQuotesList);
router.post('/addClaimFile', addClaimFile);
router.post('/getClaimFileList', getClaimFileList);
router.post('/getClaimFiledetail', getClaimFiledetail);
router.post('/getBlogsList', getBlogsList);
router.post('/getBlogsDatail', getBlogsDatail);
router.post('/getBlogsCategoryList', getBlogsCategoryList);
router.post('/socialBlog', socialBlog);
router.post('/getProfile', getProfile);
router.post('/updateProfile', updateProfile);
router.post('/addInsuranceByPicture', addInsuranceByPicture);
router.post('/getInsuranceByPicture', getInsuranceByPicture);
router.post('/deleteInsuranceByPicture', deleteInsuranceByPicture);
router.post('/editInsuranceByPicture', editInsuranceByPicture);

router.get('/sendNotification', sendNotification);
router.get('/getNotificatons', getNotificatons);




module.exports = router;