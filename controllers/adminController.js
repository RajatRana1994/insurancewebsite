var express = require('express');
var router = express.Router();
var random = require('crypto-random-string');
var isset = require('isset');
var empty = require('is-empty');
var validator = require('validator');
var md5 = require('md5');
var url = require('url');
var fs = require('fs');
var moment = require('moment-timezone');
var promise = require('promise');
var valid = require('../valid');
var db = require('../db_function');

var externalFunctions = require('../externalFunctions');

var app_config = require('../app_config');

const PerPage = 10;

var AdminResult = {};
var sqlDateTime = "";

router.use(function(req, res, next) {
    if (isset(req.session.AdminData) && !empty(req.session.AdminData) && req.session.AdminData != undefined) {
        externalFunctions.getAdminDetails(req).then(function(admin_result) {
            AdminResult.name = admin_result.name;
            AdminResult.email = admin_result.email;
            AdminResult.password = admin_result.password;
            AdminResult.id = admin_result.id
            var now = new Date;
            var utc_timestamp = now.valueOf();
            req.body.created_at = utc_timestamp;
            sqlDateTime = moment().format("YYYY-MM-DD");
            next();
        }).catch(function(error) {
            req.flash('error_message', error);
            return res.redirect('/admin/login');
        });
    } else {
        next();
    }
});

var Login = function(req, res) {
    if (isset(req.session.AdminData) && !empty(req.session.AdminData)) {
        return res.redirect('/admin/dashboard');
    } else {
        if (req.method == 'GET') {
            return res.render('admin/login');
        } else {
            var body = req.body;
            if (!isset(body.email) || empty(body.email) || !isset(body.password) || empty(body.password)) {
                req.flash('error_message', 'Email/Password required');
                return res.redirect('/admin/login');
            } else {
                var where = "email = '" + body.email + "' AND password = '" + md5(body.password) + "'";
                db.getWhere("admin_details", where).then(function(admin_res) {
                    if (!valid(admin_res)) {
                        var agentwhere = "email = '" + body.email + "' AND password = '" + body.password + "'";
                        db.getWhere("agents", agentwhere).then(function(agent_res) {
                            if (!valid(agent_res)) {
                                req.flash('error_message', "Email/Password is not valid");
                                return res.redirect('/admin/login');
                            }else{
                                if(agent_res[0].userType=="agent"){
                                    req.session.AgentData = {
                                        IsagentLogin: 1,
                                        agent_id: agent_res[0].id
                                    };
                                    return res.redirect('/agent/dashboard');
                                }else{
                                    
                                    req.session.ReferralData = {
                                        IsagentLogin: 1,
                                        agent_id: agent_res[0].id
                                    };
                                    return res.redirect('/referral/dashboard');
                                }

                            }
                        })
                    } else {
                        req.session.AdminData = {
                            IsAdminLogin: 1,
                            admin_id: admin_res[0].id
                        };
                        return res.redirect('/admin/dashboard');
                    }
                }).catch(function(error) {
                    var err = JSON.stringify(error)
                    req.flash('error_message', err);
                    return res.redirect('/admin/login');
                });
            }
        }
    }
};

var Logout = function(req, res) {
    try {
        req.session.destroy();
        return res.redirect('/admin/login');
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/admin/login');
    }
};

var Dashboard = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        externalFunctions.getCountForDashboard(sqlDateTime).then(function(count_result) {
            return res.render('admin/dashboard', { title: 'Dashboard', AdminResult: AdminResult, todayTotalUsers: count_result[0].todayTotalUsers, totalUsers: count_result[0].totalUsers, totalCarInsurance: count_result[0].totalCarInsurance, totalHomeInsurance: count_result[0].totalHomeInsurance });
        }).catch(function(error) {
            return res.render('admin/dashboard', { title: 'Dashboard', AdminResult: AdminResult, todayTotalUsers: 0, totalUsers: 0, totalCarInsurance: 0, totalHomeInsurance: 0 });
        });
    }
}

var vehicleMaker = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var type = req.params.type;
        switch (type) {
            case 'list':
                var query = "SELECT * FROM vehicle_make order by id DESC";
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        return res.render('admin/vehicles/maker_list', { title: 'Vehicle Make', AdminResult: AdminResult, result: result, moment: moment });
                    } else {
                        return res.render('admin/vehicles/maker_list', { title: 'Vehicle Make', AdminResult: AdminResult, result: result, moment: moment });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.render('admin/vehicles/maker_list', { title: 'Vehicle Make', AdminResult: AdminResult, result: [], moment: moment });
                });
                break;
            case 'add':
                if (req.method == 'GET') {
                    return res.render('admin/vehicles/add_maker', { title: 'Add Make', AdminResult: AdminResult });
                } else {
                    var body = req.body;
                    if (!isset(body.make) || empty(body.make)) {
                        req.flash('error_message', 'Make is required');
                        return res.redirect('/admin/maker/add');
                    } else {
                        externalFunctions.checkMakeExistence(req).then(function(added_status) {
                            var postData = {
                                make: body.make,
                                created_at: Date.now()
                            }
                            db.insertData('vehicle_make', postData).then(function(result) {
                                req.flash('success_message', "Make added successfully");
                                return res.redirect('/admin/maker/list');
                            }).catch(function(error) {
                                req.flash('error_message', "Error while performing Query.");
                                return res.redirect('/admin/maker/add');
                            });
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/maker/add');
                        });
                    }
                }
                break;
            default:
                return res.redirect('/admin/dashboard');
        }

    }
}

var vehicleModel = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var type = req.params.type;
        var make_id = req.params.make_id;
        var query = "SELECT * FROM vehicle_make where id = '" + make_id + "'";
        db.dbQuery(query).then(function(make_result) {
            var make = (make_result) ? make_result[0].make : "";
            switch (type) {
                case 'list':
                    var query = "SELECT * FROM vehicle_model where make_id ='" + make_id + "' order by id DESC";
                    db.dbQuery(query).then(function(result) {
                        if (!valid(result)) {
                            return res.render('admin/vehicles/model_list', { title: 'Vehicle Model', AdminResult: AdminResult, result: result, moment: moment, make: make, make_id: make_id });
                        } else {
                            return res.render('admin/vehicles/model_list', { title: 'Vehicle Model', AdminResult: AdminResult, result: result, moment: moment, make: make, make_id: make_id });
                        }
                    }).catch(function(error) {
                        req.flash('error_message', error.sqlMessage);
                        return res.render('admin/vehicles/model_list', { title: 'Vehicle Model', AdminResult: AdminResult, result: [], moment: moment, make: make, make_id: make_id });
                    });
                    break;
                case 'add':
                    if (req.method == 'GET') {
                        return res.render('admin/vehicles/add_model', { title: 'Add Model', AdminResult: AdminResult, make: make, make_id: make_id });
                    } else {
                        var body = req.body;
                        if (!isset(body.model) || empty(body.model)) {
                            req.flash('error_message', 'Model is required');
                            return res.redirect('/admin/model/add/' + make_id);
                        } else {
                            externalFunctions.checkModelExistence(req, make_id).then(function(added_status) {
                                var postData = {
                                    make_id: make_id,
                                    model: body.model,
                                    created_at: Date.now()
                                }
                                db.insertData('vehicle_model', postData).then(function(result) {
                                    req.flash('success_message', "Model added successfully");
                                    return res.redirect('/admin/model/list/' + make_id);
                                }).catch(function(error) {
                                    req.flash('error_message', "Error while performing Query.");
                                    return res.redirect('/admin/model/add/' + make_id);
                                });
                            }).catch(function(error) {
                                req.flash('error_message', error);
                                return res.redirect('/admin/model/add/' + make_id);
                            });
                        }
                    }
                    break;
                default:
                    return res.redirect('/admin/dashboard');
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/make/list/');
        });
    }
}

var vehicleTrim = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var type = req.params.type;
        var model_id = req.params.model_id;
        var query = "SELECT * FROM vehicle_model where id = '" + model_id + "'";
        db.dbQuery(query).then(function(model_result) {
            var model = (model_result) ? model_result[0].model : "";
            switch (type) {
                case 'list':
                    var query = "SELECT * FROM vehicle_trim where model_id ='" + model_id + "' order by id DESC";
                    db.dbQuery(query).then(function(result) {
                        if (!valid(result)) {
                            return res.render('admin/vehicles/trim_list', { title: 'Vehicle Trim', AdminResult: AdminResult, result: result, moment: moment, model: model, model_id: model_id });
                        } else {
                            return res.render('admin/vehicles/trim_list', { title: 'Vehicle Trim', AdminResult: AdminResult, result: result, moment: moment, model: model, model_id: model_id });
                        }
                    }).catch(function(error) {
                        req.flash('error_message', error.sqlMessage);
                        return res.render('admin/vehicles/trim_list', { title: 'Vehicle Trim', AdminResult: AdminResult, result: [], moment: moment, model: model, model_id: model_id });
                    });
                    break;
                case 'add':
                    if (req.method == 'GET') {
                        return res.render('admin/vehicles/add_trim', { title: 'Add Trim', AdminResult: AdminResult, model: model, model_id: model_id });
                    } else {
                        var body = req.body;
                        if (!isset(body.trim) || empty(body.trim)) {
                            req.flash('error_message', 'Trim is required');
                            return res.redirect('/admin/trim/add/' + model_id);
                        } else {
                            externalFunctions.checkTrimExistence(req, model_id).then(function(added_status) {
                                var postData = {
                                    model_id: model_id,
                                    trim: body.trim,
                                    created_at: Date.now()
                                }
                                db.insertData('vehicle_trim', postData).then(function(result) {
                                    req.flash('success_message', "Trim added successfully");
                                    return res.redirect('/admin/trim/list/' + model_id);
                                }).catch(function(error) {
                                    req.flash('error_message', "Error while performing Query.");
                                    return res.redirect('/admin/trim/add/' + model_id);
                                });
                            }).catch(function(error) {
                                req.flash('error_message', error);
                                return res.redirect('/admin/trim/add/' + model_id);
                            });
                        }
                    }
                    break;
                default:
                    return res.redirect('/admin/dashboard');
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/model/list/' + model_id);
        });
    }
}

var getUsersList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM app_users order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/users/list', { title: 'Users', AdminResult: AdminResult, user_result: result, moment: moment });
            } else {
                return res.render('admin/users/list', { title: 'Users', AdminResult: AdminResult, user_result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/users/list', { title: 'Users', AdminResult: AdminResult, user_result: [], moment: moment });
        });
    }
}

var getUserDetails = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var user_id = req.params.user_id;
        var query = "SELECT * FROM app_users where id=" + user_id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "User is not valid");
                return res.redirect('/admin/user_list');
            } else {
                externalFunctions.getAppUserDetails(user_id).then(function(userOtherInfo) {
                    result[0].otherInfo = userOtherInfo;
                    return res.render('admin/users/user_details', { title: 'User Detail', AdminResult: AdminResult, user_result: result[0], moment: moment });
                }).catch(function(error) {
                    req.flash('error_message', error);
                    return res.redirect('/admin/login');
                });

            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/user_list');
        });
    }
}

var getInsuranceList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var insurance_type = req.params.type;
        if (insurance_type == 1)
            var query = "SELECT car_insurance.id,car_insurance.zipcode,car_insurance.first_name,car_insurance.last_name,car_insurance.status,users.local_storage_uid FROM car_insurance JOIN users ON users.id = car_insurance.user_id";
        if (insurance_type == 2)
            var query = "SELECT home_insurance.id,home_insurance.zipcode,home_insurance.first_name,home_insurance.last_name,home_insurance.status,users.local_storage_uid FROM home_insurance JOIN users ON users.id = home_insurance.user_id";
        if (insurance_type == 3)
            var query = "SELECT business_insurance.id,business_insurance.zipcode,business_insurance.first_name,business_insurance.last_name,business_insurance.status,users.local_storage_uid FROM business_insurance JOIN users ON users.id = business_insurance.user_id";
        if (insurance_type == 4)
            var query = "SELECT work_compensation_insurance.id,work_compensation_insurance.zipcode,work_compensation_insurance.first_name,work_compensation_insurance.last_name,work_compensation_insurance.status,users.local_storage_uid FROM work_compensation_insurance JOIN users ON users.id = work_compensation_insurance.user_id";
        db.dbQuery(query).then(function(ins_res) {
            if (!valid(ins_res)) {
                return res.render('admin/insurance/list', { title: 'Insurance', AdminResult: AdminResult, ins_res: ins_res, insurance_type: insurance_type });
            } else {
                return res.render('admin/insurance/list', { title: 'Insurance', AdminResult: AdminResult, ins_res: ins_res, insurance_type: insurance_type });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/insurance/list', { title: 'Insurance', AdminResult: AdminResult, ins_res: [], insurance_type: insurance_type });
        });
    }
}

var getCarInsuranceDetails = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var insurance_id = req.params.insurance_id;
        var ins_query = "SELECT car_insurance.*, users.local_storage_uid FROM car_insurance JOIN users ON users.id = car_insurance.user_id WHERE car_insurance.id=" + insurance_id;
        db.dbQuery(ins_query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Insurance ID is not valid");
                return res.redirect('/admin/insurance_list/1');
            } else {
                if (result.length <= 0) {
                    req.flash('error_message', "Insurance ID is not valid");
                    return res.redirect('/admin/insurance_list/1');
                }
                var v_query = "SELECT * FROM vehicles where FIND_IN_SET(id, '" + result[0].vehicle_id + "')";
                db.dbQuery(v_query).then(function(v_res) {
                    result[0].vehicleList = v_res;
                    var spouse_query = "SELECT * FROM vehicle_spouse_details where car_insurance_id = " + insurance_id;
                    db.dbQuery(spouse_query).then(function(spouse_res) {
                        result[0].spouse_res = spouse_res;
                        return res.render('admin/insurance/car_ins_details', { title: 'Insurance', AdminResult: AdminResult, ins_res: result[0], moment: moment });
                    }).catch(function(error) {
                        req.flash('error_message', error.sqlMessage);
                        return res.redirect('/admin/insurance_list/1');
                    });
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/insurance_list/1');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/insurance_list/1');
        });
    }
}

var getHomeInsuranceDetails = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var insurance_id = req.params.insurance_id;
        var ins_query = "SELECT home_insurance.*, users.local_storage_uid FROM home_insurance JOIN users ON users.id = home_insurance.user_id WHERE home_insurance.id=" + insurance_id;
        db.dbQuery(ins_query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Insurance ID is not valid");
                return res.redirect('/admin/insurance_list/2');
            } else {
                if (result.length <= 0) {
                    req.flash('error_message', "Insurance ID is not valid");
                    return res.redirect('/admin/insurance_list/2');
                } else {
                    return res.render('admin/insurance/home_ins_details', { title: 'Insurance', AdminResult: AdminResult, ins_res: result[0], moment: moment });
                }
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/insurance_list/2');
        });
    }
}

var getBusinessInsuranceDetails = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var insurance_id = req.params.insurance_id;
        var ins_query = "SELECT business_insurance.*, users.local_storage_uid, s1.name AS state_name,s2.name AS address_state_name,s3.name AS mailing_address_state_name FROM business_insurance JOIN users ON users.id = business_insurance.user_id JOIN states s1 ON s1.id=business_insurance.state_id JOIN states s2 ON s2.id=business_insurance.address_state_id JOIN states s3 ON s3.id=business_insurance.mailing_address_state_id WHERE business_insurance.id=" + insurance_id;
        db.dbQuery(ins_query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Insurance ID is not valid");
                return res.redirect('/admin/insurance_list/3');
            } else {
                if (result.length <= 0) {
                    req.flash('error_message', "Insurance ID is not valid");
                    return res.redirect('/admin/insurance_list/3');
                } else {
                    externalFunctions.getIndustryType(result[0].business_classification).then(function(industry_type) {
                        externalFunctions.getBusinessStructure(result[0].business_structure).then(function(business_structure_val) {
                            result[0].industry_type = industry_type;
                            result[0].business_structure_val = business_structure_val;
                            return res.render('admin/insurance/business_ins_details', { title: 'Insurance', AdminResult: AdminResult, ins_res: result[0], moment: moment });
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/insurance_list/3');
                        });
                    }).catch(function(error) {
                        req.flash('error_message', error);
                        return res.redirect('/admin/insurance_list/3');
                    });
                }
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/insurance_list/3');
        });
    }
}

var getWorkCompInsuranceDetails = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var insurance_id = req.params.insurance_id;
        var ins_query = "SELECT work_compensation_insurance.*, users.local_storage_uid FROM work_compensation_insurance JOIN users ON users.id = work_compensation_insurance.user_id WHERE work_compensation_insurance.id=" + insurance_id;
        db.dbQuery(ins_query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Insurance ID is not valid");
                return res.redirect('/admin/insurance_list/4');
            } else {
                if (result.length <= 0) {
                    req.flash('error_message', "Insurance ID is not valid");
                    return res.redirect('/admin/insurance_list/4');
                } else {
                    return res.render('admin/insurance/work_ins_details', { title: 'Insurance', AdminResult: AdminResult, ins_res: result[0], moment: moment });
                }
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/insurance_list/4');
        });
    }
}

var getContactUsList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT contact_us.*,users.local_storage_uid FROM contact_us JOIN users ON users.id = contact_us.user_id ORDER by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(res)) {
                return res.render('admin/contact_us/list', { title: 'Contact Us', AdminResult: AdminResult, res: [], moment: moment });
            } else {
                return res.render('admin/contact_us/list', { title: 'Contact Us', AdminResult: AdminResult, res: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/contact_us/list', { title: 'Contact Us', AdminResult: AdminResult, res: [], moment: moment });
        });
    }
}


var deleteContactUs = function (req,res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT id FROM contact_us where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Massage is not valid");
                return res.redirect('/admin/contact_us_list');
            } else {
                db.dbQuery("delete from contact_us where id=" + id).then(function(result) {
                    req.flash('success_message', "Message deleted successfully");
                    return res.redirect('/admin/contact_us_list');
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/contact_us_list');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/contact_us/list');
        });
    }
}

var getReferalList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT refer_by_details.*,users.local_storage_uid, count(refer_to_details.id) as no_of_referal_user FROM refer_by_details JOIN users ON users.id = refer_by_details.user_id JOIN refer_to_details ON refer_to_details.refer_user_id = refer_by_details.id group by refer_to_details.refer_user_id";
        db.dbQuery(query).then(function(result) {
            if (!valid(res)) {
                return res.render('admin/referal/list', { title: 'Referal List', AdminResult: AdminResult, res: [], moment: moment });
            } else {
                return res.render('admin/referal/list', { title: 'Referal List', AdminResult: AdminResult, res: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/referal/list', { title: 'Referal List', AdminResult: AdminResult, res: [], moment: moment });
        });
    }
}

var getReferalDetails = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var referal_id = req.params.referal_id;
        var query = "SELECT refer_by_details.*,users.local_storage_uid FROM refer_by_details JOIN users ON users.id = refer_by_details.user_id where refer_by_details.id=" + referal_id;
        db.dbQuery(query).then(function(result) {
            if (!valid(res)) {
                req.flash('error_message', "Referal ID is not valid");
                return res.render('admin/referal/list', { title: 'Referal List', AdminResult: AdminResult, res: [], moment: moment });
            } else {
                var query1 = "SELECT * FROM refer_to_details where refer_user_id=" + referal_id;
                db.dbQuery(query1).then(function(refer_to_result) {
                    if (!valid(refer_to_result)) {
                        req.flash('error_message', "Referal ID is not valid");
                        return res.render('admin/referal/list', { title: 'Referal List', AdminResult: AdminResult, res: [], moment: moment });
                    } else {
                        result[0].referToArr = refer_to_result;
                        return res.render('admin/referal/referal_details', { title: 'Referal Details', AdminResult: AdminResult, res: result[0], moment: moment });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.render('admin/referal/list', { title: 'Referal List', AdminResult: AdminResult, res: [], moment: moment });
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/referal/list', { title: 'Referal List', AdminResult: AdminResult, res: [], moment: moment });
        });
    }
}

var teamMembers = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var type = req.params.type;
        switch (type) {
            case 'list':
                var query = "SELECT * FROM team_members order by id ASC";
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        return res.render('admin/teams/list', { title: 'Team Members', AdminResult: AdminResult, result: result, moment: moment });
                    } else {
                        return res.render('admin/teams/list', { title: 'Team Members', AdminResult: AdminResult, result: result, moment: moment });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.render('admin/teams/list', { title: 'Team Members', AdminResult: AdminResult, result: [], moment: moment });
                });
                break;
            case 'add':
                if (req.method == 'GET') {
                    return res.render('admin/teams/add', { title: 'Add Member', AdminResult: AdminResult });
                } else {
                    var body = req.body;
                    externalFunctions.uploadSingleImage(req, app_config.directoryPath.team_members).then(function(image_url) {
                        var postData = {
                            name: body.name,
                            email: body.email,
                            phone_number: body.phone_number,
                            designation: body.designation,
                            bio: body.bio,
                            image: image_url,
                            created_at: Date.now()
                        }
                        db.insertData('team_members', postData).then(function(result) {
                            req.flash('success_message', "Member added successfully");
                            return res.redirect('/admin/teams/list');
                        }).catch(function(error) {
                            req.flash('error_message', "Error while performing Query.");
                            return res.redirect('/admin/teams/add');
                        });
                    }).catch(function(error) {
                        req.flash('error_message', error);
                        return res.redirect('/admin/teams/add');
                    });
                }
                break;
                case 'edit':
                    if (req.method == 'GET') {
                        var id = req.query.id
                        var query = "SELECT * FROM team_members where id = "+id;
                        db.dbQuery(query).then(function(result) {
                            if (!valid(result)) {
                                req.flash('error_message', "agent is not valid");
                                return res.redirect('/admin/teams/list');
                            } else {
                                return res.render('admin/teams/edit', { title: 'Edit Member', AdminResult: AdminResult, result: result[0] });
                            }
                        })
                    } else {
                        var body = req.body;
                        var where = "id = " + body.id;
                        if (req.files && req.files.image && req.files.image.originalFilename != "") {
                            externalFunctions.uploadSingleImage(req, app_config.directoryPath.team_members).then(function(image_url) {
                                var updatePostData = {
                                    name: body.name,
                                    email: body.email,
                                    phone_number: body.phone_number,
                                    designation: body.designation,
                                    bio: body.bio,
                                    image: image_url,
                                    created_at: Date.now()
                                }
                                db.updateWhere('team_members', updatePostData, where).then(function(result) {
                                    req.flash('success_message', "Member edited successfully");
                                    return res.redirect('/admin/teams/list');
                                }).catch(function(error) {
                                    req.flash('error_message', "Error while performing Query.");
                                    return res.redirect('/admin/teams/edit');
                                });
                            }).catch(function(error) {
                                req.flash('error_message', error);
                                return res.redirect('/admin/teams/edit');
                            });
                        }else{
                            var query = "SELECT * FROM team_members where id = "+body.id;
                            db.dbQuery(query).then(function(result) {
                                var updatePostData = {
                                    name: body.name,
                                    email: body.email,
                                    phone_number: body.phone_number,
                                    designation: body.designation,
                                    bio: body.bio,
                                    image: result[0].image,
                                    created_at: Date.now()
                                }
                                db.updateWhere('team_members', updatePostData, where).then(function(result) {
                                    req.flash('success_message', "Member edited successfully");
                                    return res.redirect('/admin/teams/list');
                                }).catch(function(error) {
                                    req.flash('error_message', "Error while performing Query.");
                                    return res.redirect('/admin/teams/edit');
                                });
                            }).catch(function(error) {
                                req.flash('error_message', error.sqlMessage);
                                return res.redirect('/admin/teams/list');
                            });
                        }
                    }
                    break;
                case 'delete':
                var id = req.query.id;
                var query = "SELECT * FROM team_members where id = " + id;
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.flash('error_message', "Member is not valid");
                        return res.redirect('/admin/teams/list');
                    } else {
                        db.dbQuery("delete from team_members where id=" + id).then(function(result1) {
                            externalFunctions.deleteSingleFileFromS3(result[0].image, app_config.directoryPath.team_members).then(function(delImgRes) {
                                req.flash('success_message', "Member deleted successfully");
                                return res.redirect('/admin/teams/list');
                            }).catch(function(error) {
                                req.flash('error_message', error);
                                return res.redirect('/admin/teams/list');
                            });
                        }).catch(function(error) {
                            req.flash('error_message', error.sqlMessage);
                            return res.redirect('/admin/teams/list');
                        });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/teams/list');
                });
                break;
            default:
                return res.redirect('/admin/dashboard');
        }

    }
}

var getOtherInsurance = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var insType = (req.body.ins_type !== undefined) ? parseInt(req.body.ins_type) : 5;
        var query = "SELECT insurance_details.*,users.local_storage_uid FROM insurance_details JOIN users ON users.id = insurance_details.user_id where insurance_details.insurance_type=" + insType + " order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/insurance/other_ins_list', { title: 'Insurance', AdminResult: AdminResult, ins_res: [], moment: moment, showTable: 1, insurance_type: insType });
            } else {
                return res.render('admin/insurance/other_ins_list', { title: 'Insurance', AdminResult: AdminResult, ins_res: result, moment: moment, showTable: 1, insurance_type: insType });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/insurance/other_ins_list', { title: 'Insurance', AdminResult: AdminResult, ins_res: [], moment: moment, showTable: 0, insurance_type: insType });
        });
    }
}

var getOtherInsuranceDetails = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var insType = parseInt(req.params.type);
        var insId = parseInt(req.params.id);
        req.body.ins_type = insType;
        switch (insType) {
            case 5:
                var query = "SELECT insurance_details.*,renter_ins_details.insure_address,renter_ins_details.personal_property_amount,users.local_storage_uid,states.name as state_name FROM insurance_details JOIN renter_ins_details ON renter_ins_details.insurance_id = insurance_details.id JOIN users ON users.id = insurance_details.user_id LEFT JOIN states ON states.id = insurance_details.state_id where insurance_details.id=" + insId;
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.flash('error_message', "Something went wrong");
                        return res.redirect('/admin/other_insurance');
                    } else {
                        return res.render('admin/insurance/renter_ins_details', { title: 'Renter Insurance', AdminResult: AdminResult, ins_res: result[0], moment: moment });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/other_insurance');
                });
                break;

            case 6:
                var query = "SELECT insurance_details.*,home_floater_ins_details.marital_status,home_floater_ins_details.education,home_floater_ins_details.work_industry,home_floater_ins_details.job_title,users.local_storage_uid FROM insurance_details JOIN home_floater_ins_details ON home_floater_ins_details.insurance_id = insurance_details.id JOIN users ON users.id = insurance_details.user_id where insurance_details.id=" + insId;
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.flash('error_message', "Something went wrong");
                        return res.redirect('/admin/other_insurance');
                    } else {
                        return res.render('admin/insurance/home_ins_floater', { title: 'Renter Insurance', AdminResult: AdminResult, ins_res: result[0], moment: moment });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/other_insurance');
                });
                break;

            case 7:
                var query = "SELECT insurance_details.*,users.local_storage_uid,states.name as state_name FROM insurance_details JOIN users ON users.id = insurance_details.user_id JOIN states ON states.id = insurance_details.state_id where insurance_details.id=" + insId;
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.flash('error_message', "Something went wrong");
                        return res.redirect('/admin/other_insurance');
                    } else {
                        var query1 = "select * from motor_vehicle_ins_details where insurance_id = " + insId;
                        db.dbQuery(query1).then(function(vehi_result) {
                            if (!valid(vehi_result)) {
                                req.flash('error_message', "Something went wrong");
                                return res.redirect('/admin/other_insurance');
                            } else {
                                result[0].vehicleData = vehi_result;
                                return res.render('admin/insurance/motorcycle_ins_details', { title: 'Motorcycle, RV, Boat', AdminResult: AdminResult, ins_res: result[0], moment: moment });
                            }
                        }).catch(function(error) {
                            req.flash('error_message', error.sqlMessage);
                            return res.redirect('/admin/other_insurance');
                        });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/other_insurance');
                });
                break;

            case 8:
                var query = "SELECT insurance_details.*,users.local_storage_uid,states.name as state_name FROM insurance_details JOIN users ON users.id = insurance_details.user_id JOIN states ON states.id = insurance_details.state_id where insurance_details.id=" + insId;
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.flash('error_message', "Something went wrong");
                        return res.redirect('/admin/other_insurance');
                    } else {
                        return res.render('admin/insurance/umbrella_ins_details', { title: 'Umbrella', AdminResult: AdminResult, ins_res: result[0], moment: moment });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/other_insurance');
                });
                break;

            case 9:
                var query = "SELECT insurance_details.*,users.local_storage_uid FROM insurance_details JOIN users ON users.id = insurance_details.user_id where insurance_details.id=" + insId;
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.flash('error_message', "Something went wrong");
                        return res.redirect('/admin/other_insurance');
                    } else {
                        return res.render('admin/insurance/small_grp_benifit_ins_details', { title: 'Small Group Benifits', AdminResult: AdminResult, ins_res: result[0], moment: moment });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/other_insurance');
                });
                break;

            case 10:
                var query = "SELECT insurance_details.*,life_ins_details.coverage_amt,life_ins_details.contain_nicotine,users.local_storage_uid,states.name as state_name FROM insurance_details JOIN life_ins_details ON life_ins_details.insurance_id = insurance_details.id JOIN users ON users.id = insurance_details.user_id LEFT JOIN states ON states.id = insurance_details.state_id where insurance_details.id=" + insId;
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.flash('error_message', "Something went wrong");
                        return res.redirect('/admin/other_insurance');
                    } else {
                        return res.render('admin/insurance/life_ins_details', { title: 'Life Insurance', AdminResult: AdminResult, ins_res: result[0], moment: moment });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/other_insurance');
                });
                break;

            case 16:
                var query = "SELECT insurance_details.*,midcare_ins_details.coverage_type,midcare_ins_details.tobacco_product,users.local_storage_uid FROM insurance_details JOIN midcare_ins_details ON midcare_ins_details.insurance_id = insurance_details.id JOIN users ON users.id = insurance_details.user_id where insurance_details.id=" + insId;
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.flash('error_message', "Something went wrong");
                        return res.redirect('/admin/other_insurance');
                    } else {
                        return res.render('admin/insurance/midcare_ins_details', { title: 'Midcare Insurance', AdminResult: AdminResult, ins_res: result[0], moment: moment });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/other_insurance');
                });
                break;

            default:
                if (insType >= 11 && insType <= 15) {
                    if (insType == 11)
                        var insuranceName = 'Health Care';
                    if (insType == 12)
                        var insuranceName = 'Accident';
                    if (insType == 13)
                        var insuranceName = 'Dental';
                    if (insType == 14)
                        var insuranceName = 'Short-Term Medical';
                    if (insType == 15)
                        var insuranceName = 'Vision';
                    var query = "SELECT insurance_details.*,health_ins_details.coverage_type,health_ins_details.cover_type,health_ins_details.tobacco_product,users.local_storage_uid FROM insurance_details JOIN health_ins_details ON health_ins_details.insurance_id = insurance_details.id JOIN users ON users.id = insurance_details.user_id where insurance_details.id=" + insId;
                    db.dbQuery(query).then(function(result) {
                        if (!valid(result)) {
                            req.flash('error_message', "Something went wrong");
                            return res.redirect('/admin/other_insurance');
                        } else {
                            var query1 = "select * from health_ins_other_details where insurance_id = " + insId;
                            db.dbQuery(query1).then(function(other_result) {
                                if (!valid(other_result)) {
                                    req.flash('error_message', "Something went wrong");
                                    return res.redirect('/admin/other_insurance');
                                } else {
                                    result[0].ChildData = other_result;
                                    result[0].insuranceName = insuranceName;
                                    return res.render('admin/insurance/health_ins_details', { title: insuranceName, AdminResult: AdminResult, ins_res: result[0], moment: moment });
                                }
                            }).catch(function(error) {
                                req.flash('error_message', error.sqlMessage);
                                return res.redirect('/admin/other_insurance');
                            });
                        }
                    }).catch(function(error) {
                        req.flash('error_message', error.sqlMessage);
                        return res.redirect('/admin/other_insurance');
                    });
                } else {
                    return res.redirect('/admin/other_insurance');
                }
        }

    }
}

var getEBookList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT e_book.*,users.local_storage_uid FROM e_book JOIN users ON users.id = e_book.user_id";
        db.dbQuery(query).then(function(result) {
            if (!valid(res)) {
                return res.render('admin/ebook/list', { title: 'E-Book', AdminResult: AdminResult, res: [], moment: moment });
            } else {
                return res.render('admin/ebook/list', { title: 'E-Book', AdminResult: AdminResult, res: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/ebook/list', { title: 'E-Book', AdminResult: AdminResult, res: [], moment: moment });
        });
    }
}

var category = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var type = req.params.type;
        switch (type) {
            case 'list':
                var query = "SELECT * FROM category where type = 3 order by id DESC";
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        return res.render('admin/category/list', { title: 'Category', AdminResult: AdminResult, result: result, moment: moment });
                    } else {
                        return res.render('admin/category/list', { title: 'Category', AdminResult: AdminResult, result: result, moment: moment });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.render('admin/category/list', { title: 'Category', AdminResult: AdminResult, result: [], moment: moment });
                });
                break;
            case 'add':
                if (req.method == 'GET') {
                    return res.render('admin/category/add', { title: 'Add Category', AdminResult: AdminResult });
                } else {
                    var body = req.body;
                    if (!isset(body.category) || empty(body.category)) {
                        req.flash('error_message', 'Category is required');
                        return res.redirect('/admin/category/add');
                    } else {
                        externalFunctions.checkCategoryExistence(req).then(function(added_status) {
                            var postData = {
                                type: parseInt(body.type),
                                category: body.category,
                                created_at: Date.now()
                            }
                            db.insertData('category', postData).then(function(result) {
                                req.flash('success_message', "Category added successfully");
                                return res.redirect('/admin/category/list');
                            }).catch(function(error) {
                                req.flash('error_message', "Error while performing Query.");
                                return res.redirect('/admin/category/add');
                            });
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/category/add');
                        });
                    }
                }
                break;

            case 'delete':
                var cat_id = req.params.id;
                var query = "SELECT * FROM category where id = " + cat_id;
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.flash('error_message', "Category is not valid");
                        return res.redirect('/admin/category/list');
                    } else {
                        db.dbQuery("delete from category where id=" + cat_id).then(function(result) {
                            req.flash('success_message', "Category deleted successfully");
                            return res.redirect('/admin/category/list');
                        }).catch(function(error) {
                            req.flash('error_message', error.sqlMessage);
                            return res.redirect('/admin/category/list');
                        });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/category/list');
                });
                break;

            default:
                return res.redirect('/admin/dashboard');
        }

    }
}


var getUserInsuranceList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM user_insurance_details WHERE requestedBy = 1 AND NOT type = 23 order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/gerenal_insurance/list', { title: 'Users', AdminResult: AdminResult, user_result: result, moment: moment });
            } else {
                return res.render('admin/gerenal_insurance/list', { title: 'Users', AdminResult: AdminResult, user_result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/gerenal_insurance/list', { title: 'Users', AdminResult: AdminResult, user_result: [], moment: moment });
        });
    }
}

var deleteInsurance = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM user_insurance_details where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Insurance is not valid");
                return res.redirect('/admin/insurance_details');
            } else {
                db.dbQuery("delete from user_insurance_details where id=" + id).then(function(result) {
                    req.flash('success_message', "insurance deleted successfully");
                    return res.redirect('/admin/insurance_details');
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/insurance_details');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/insurance_details');
        });
    }
}

var getPartnershipRequests = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM partnership_requests order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/partnership_requests/list', { title: 'Partnership Requests', AdminResult: AdminResult, user_result: result, moment: moment });
            } else {
                return res.render('admin/partnership_requests/list', { title: 'Partnership Requests', AdminResult: AdminResult, user_result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/partnership_requests/list', { title: 'Partnership Requests', AdminResult: AdminResult, user_result: [], moment: moment });
        });
    }
}

var deletePartnershipRequests = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM partnership_requests where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Partnership requests is not valid");
                return res.redirect('/admin/partnership_requests');
            } else {
                db.dbQuery("delete from partnership_requests where id=" + id).then(function(result) {
                    req.flash('success_message', "Partnership request deleted successfully");
                    return res.redirect('/admin/partnership_requests');
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/partnership_requests');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/partnership_requests');
        });
    }

}

var getPolicyReviewRequest = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM policy_review_request order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/policy_review_request/list', { title: 'policy Review Requests', AdminResult: AdminResult, user_result: result, moment: moment });
            } else {
                return res.render('admin/policy_review_request/list', { title: 'policy Review Requests', AdminResult: AdminResult, user_result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/policy_review_request/list', { title: 'policy Review Requests', AdminResult: AdminResult, user_result: [], moment: moment });
        });
    }
}

var deletePolicyReviewRequest = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM policy_review_request where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Partnership requests is not valid");
                return res.redirect('/admin/policy_review_request');
            } else {
                db.dbQuery("delete from policy_review_request where id=" + id).then(function(result) {
                    req.flash('success_message', "Policy review request deleted successfully");
                    return res.redirect('/admin/policy_review_request');
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/policy_review_request');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/policy_review_request');
        });
    }

}

var AddCarrier = function(req,res){
    
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == 'GET') {
            return res.render('admin/carriers/add', { title: 'Add Carrier', AdminResult: AdminResult });
        } else {
            var body = req.body;
            externalFunctions.uploadSingleImage(req, app_config.directoryPath.agent).then(function(image_url) {
                var postData = {
                    name : body.name,
                    claims_phone_number : body.claims_number,
                    service_phone_number : body.service_number,
                    claim_url : body.claim_url,
                    billing_url : body.billing_url,
                    website_url : body.website_url,
                    Image : image_url,
                    created_at : Date.now()

                }
                db.insertData('carrier', postData).then(function(result) {
                    req.flash('success_message', "Carrier added successfully");
                    return res.redirect('/admin/carrierList');
                }).catch(function(error) {
                    req.flash('error_message', error);
                    return res.redirect('/admin/addCarrier');
                });
            }).catch(function(error) {
                req.flash('error_message', error);
                return res.redirect('/admin/carriers/addCarrier');
            });
        }
    }

}

var getCarrierList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM carrier order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/carriers/list', { title: 'Carrier', AdminResult: AdminResult, result: result, moment: moment });
            } else {
                return res.render('admin/carriers/list', { title: 'Carrier', AdminResult: AdminResult, result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/carriers/list', { title: 'Carrier', AdminResult: AdminResult, result: [], moment: moment });
        });
    }
}

var editCarrier = function(req,res){
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == "POST") {
            var id = req.params.id
            var query = "SELECT * FROM carrier where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Carrier is not valid");
                    return res.redirect('/admin/carrierList');
                } else {
                    var body = req.body;
                    var where = "id = " + req.params.id;
                    if (req.files && req.files.image && req.files.image.originalFilename != "") {
                        externalFunctions.uploadSingleImage(req, app_config.directoryPath.agent).then(function(image_url) {
                            var updatePostData = {
                                name : body.name,
                                claims_phone_number : body.claims_number,
                                service_phone_number : body.service_number,
                                claim_url : body.claim_url,
                                billing_url : body.billing_url,
                                website_url : body.website_url,
                                Image : image_url,
                                created_at : Date.now()
                            }
                            db.updateWhere('carrier', updatePostData, where).then(function(result) {
                                req.flash('success_message', "Carrier edit successfully");
                                return res.redirect('/admin/carrierList');
                            }).catch(function(error) {
                                req.flash('error_message', error);
                                return res.redirect('/admin/editCarrier/' + body.id);
                            });
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/editCarrier' + body.id);
                        });
                    } else {
                        var updatePostData = {
                            name : body.name,
                            claims_phone_number : body.claims_number,
                            service_phone_number : body.service_number,
                            claim_url : body.claim_url,
                            billing_url : body.billing_url,
                            website_url : body.website_url,
                            Image : result[0].Image,
                            created_at : Date.now()
                        }
                        db.updateWhere('carrier', updatePostData, where).then(function(result) {
                            req.flash('success_message', "Carrier edit successfully");
                            return res.redirect('/admin/carrierList');
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/editCarrier/' + body.id);
                        });
                    }
                }
            }).catch(function(error) {
                req.flash('error_message', error.sqlMessage);
                return res.redirect('/admin/carrierList');
            });
        } else {
            var id = req.params.id;
            var query = "SELECT * FROM carrier where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "agent is not valid");
                    return res.redirect('/admin/carrierList');
                } else {
                    return res.render('admin/carriers/edit', { title: 'Edit Carrier', AdminResult: AdminResult, result: result[0] });
                }
            })
        }
    }
}

var deleteCarrier = function(req,res){
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM carrier where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Agent is not valid");
                return res.redirect('/admin/carrierList');
            } else {
                db.dbQuery("delete from carrier where id=" + id).then(function(result) {
                    externalFunctions.deleteSingleFileFromS3(result[0].image, app_config.directoryPath.user_asset).then(function(delImgRes) {
                        req.flash('success_message', "Agent deleted successfully");
                        return res.redirect('/admin/carrierList');
                    }).catch(function(error) {
                        req.flash('error_message', error);
                        return res.redirect('/admin/carrierList');
                    });
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/carrierList');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/carrierList');
        });
    }
}


var getClaimList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM claims order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/claim-reports/list', { title: 'Claims', AdminResult: AdminResult, result: result, moment: moment });
            } else {
                return res.render('admin/claim-reports/list', { title: 'Claims', AdminResult: AdminResult, result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/claim-reports/list', { title: 'Claims', AdminResult: AdminResult, result: [], moment: moment });
        });
    }
}

var AddCareers = function(req,res){
    
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == 'GET') {
            return res.render('admin/careers/add', { title: 'Add Carrier', AdminResult: AdminResult });
        } else {
            var body = req.body;
            var postData = {
                title : body.title,
                description : body.description,
                experience : body.experience,
                expertise : body.short_description,
                post_number : body.post_number,
                salary : body.salary,
                created_at : Date.now()
            }
            db.insertData('careers', postData).then(function(result) {
                req.flash('success_message', "Careers added successfully");
                return res.redirect('/admin/careersList');
            }).catch(function(error) {
                req.flash('error_message', error);
                return res.redirect('/admin/addcareers');
            });
        }
    }

}

var getCareersList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM careers order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/careers/list', { title: 'Careers', AdminResult: AdminResult, result: result, moment: moment });
            } else {
                return res.render('admin/careers/list', { title: 'Careers', AdminResult: AdminResult, result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/careers/list', { title: 'Careers', AdminResult: AdminResult, result: [], moment: moment });
        });
    }
}

var editCareers = function(req,res){
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == "POST") {
            var id = req.params.id
            var query = "SELECT * FROM careers where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Careers is not valid");
                    return res.redirect('/admin/carrierList');
                } else {
                    var body = req.body;
                    var where = "id = " + req.params.id;
                        var updatePostData = {
                            title : body.title,
                            description : body.description,
                            experience : body.experience,
                            expertise : body.short_description,
                            post_number : body.post_number,
                            salary : body.salary,
                            created_at : Date.now()
                        }
                        db.updateWhere('careers', updatePostData, where).then(function(result) {
                            req.flash('success_message', "Careers edit successfully");
                            return res.redirect('/admin/careersList');
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/editcareers/' + body.id);
                        });
                }
            }).catch(function(error) {
                req.flash('error_message', error.sqlMessage);
                return res.redirect('/admin/careersList');
            });
        } else {
            var id = req.params.id;
            var query = "SELECT * FROM careers where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "agent is not valid");
                    return res.redirect('/admin/careersList');
                } else {
                    return res.render('admin/careers/edit', { title: 'Edit Careers', AdminResult: AdminResult, result: result[0] });
                }
            })
        }
    }
}

var deleteCareers = function(req,res){
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM careers where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Careers is not valid");
                return res.redirect('/admin/careersList');
            } else {
                db.dbQuery("delete from careers where id=" + id).then(function(result) {
                    req.flash('success_message', "Careers deleted successfully");
                    return res.redirect('/admin/careersList');
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/careersList');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/careersList');
        });
    }
}

var getAppliedJobList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM job_requests order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/job_requests/list', { title: 'Careers', AdminResult: AdminResult, result: result, moment: moment });
            } else {
                return res.render('admin/job_requests/list', { title: 'Careers', AdminResult: AdminResult, result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/job_requests/list', { title: 'Careers', AdminResult: AdminResult, result: [], moment: moment });
        });
    }
}


var getReferralList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM agents where referredBy = '"+req.session.AdminData.admin_id+"' AND userType= 'referral' order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/referral/list', { title: 'Referral', AdminResult: AdminResult, result: result, moment: moment });
            } else {
                return res.render('admin/referral/list', { title: 'Referral', AdminResult: AdminResult, result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/referral/list', { title: 'Referral', AdminResult: AdminResult, result: [], moment: moment });
        });
    }
}

var addReferral = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == 'GET') {
            return res.render('admin/referral/add', { title: 'Add Referral', AdminResult: AdminResult });
        } else {
            var body = req.body;
            var email = body.email;
            var query = "SELECT * FROM agents where email = '"+email+"'"
            db.dbQuery(query).then(function(result) {
                if(result.length && result.length>0){
                    req.flash('error_message', "This email is already exist !");
                    return res.redirect('/admin/addReferral');
                }else{
                    if (Array.isArray(body.products)) {
                        var products = body.products
                    } else {
                        var products = body.products.split()
                    }
                    // console.log(products);
        
                    externalFunctions.uploadSingleImage(req, app_config.directoryPath.agent).then(function(image_url) {
                        var postData = {
                            first_name: body.first_name,
                            last_name: body.last_name,
                            email: body.email,
                            phone_number: body.phone_number,
                            license : "",
                            about : body.about,
                            address: body.address,
                            state: body.state,
                            city: body.city,
                            fb_link: body.fb_link,
                            twitter_link: body.twitter_link,
                            products: JSON.stringify(products),
                            image: image_url,
                            userType : "referral",
                            password : "DefyInsurance@2021",
                            referredBy : 1,
                            created_at: Date.now()
                        }
                        db.insertData('agents', postData).then(function(result) {
                            var email = body.email;
                            var subject = "Welcome to Defy Insurance.";
                            var password = "DefyInsurance@2021";
                            var url = "http://swiftbullhead.com/get_referral/"+result.insertId
                            var logo = app_config.url.node_base_url + '/public/logo.png';
                            var icon = app_config.url.node_base_url + '/public/icon.png';
                            var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                            var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                            var userHtml = "<p>Welcome to Defy Insurance.</p><br><p>We have added you as a Referral in Defy Insurance. Here we are sharing your login details to access your Referral Admin.</p><br><p><strong>Email ID - </strong>"+email+"</p><p><strong>Password - </strong>"+password+"</p><p><strong>URL - </strong>"+url+"</p>";
                            
                            var userData = {template:"WelcomeDefy", html: userHtml, email: email, subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3};
                            externalFunctions.sendMailAWS(userData)
                            req.flash('success_message', "Referral added successfully");
                            return res.redirect('/admin/referralList');
                        }).catch(function(error) {
                            var err = JSON.stringify(error)
                            console.log(err);
                            req.flash('error_message', err);
                            return res.redirect('/admin/addReferral');
                        });
                    }).catch(function(error) {
                        var err = JSON.stringify(error)
                            console.log(err);
                        req.flash('error_message', error);
                        return res.redirect('/admin/addReferral');
                    });
                }
            }).catch(function(error) {
                var err = JSON.stringify(error)
                console.log(err);
                req.flash('error_message', err);
                return res.redirect('/admin/addReferral');
            });
        }
    }
}

var deleteReferral = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM agents where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Referral is not valid");
                return res.redirect('/admin/referralList');
            } else {
                db.dbQuery("delete from agents where id=" + id).then(function(result) {
                    externalFunctions.deleteSingleFileFromS3(result[0].image, app_config.directoryPath.user_asset).then(function(delImgRes) {
                        req.flash('success_message', "Referral deleted successfully");
                        return res.redirect('/admin/referralList');
                    }).catch(function(error) {
                        req.flash('error_message', error);
                        return res.redirect('/admin/referralList');
                    });
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/referralList');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/referralList');
        });
    }
}


var editReferral = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == "POST") {
            var id = req.body.agent_id;
            var query = "SELECT * FROM agents where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Referral is not valid");
                    return res.redirect('/admin/referralList');
                } else {
                    var body = req.body;                    
                    if (Array.isArray(body.products)) {
                        var products = JSON.stringify(body.products)
                    } else if(body.products && body.products!=""){
                        var products = JSON.stringify(body.products.split())
                    }else{
                        var products = result[0].products;
                    }
                    var where = "id = " + body.agent_id;
                    if (req.files && req.files.image && req.files.image.originalFilename != "") {
                        externalFunctions.uploadSingleImage(req, app_config.directoryPath.agent).then(function(image_url) {
                            var updatePostData = {
                                first_name: body.first_name,
                                last_name: body.last_name,
                                email: body.email,
                                phone_number: body.phone_number,
                                license : "",
                                about : body.about,
                                address: body.address,
                                state: body.state || result[0].state,
                                city: body.city,
                                fb_link: body.fb_link,
                                twitter_link: body.twitter_link,
                                products: products,
                                image: image_url,
                                userType : result[0].userType,
                                password : result[0].password,
                                referredBy : result[0].referredBy,
                                created_at: Date.now()
                            }
                            db.updateWhere('agents', updatePostData, where).then(function(result) {
                                req.flash('success_message', "Referral edit successfully");
                                return res.redirect('/admin/referralList');
                            }).catch(function(error) {
                                req.flash('error_message', error);
                                return res.redirect('/admin/editReferral/' + body.id);
                            });
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/editReferral' + body.id);
                        });
                    } else {
                        var updatePostData = {
                            first_name: body.first_name,
                            last_name: body.last_name,
                            email: body.email,
                            phone_number: body.phone_number,
                            license : "",
                            about : body.about,
                            address: body.address,
                            state: body.state || result[0].state,
                            city: body.city,
                            fb_link: body.fb_link,
                            twitter_link: body.twitter_link,
                            products: products,
                            image: result[0].image,
                            userType : result[0].userType,
                            password : result[0].password,
                            referredBy : result[0].referredBy,
                            created_at: Date.now()
                        }
                        db.updateWhere('agents', updatePostData, where).then(function(result) {
                            req.flash('success_message', "Referral edit successfully");
                            return res.redirect('/admin/referralList');
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/editReferral/' + body.id);
                        });
                    }

                }
            }).catch(function(error) {
                req.flash('error_message', error.sqlMessage);
                return res.redirect('/admin/referralList');
            });
        } else {
            var id = req.params.id;
            var query = "SELECT * FROM agents where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Referral is not valid");
                    return res.redirect('/admin/referralList');
                } else {
                    return res.render('admin/referral/edit', { title: 'Edit Referral', AdminResult: AdminResult, result: result });
                }
            })
        }
    }
}

var getAgentsList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM agents order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/agent/list', { title: 'Agent', AdminResult: AdminResult, result: result, moment: moment });
            } else {
                return res.render('admin/agent/list', { title: 'Agent', AdminResult: AdminResult, result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/agent/list', { title: 'Agent', AdminResult: AdminResult, result: [], moment: moment });
        });
    }
}

var addAgent = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == 'GET') {
            return res.render('admin/agent/add', { title: 'Add agent', AdminResult: AdminResult });
        } else {
            var body = req.body;
            if (Array.isArray(body.products)) {
                var products = body.products
            } else {
                var products = body.products.split()
            }
            // console.log(products);

            externalFunctions.uploadSingleImage(req, app_config.directoryPath.agent).then(function(image_url) {
                var postData = {
                    first_name: body.first_name,
                    last_name: body.last_name,
                    email: body.email,
                    phone_number: body.phone_number,
                    license : body.license,
                    about : body.about,
                    address: body.address,
                    state: body.state,
                    city: body.city,
                    fb_link: body.fb_link,
                    twitter_link: body.twitter_link,
                    products: JSON.stringify(products),
                    image: image_url,
                    userType : "agent",
                    password : "DefyInsurance@2021",
                    created_at: Date.now()
                }
                db.insertData('agents', postData).then(function(result) {
                    var email = body.email;
                        var subject = "Welcome to Defy Insurance.";
                        var password = "DefyInsurance@2021";
                        var url = "http://swiftbullhead.com/get_referral/"+result.insertId
                        var logo = app_config.url.node_base_url + '/public/logo.png';
                        var icon = app_config.url.node_base_url + '/public/icon.png';
                        var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                        var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                        var userHtml = "<p>Welcome to Defy Insurance.</p><p>We have added you as a agent in Defy Insurance. Here we are sharing your login details to access your Agent Admin.</p><br><p><strong>Email ID - </strong>"+email+"</p><p><strong>Password - </strong>"+password+"</p><p><strong>URL - </strong>"+url+"</p>";
                        
                        var userData = { template:"WelcomeDefy", html: userHtml, email: email, subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3 };
                        externalFunctions.sendMailAWS(userData)
                    req.flash('success_message', "Agent added successfully");
                    return res.redirect('/admin/agent/list');

                }).catch(function(error) {
                    var err = JSON.stringify(error)
                    req.flash('error_message', err);
                    return res.redirect('/admin/agent/add');
                });
            }).catch(function(error) {
                req.flash('error_message', error);
                return res.redirect('/admin/agent/add');
            });
        }
    }
}

var deleteAgent = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM agents where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Agent is not valid");
                return res.redirect('/admin/agent/list');
            } else {
                db.dbQuery("delete from agents where id=" + id).then(function(result) {
                    externalFunctions.deleteSingleFileFromS3(result[0].image, app_config.directoryPath.user_asset).then(function(delImgRes) {
                        req.flash('success_message', "Agent deleted successfully");
                        return res.redirect('/admin/agent/list');
                    }).catch(function(error) {
                        req.flash('error_message', error);
                        return res.redirect('/admin/agent/list');
                    });
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/agent/list');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/agent/list');
        });
    }
}


var editAgent = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == "POST") {
            var id = req.body.agent_id;
            var query = "SELECT * FROM agents where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Agent is not valid");
                    return res.redirect('/admin/agent/list');
                } else {
                    var body = req.body;                    
                    if (Array.isArray(body.products)) {
                        var products = JSON.stringify(body.products)
                    } else if(body.products && body.products!=""){
                        var products = JSON.stringify(body.products.split())
                    }else{
                        var products = result[0].products;
                    }
                    var where = "id = " + body.agent_id;
                    if (req.files && req.files.image && req.files.image.originalFilename != "") {
                        externalFunctions.uploadSingleImage(req, app_config.directoryPath.agent).then(function(image_url) {
                            var updatePostData = {
                                first_name: body.first_name,
                                last_name: body.last_name,
                                email: body.email,
                                phone_number: body.phone_number,
                                license : body.license,
                                about : body.about,
                                address: body.address,
                                state: body.state || result[0].state,
                                city: body.city,
                                fb_link: body.fb_link,
                                twitter_link: body.twitter_link,
                                products: products,
                                image: image_url,
                                userType : result[0].userType,
                                password : result[0].password,
                                created_at: Date.now()
                            }
                            db.updateWhere('agents', updatePostData, where).then(function(result) {
                                req.flash('success_message', "Agent edit successfully");
                                return res.redirect('/admin/agent/list');
                            }).catch(function(error) {
                                req.flash('error_message', error);
                                return res.redirect('/admin/agent/edit/' + body.id);
                            });
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/agent/edit' + body.id);
                        });
                    } else {
                        var updatePostData = {
                            first_name: body.first_name,
                            last_name: body.last_name,
                            email: body.email,
                            phone_number: body.phone_number,
                            license : body.license,
                            about : body.about,
                            address: body.address,
                            state: body.state || result[0].state,
                            city: body.city,
                            fb_link: body.fb_link,
                            twitter_link: body.twitter_link,
                            products: products,
                            image: result[0].image,
                            userType : result[0].userType,
                            password : result[0].password,
                            created_at: Date.now()
                        }
                        db.updateWhere('agents', updatePostData, where).then(function(result) {
                            req.flash('success_message', "Agent edit successfully");
                            return res.redirect('/admin/agent/list');
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/agent/edit/' + body.id);
                        });
                    }

                }
            }).catch(function(error) {
                req.flash('error_message', error.sqlMessage);
                return res.redirect('/admin/agent/list');
            });
        } else {
            var id = req.params.id;
            var query = "SELECT * FROM agents where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "agent is not valid");
                    return res.redirect('/admin/agent/list');
                } else {
                    return res.render('admin/agent/edit', { title: 'Edit Agent', AdminResult: AdminResult, result: result });
                }
            })
        }
    }
}

var updateStatus = function (req,res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var body = req.body;
        var where = "id = "+body.id;
        var status = body.status;
        var updatePostData = {
            status : status
        }
        db.updateWhere('user_insurance_details', updatePostData, where).then(function(result) {
            req.flash('success_message', "Status updated successfully !");
            return res.redirect('/admin/insurance_details/'+ body.id);
        }).catch(function(error) {
            var err = JSON.stringify(error)
            req.flash('error_message', err);
            return res.redirect('/admin/insurance_details/'+ body.id);
        });
    }
}

var detailInsurance = function (req,res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM user_insurance_details where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                console.log("here");
                
                return res.render('admin/gerenal_insurance/list', { title: 'Insurance Details', AdminResult: AdminResult, user_result: result, moment: moment });
            } else {
                return res.render('admin/gerenal_insurance/insurance_details', { title: 'Users', AdminResult: AdminResult, user_result: result, moment: moment });
            }
        }).catch(function(error) {
            console.log("errror here" ,error);
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/insurance_details');
        });
    }
    
}


var changePassword = function(req,res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
    if (req.method == "GET") {
        return res.render("admin/change-password",{ title: 'Chenge Password', AdminResult: AdminResult })
    }else{
        var body = req.body;
        if(md5(body.old_pass)!=AdminResult.password){
            req.flash('error_message', "Invalid old password");
            return res.redirect('/admin/change-password');
        }
        if(body.new_pass!=body.confirm_pass){
            req.flash('error_message', "New password and confirm password not macth!");
            return res.redirect('/admin/change-password');
        }
        var where = "id = " + AdminResult.id;
        var updatePostData = {
            password : md5(body.confirm_pass)
        }
        db.updateWhere('admin_details', updatePostData, where).then(function(result) {
            req.flash('success_message', "Your Pssword is changed successfully Please login here !");
            return res.redirect('/admin/dashboard');
        }).catch(function(error) {
            req.flash('error_message', error);
            return res.redirect('/admin/change-password');
        });
    }
}
}



router.get("/login", Login);
router.post("/login", Login);
router.get("/logout", Logout);
router.get("/dashboard", Dashboard);
router.get("/user_list", getUsersList);
router.get("/user_details/:user_id", getUserDetails);
router.get("/maker/:type", vehicleMaker);
router.post("/maker/:type", vehicleMaker);
router.get("/model/:type/:make_id", vehicleModel);
router.post("/model/:type/:make_id", vehicleModel);
router.get("/trim/:type/:model_id", vehicleTrim);
router.post("/trim/:type/:model_id", vehicleTrim);
router.get("/insurance_list/:type", getInsuranceList);
router.get("/car_insurance_details/:insurance_id", getCarInsuranceDetails);
router.get("/home_insurance_details/:insurance_id", getHomeInsuranceDetails);
router.get("/business_insurance_details/:insurance_id", getBusinessInsuranceDetails);
router.get("/work_insurance_details/:insurance_id", getWorkCompInsuranceDetails);
router.get("/contact_us_list", getContactUsList);
router.get("/deleteContactUs/:id", deleteContactUs);
router.get("/refer_list", getReferalList);
router.get("/referal_details/:referal_id", getReferalDetails);
router.get("/teams/:type", teamMembers);
router.post("/teams/:type", teamMembers);
router.get("/other_insurance", getOtherInsurance);
router.post("/other_insurance", getOtherInsurance);
router.get("/other_insurance_details/:type/:id", getOtherInsuranceDetails);
router.get("/e-book", getEBookList);
router.get("/category/:type", category);
router.post("/category/:type", category);
router.get("/category/:type/:id", category);

router.get("/insurance_details", getUserInsuranceList);
router.get("/delete_nsurance/:id", deleteInsurance);
router.get("/partnership_requests", getPartnershipRequests);
router.get("/delete_partnership_requests/:id", deletePartnershipRequests);

router.get("/policy_review_request", getPolicyReviewRequest);
router.get("/delete_policy_review_request/:id", deletePolicyReviewRequest);

router.get("/addCarrier", AddCarrier);
router.post("/addCarrier", AddCarrier);
router.get("/carrierList", getCarrierList);
router.get("/editCarrier/:id", editCarrier);
router.post("/editCarrier/:id", editCarrier);
router.get("/deleteCarrier/:id", deleteCarrier);
router.get("/claimList", getClaimList);

router.get("/addCareers", AddCareers);
router.post("/addCareers", AddCareers);
router.get("/careersList", getCareersList);
router.get("/editCareers/:id", editCareers);
router.post("/editCareers/:id", editCareers);
router.get("/deleteCareers/:id", deleteCareers);
router.get("/appliedJobList",getAppliedJobList);

router.get("/agent/list", getAgentsList);
router.get("/agent/add", addAgent);
router.post("/agent/add", addAgent);
router.get("/agent/delete/:id", deleteAgent);
router.get("/agent/edit/:id", editAgent);
router.post("/agent/edit/:id", editAgent);

router.get("/referralList", getReferralList);
router.get("/addReferral", addReferral);
router.post("/addReferral", addReferral);
router.get("/deleteReferral/:id", deleteReferral);
router.get("/editReferral/:id", editReferral);
router.post("/editReferral/:id", editReferral);
router.get("/insurance_details/:id", detailInsurance);
router.post("/updateStatus", updateStatus);
router.get("/change-password", changePassword);
router.post("/change-password", changePassword);

module.exports = router;