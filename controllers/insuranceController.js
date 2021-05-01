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
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
const AWS = require("aws-sdk");
const Email = require('email-templates');
const email = new Email({
    views: {
        options: {
            extension: 'ejs' // <---- HERE
        }
    }
});

var app_config = require('../app_config');
const ItemPerPage = 10;

router.use(function(req, res, next) {
    req.response = {};
    req.response.base_url = app_config.url.base_url;
    req.response.node_base_url = app_config.url.node_base_url;
    if (!isset(req.session.user_id) && empty(req.session.user_id) && req.session.user_id == undefined) {
        var local_storage_uid = localStorage.getItem('user_request');
        where = "local_storage_uid = '" + local_storage_uid + "' AND browser = '" + req.useragent.browser + "'";
        db.getWhere('users', where).then(function(user_result) {
            if (user_result.length > 0) {
                req.session.user_id = user_result[0].id;
            } else {
                var postData = {
                    local_storage_uid: local_storage_uid,
                    browser: req.useragent.browser,
                    os: req.useragent.os,
                    platform: req.useragent.platform,
                    status: 1,
                    created_at: Date.now()
                }
                db.insertData('users', postData).then(function(result) {
                    req.session.user_id = result.insertId;
                }).catch(function(error) {
                    req.flash('error_message', error);
                });
            }
            next();
        }).catch(function(error) {
            req.flash('error_message', error);
            return res.redirect('/');
        });
    } else {
        next();
    }
});

var Home = function(req, res) {
    try {
        var videoQuery = "select url from videos where type = 18 ORDER BY id DESC LIMIT 1";
        var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where status = 1 ORDER BY id DESC LIMIT 6";
        db.dbQuery(videoQuery).then(function(video_result) {
            externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                req.response.about_video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                return res.render('home', req.response);
            }).catch(function(error) {
                req.response.about_video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('home', req.response);
            });
        }).catch(function(error) {
            req.response.about_video = "https://www.youtube.com/embed/9xwazD5SyVg";
            req.response.blogRes = [];
            return res.render('home', req.response);
        });
    } catch (Error) {
        console.log(Error.message);
    }
};

var getAutoInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 1 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 1 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/auto/auto_landing', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/auto/auto_landing', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/auto/auto_landing', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/1");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getHomeInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 2 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 2 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/home/home_landing', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/home/home_landing', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/home/home_landing', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/2");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getLifeInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 10 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 10 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/life/life_landing', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/life/life_landing', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/life/life_landing', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/10");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getRentersInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 5 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 5 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/renters/renter_landing', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/renters/renter_landing', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/renters/renter_landing', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/5");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getBusinessInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 3 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 3 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/business/business_landing', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/business/business_landing', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/business/business_landing', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/3");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getWorkerCompInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 4 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 4 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/work_comp/work_comp_landing', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/work_comp/work_comp_landing', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/work_comp/work_comp_landing', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/4");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getTravelInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 12 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 12 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/travel/travel_landing', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/travel/travel_landing', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/travel/travel_landing', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/12");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var AddInsurance = function(req, res) {
    try {
        /*if (!isset(req.session.zipcode) && empty(req.session.zipcode) && req.session.zipcode == undefined) {
         req.flash('error_message', "Session expired");
         return res.redirect('/');
         } else {*/
        if (req.method == 'GET') {
            if (req.params.insurance_type == 1)
                return res.render('insurance/auto/car_insurance', req.response);
            else if (req.params.insurance_type == 2)
                return res.render('insurance/home/home_insurance', req.response);
            else if (req.params.insurance_type == 3) {
                var query = "SELECT * FROM states where country_id=231";
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.response.states = [];
                        externalFunctions.getCategoryListByType(req.params.insurance_type).then(function(cat_result) {
                            req.response.catRes = cat_result;
                            return res.render('insurance/business/business_insurance', req.response);
                        }).catch(function(error) {
                            req.response.catRes = [];
                            return res.render('insurance/business/business_insurance', req.response);
                        });
                    } else {
                        req.response.states = result;
                        externalFunctions.getCategoryListByType(req.params.insurance_type).then(function(cat_result) {
                            req.response.catRes = cat_result;
                            return res.render('insurance/business/business_insurance', req.response);
                        }).catch(function(error) {
                            req.response.catRes = [];
                            return res.render('insurance/business/business_insurance', req.response);
                        });
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('home');
                });
            } else if (req.params.insurance_type == 4)
                return res.render('insurance/work_comp/work_comp_insurance', req.response);
            else if (req.params.insurance_type == 5) {
                var query = "SELECT * FROM states where country_id=231";
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.response.states = [];
                        return res.render('insurance/renters/renter_insurance', req.response);
                    } else {
                        req.response.states = result;
                        return res.render('insurance/renters/renter_insurance', req.response);
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('home');
                });
            } else if (req.params.insurance_type == 6)
                return res.render('home_insurance_floater', req.response);
            else if (req.params.insurance_type == 7) {
                var query = "SELECT * FROM states where country_id=231";
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.response.states = [];
                        return res.render('motorcycle_insurance', req.response);
                    } else {
                        req.response.states = result;
                        return res.render('motorcycle_insurance', req.response);
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('home');
                });
            } else if (req.params.insurance_type == 8) {
                var query = "SELECT * FROM states where country_id=231";
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.response.states = [];
                        return res.render('umbrella_insurance', req.response);
                    } else {
                        req.response.states = result;
                        return res.render('umbrella_insurance', req.response);
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('home');
                });
            } else if (req.params.insurance_type == 9)
                return res.render('group_benifits_insurance', req.response);
            else if (req.params.insurance_type == 10) {
                var query = "SELECT * FROM states where country_id=231";
                db.dbQuery(query).then(function(result) {
                    if (!valid(result)) {
                        req.response.states = [];
                        return res.render('insurance/life/life_insurance', req.response);
                    } else {
                        req.response.states = result;
                        return res.render('insurance/life/life_insurance', req.response);
                    }
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('home');
                });
            } else if (req.params.insurance_type >= 11 && req.params.insurance_type <= 15) {
                if (req.params.insurance_type == 12)
                    return res.render('insurance/travel/accident_insurance', req.response);
                else
                    return res.render('health_insurance', req.response);
            } else if (req.params.insurance_type == 16)
                return res.render('midcare_insurance', req.response);
            else
                return res.redirect('home');
        } else {
            var insType = parseInt(req.params.insurance_type);
            var body = req.body;
            switch (insType) {
                case 1:
                    var vehicleIds = [];
                    body.year.forEach(function(item, index) {
                        if (item != "") {
                            vehicleIds.push(new Promise(function(resolve, reject) {
                                if (body.year[index] != "") {
                                    var obj = {
                                        year: body.year[index],
                                        maker: body.maker[index],
                                        model: body.model[index],
                                        trim: body.trim[index],
                                        created_at: Date.now()
                                    }
                                    db.insertData('vehicles', obj).then(function(result) {
                                        resolve(result.insertId);
                                    }).catch(function(error) {
                                        reject(error);
                                    });
                                }
                            }));
                        }
                    });
                    Promise.all(vehicleIds).then((vid) => {
                        var postData = {
                            user_id: req.session.user_id,
                            zipcode: req.session.zipcode,
                            vehicle_id: vid.toString(),
                            vehicle_lease: parseInt(body.vehicle_lease),
                            vehicle_use_for: parseInt(body.vehicle_use_for),
                            estimated_mileage: parseInt(body.estimated_mileage),
                            frequency: body.frequency,
                            first_name: body.first_name,
                            last_name: body.last_name,
                            dob: body.dob,
                            address: body.phone_number,
                            unit: body.unit,
                            gender: parseInt(body.gender),
                            marital_status: parseInt(body.marital_status),
                            residence_ownership: parseInt(body.residence_ownership),
                            credit_score: parseInt(body.credit_score),
                            education: body.education,
                            currently_insured: body.currently_insured,
                            carrier: body.carrier,
                            accident: body.accident,
                            quote_receive_email: body.quote_receive_email,
                            discount_apply: (body.discount_apply != undefined) ? body.discount_apply.toString() : "",
                            hear_about_us: (body.hear_about_us != undefined) ? body.hear_about_us : "",
                            accident_by_my_fault: (body.accident_by_my_fault_input != undefined) ? parseInt(body.accident_by_my_fault_input) : 0,
                            accident_not_by_my_fault: (body.accident_not_by_my_fault_input != undefined) ? parseInt(body.accident_not_by_my_fault_input) : 0,
                            claims: (body.claims_input != undefined) ? parseInt(body.claims_input) : 0,
                            tickets_violation: (body.tickets_violation_input != undefined) ? parseInt(body.tickets_violation_input) : 0,
                            created_at: Date.now()
                        }
                        db.insertData('car_insurance', postData).then(function(ins_result) {
                            var car_insurance_id = ins_result.insertId;
                            if (body.spouse_first_name.length > 0 && body.spouse_first_name[0] != "") {
                                var spouseIds = [];
                                body.spouse_first_name.forEach(function(item1, index1) {
                                    if (item1 != "") {
                                        spouseIds.push(new Promise(function(resolve, reject) {
                                            if (body.spouse_first_name[index1] != "") {
                                                var obj1 = {
                                                    car_insurance_id: parseInt(car_insurance_id),
                                                    spouse_first_name: body.spouse_first_name[index1],
                                                    spouse_last_name: body.spouse_last_name[index1],
                                                    spouse_dob: body.spouse_dob[index1],
                                                    spouse_phone_number: body.spouse_phone_number[index1],
                                                    spouse_unit: body.spouse_unit[index1],
                                                    spouse_gender: (body.spouse_gender[index1] != "") ? parseInt(body.spouse_gender[index1]) : 0,
                                                    created_at: Date.now()
                                                }
                                                db.insertData('vehicle_spouse_details', obj1).then(function(s_result) {
                                                    if (s_result.insertId > 0) {
                                                        resolve(s_result.insertId);
                                                    }
                                                }).catch(function(error) {
                                                    reject(error);
                                                });
                                            }
                                        }));
                                    }
                                });
                                Promise.all(spouseIds).then((sid) => {
                                    var name = body.first_name + " " + body.last_name;
                                    var logo = app_config.url.node_base_url + '/public/logo.png';
                                    var icon = app_config.url.node_base_url + '/public/icon.png';
                                    var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                                    var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                                    var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                                    sendMail('insurance', templateParam, body.quote_receive_email, 'Insurance Request');
                                    req.flash('success_message', "Vehicle added successfully");
                                    return res.redirect('/thank-you');
                                });
                            } else {
                                req.flash('success_message', "Vehicle added successfully");
                                return res.redirect('/thank-you');
                            }

                        }).catch(function(error) {
                            req.flash('error_message', error.message);
                            return res.redirect('/');
                        });
                    }).catch((Error) => {
                        req.flash('error_message', Error);
                        return res.redirect('/');
                    });
                    break;

                case 2:
                    var postData = {
                        user_id: req.session.user_id,
                        zipcode: req.session.zipcode,
                        residence_type: parseInt(body.residence_type),
                        address: body.address,
                        unit: body.unit,
                        ins_zipcode: body.ins_zipcode,
                        built_year: parseInt(body.built_year),
                        foundation_type: body.foundation_type,
                        construction_type: body.construction_type,
                        square_footage: body.square_footage,
                        no_of_stories: body.no_of_stories,
                        heating_system: body.heating_system,
                        roof_material: body.roof_material,
                        installed_replaced_year: parseInt(body.installed_replaced_year),
                        replacement_cost: parseFloat(body.replacement_cost),
                        is_in_flood_zone: body.is_in_flood_zone,
                        is_fire_hydrant_available: body.is_fire_hydrant_available,
                        fire_station_proximity: body.fire_station_proximity,
                        first_name: body.first_name,
                        last_name: body.last_name,
                        dob: body.dob,
                        email: body.email,
                        home_purchase_status: parseInt(body.home_purchase_status),
                        hear_about_us: (body.hear_about_us != undefined) ? body.hear_about_us : "",
                        created_at: Date.now()
                    }
                    db.insertData('home_insurance', postData).then(function(ins_result) {
                        var name = body.first_name + " " + body.last_name;
                        var logo = app_config.url.node_base_url + '/public/logo.png';
                        var icon = app_config.url.node_base_url + '/public/icon.png';
                        var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                        var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                        var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                        sendMail('insurance', templateParam, body.email, 'Insurance Request');
                        req.flash('success_message', "Home insurance added successfully");
                        return res.redirect('/thank-you');
                    }).catch(function(error) {
                        req.flash('error_message', error.message);
                        return res.redirect('/');
                    });
                    break;

                case 3:
                    var postData = {
                        user_id: req.session.user_id,
                        zipcode: req.session.zipcode,
                        business_type: body.business_type,
                        business_classification: parseInt(body.business_classification),
                        business_name: body.business_name,
                        state_id: parseInt(body.state_id),
                        no_of_employee: parseInt(body.no_of_employee),
                        work_from: parseInt(body.work_from),
                        provide_facility: parseInt(body.provide_facility),
                        vehicle_type: parseInt(body.vehicle_type),
                        first_name: body.first_name,
                        last_name: body.last_name,
                        phone_number: body.phone_number,
                        email: body.email,
                        address_line1: body.address_line1,
                        address_line2: body.address_line2,
                        address_state_id: parseInt(body.address_state_id),
                        city: body.city,
                        address_zipcode: body.zipcode,
                        mailing_address_same: body.mailing_address_same,
                        business_other_location: body.business_other_location,
                        square_footage: parseInt(body.square_footage),
                        mailing_address_line1: (body.mailing_address_same == 'no') ? body.mailing_address_line1 : body.address_line1,
                        mailing_address_line2: (body.mailing_address_same == 'no') ? body.mailing_address_line2 : body.address_line2,
                        mailing_address_state_id: (body.mailing_address_same == 'no') ? parseInt(body.mailing_address_state_id) : parseInt(body.address_state_id),
                        mailing_city: (body.mailing_address_same == 'no') ? body.mailing_city : body.city,
                        mailing_zipcode: (body.mailing_address_same == 'no') ? body.mailing_zipcode : body.zipcode,
                        business_structure: parseInt(body.business_structure),
                        establish_date: body.establish_date,
                        business_owned_vehicle: parseInt(body.business_owned_vehicle),
                        annual_revenue: parseInt(body.annual_revenue),
                        annual_payroll: parseInt(body.annual_payroll),
                        personal_property_value: parseInt(body.personal_property_value),
                        website: body.website,
                        hear_about_us: (body.hear_about_us != undefined) ? body.hear_about_us : "",
                        created_at: Date.now()
                    }
                    db.insertData('business_insurance', postData).then(function(ins_result) {
                        var name = body.first_name + " " + body.last_name;
                        var logo = app_config.url.node_base_url + '/public/logo.png';
                        var icon = app_config.url.node_base_url + '/public/icon.png';
                        var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                        var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                        var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                        sendMail('insurance', templateParam, body.email, 'Insurance Request');
                        req.flash('success_message', "Business insurance added successfully");
                        return res.redirect('/thank-you');
                    }).catch(function(error) {
                        req.flash('error_message', error.message);
                        return res.redirect('/');
                    });
                    break;

                case 4:
                    body.business_legal_structure = body.business_legal_structure.map(Number);
                    var postData = {
                        user_id: req.session.user_id,
                        zipcode: req.session.zipcode,
                        business_name: body.business_name,
                        first_name: body.first_name,
                        last_name: body.last_name,
                        email: body.email,
                        phone_number: body.phone_number,
                        business_establish_year: parseInt(body.business_establish_year),
                        business_legal_structure: body.business_legal_structure.toString(),
                        full_time_employee: (body.full_time_employee) ? parseInt(body.full_time_employee) : 0,
                        part_time_employee: (body.part_time_employee) ? parseInt(body.part_time_employee) : 0,
                        yearly_emp_amt: (body.yearly_emp_amt) ? parseInt(body.yearly_emp_amt) : 0,
                        type_of_work: body.type_of_work,
                        worker_comp_ins: body.worker_comp_ins,
                        worker_comp_ins_year: parseInt(body.worker_comp_ins_year),
                        past_three_year_injury: (body.past_three_year_injury) ? parseInt(body.past_three_year_injury) : 0,
                        past_twelve_year_injury: (body.part_time_employee) ? parseInt(body.past_twelve_year_injury) : 0,
                        hear_about_us: (body.hear_about_us != undefined) ? body.hear_about_us : "",
                        created_at: Date.now()
                    }
                    db.insertData('work_compensation_insurance', postData).then(function(ins_result) {
                        var name = body.first_name + " " + body.last_name;
                        var logo = app_config.url.node_base_url + '/public/logo.png';
                        var icon = app_config.url.node_base_url + '/public/icon.png';
                        var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                        var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                        var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                        sendMail('insurance', templateParam, body.email, 'Insurance Request');
                        req.flash('success_message', "Work compensation insurance added successfully");
                        return res.redirect('/thank-you');
                    }).catch(function(error) {
                        req.flash('error_message', error.message);
                        return res.redirect('/');
                    });
                    break;

                case 5:
                    var postData = {
                        insurance_type: insType,
                        insurance_zipcode: req.session.zipcode,
                        user_id: req.session.user_id,
                        first_name: body.first_name,
                        last_name: body.last_name,
                        email: body.email,
                        phone_number: body.phone_number,
                        address_line_1: body.address_line1,
                        address_line_2: body.address_line2,
                        state_id: parseInt(body.state_id),
                        city: body.city,
                        zipcode: body.zipcode,
                        created_at: Date.now()
                    };
                    db.insertData('insurance_details', postData).then(function(ins_result) {
                        var insurance_id = ins_result.insertId;
                        var otherPostData = {
                            insurance_id: parseInt(insurance_id),
                            insure_address: body.insure_address,
                            personal_property_amount: body.personal_property_amount,
                            created_at: Date.now()
                        };
                        db.insertData('renter_ins_details', otherPostData).then(function(ins_result) {
                            var name = body.first_name + " " + body.last_name;
                            var logo = app_config.url.node_base_url + '/public/logo.png';
                            var icon = app_config.url.node_base_url + '/public/icon.png';
                            var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                            var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                            var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                            sendMail('insurance', templateParam, body.email, 'Insurance Request');
                            req.flash('success_message', "Insurance added successfully");
                            return res.redirect('/thank-you');
                        }).catch(function(error) {
                            req.flash('error_message', error.message);
                            return res.redirect('/');
                        });
                    }).catch(function(error) {
                        req.flash('error_message', error.message);
                        return res.redirect('/');
                    });
                    break;

                case 6:
                    var postData = {
                        insurance_type: insType,
                        user_id: req.session.user_id,
                        first_name: body.first_name,
                        last_name: body.last_name,
                        email: body.email,
                        phone_number: body.phone_number,
                        dob: body.dob,
                        gender: parseInt(body.gender),
                        created_at: Date.now()
                    };
                    db.insertData('insurance_details', postData).then(function(ins_result) {
                        var insurance_id = ins_result.insertId;
                        var otherPostData = {
                            insurance_id: parseInt(insurance_id),
                            marital_status: parseInt(body.marital_status),
                            education: body.education,
                            work_industry: body.work_industry,
                            job_title: body.job_title,
                            created_at: Date.now()
                        };
                        db.insertData('home_floater_ins_details', otherPostData).then(function(ins_result) {
                            var name = body.first_name + " " + body.last_name;
                            var logo = app_config.url.node_base_url + '/public/logo.png';
                            var icon = app_config.url.node_base_url + '/public/icon.png';
                            var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                            var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                            var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                            sendMail('insurance', templateParam, body.email, 'Insurance Request');
                            req.flash('success_message', "Insurance added successfully");
                            return res.redirect('/thank-you');
                        }).catch(function(error) {
                            req.flash('error_message', error.message);
                            return res.redirect('/');
                        });
                    }).catch(function(error) {
                        req.flash('error_message', error.message);
                        return res.redirect('/');
                    });
                    break;

                case 7:
                    var postData = {
                        insurance_type: insType,
                        user_id: req.session.user_id,
                        first_name: body.first_name,
                        last_name: body.last_name,
                        email: body.email,
                        phone_number: body.phone_number,
                        address_line_1: body.address_line1,
                        address_line_2: body.address_line2,
                        state_id: parseInt(body.state_id),
                        city: body.city,
                        zipcode: body.zipcode,
                        created_at: Date.now()
                    };
                    db.insertData('insurance_details', postData).then(function(ins_result) {
                        var insurance_id = ins_result.insertId;
                        var motorIds = [];
                        body.vehicle_type.forEach(function(item1, index1) {
                            if (item1 != "") {
                                motorIds.push(new Promise(function(resolve, reject) {
                                    if (body.vehicle_type[index1] != "") {
                                        var obj1 = {
                                            insurance_id: parseInt(insurance_id),
                                            vehicle_type: body.vehicle_type[index1],
                                            message: body.message[index1],
                                            created_at: Date.now()
                                        }
                                        db.insertData('motor_vehicle_ins_details', obj1).then(function(v_result) {
                                            if (v_result.insertId > 0) {
                                                resolve(v_result.insertId);
                                            }
                                        }).catch(function(error) {
                                            reject(error);
                                        });
                                    }
                                }));
                            }
                        });
                        Promise.all(motorIds).then((sid) => {
                            var name = body.first_name + " " + body.last_name;
                            var logo = app_config.url.node_base_url + '/public/logo.png';
                            var icon = app_config.url.node_base_url + '/public/icon.png';
                            var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                            var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                            var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                            sendMail('insurance', templateParam, body.email, 'Insurance Request');
                            req.flash('success_message', "Insurance added successfully");
                            return res.redirect('/thank-you');
                        });
                    }).catch(function(error) {
                        req.flash('error_message', error.message);
                        return res.redirect('/');
                    });
                    break;

                case 8:
                    var postData = {
                        insurance_type: insType,
                        user_id: req.session.user_id,
                        first_name: body.first_name,
                        last_name: body.last_name,
                        email: body.email,
                        phone_number: body.phone_number,
                        address_line_1: body.address_line1,
                        address_line_2: body.address_line2,
                        state_id: parseInt(body.state_id),
                        city: body.city,
                        zipcode: body.zipcode,
                        created_at: Date.now()
                    };
                    db.insertData('insurance_details', postData).then(function(ins_result) {
                        var name = body.first_name + " " + body.last_name;
                        var logo = app_config.url.node_base_url + '/public/logo.png';
                        var icon = app_config.url.node_base_url + '/public/icon.png';
                        var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                        var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                        var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                        sendMail('insurance', templateParam, body.email, 'Insurance Request');
                        req.flash('success_message', "Insurance added successfully");
                        return res.redirect('/thank-you');

                    }).catch(function(error) {
                        req.flash('error_message', error.message);
                        return res.redirect('/');
                    });
                    break;

                case 9:
                    var postData = {
                        insurance_type: insType,
                        user_id: req.session.user_id,
                        first_name: body.first_name,
                        last_name: body.last_name,
                        email: body.email,
                        phone_number: body.phone_number,
                        company_name: body.company_name,
                        created_at: Date.now()
                    };
                    db.insertData('insurance_details', postData).then(function(ins_result) {
                        var name = body.first_name + " " + body.last_name;
                        var logo = app_config.url.node_base_url + '/public/logo.png';
                        var icon = app_config.url.node_base_url + '/public/icon.png';
                        var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                        var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                        var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                        sendMail('insurance', templateParam, body.email, 'Insurance Request');

                        req.flash('success_message', "Insurance added successfully");
                        return res.redirect('/thank-you');

                    }).catch(function(error) {
                        req.flash('error_message', error.message);
                        return res.redirect('/');
                    });
                    break;

                case 10:
                    var postData = {
                        insurance_type: insType,
                        insurance_zipcode: req.session.zipcode,
                        user_id: req.session.user_id,
                        first_name: body.first_name,
                        last_name: body.last_name,
                        email: body.email,
                        phone_number: body.phone_number,
                        dob: body.dob,
                        address_line_1: body.address_line1,
                        address_line_2: body.address_line2,
                        state_id: parseInt(body.state_id),
                        city: body.city,
                        zipcode: body.zipcode,
                        created_at: Date.now()
                    };
                    db.insertData('insurance_details', postData).then(function(ins_result) {
                        var insurance_id = ins_result.insertId;
                        var otherPostData = {
                            insurance_id: parseInt(insurance_id),
                            coverage_amt: body.coverage_amt,
                            contain_nicotine: parseInt(body.contain_nicotine),
                            created_at: Date.now()
                        };
                        db.insertData('life_ins_details', otherPostData).then(function(ins_result) {
                            var name = body.first_name + " " + body.last_name;
                            var logo = app_config.url.node_base_url + '/public/logo.png';
                            var icon = app_config.url.node_base_url + '/public/icon.png';
                            var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                            var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                            var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                            sendMail('insurance', templateParam, body.email, 'Insurance Request');
                            req.flash('success_message', "Insurance added successfully");
                            return res.redirect('/thank-you');
                        }).catch(function(error) {
                            req.flash('error_message', error.message);
                            return res.redirect('/');
                        });
                    }).catch(function(error) {
                        req.flash('error_message', error.message);
                        return res.redirect('/');
                    });
                    break;

                case 16:
                    var postData = {
                        insurance_type: insType,
                        user_id: req.session.user_id,
                        first_name: body.first_name,
                        last_name: body.last_name,
                        email: body.email,
                        phone_number: body.phone_number,
                        dob: body.dob,
                        gender: parseInt(body.gender),
                        zipcode: body.zipcode,
                        created_at: Date.now()
                    };
                    db.insertData('insurance_details', postData).then(function(ins_result) {
                        var insurance_id = ins_result.insertId;
                        var otherPostData = {
                            insurance_id: parseInt(insurance_id),
                            coverage_type: parseInt(body.coverage_type),
                            tobacco_product: (body.tobacco_product === undefined) ? 0 : 1,
                            created_at: Date.now()
                        };
                        db.insertData('midcare_ins_details', otherPostData).then(function(ins_result) {
                            var name = body.first_name + " " + body.last_name;
                            var logo = app_config.url.node_base_url + '/public/logo.png';
                            var icon = app_config.url.node_base_url + '/public/icon.png';
                            var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                            var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                            var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                            sendMail('insurance', templateParam, body.email, 'Insurance Request');
                            req.flash('success_message', "Insurance added successfully");
                            return res.redirect('/thank-you');
                        }).catch(function(error) {
                            req.flash('error_message', error.message);
                            return res.redirect('/');
                        });
                    }).catch(function(error) {
                        req.flash('error_message', error.message);
                        return res.redirect('/');
                    });
                    break;

                default:
                    if (insType >= 11 && insType <= 15) {
                        var postData = {
                            insurance_type: insType,
                            insurance_zipcode: valid(req.session.zipcode) ? req.session.zipcode : 0,
                            user_id: req.session.user_id,
                            first_name: body.first_name,
                            last_name: body.last_name,
                            email: body.email,
                            phone_number: body.phone_number,
                            dob: body.dob,
                            gender: parseInt(body.gender),
                            zipcode: body.zipcode,
                            created_at: Date.now()
                        };
                        db.insertData('insurance_details', postData).then(function(ins_result) {
                            var insurance_id = parseInt(ins_result.insertId);
                            var otherPostData = {
                                insurance_id: insurance_id,
                                coverage_type: parseInt(body.coverage_type),
                                cover_type: parseInt(body.cover_type),
                                tobacco_product: (body.tobacco_product === undefined) ? 0 : 1,
                                created_at: Date.now()
                            };
                            db.insertData('health_ins_details', otherPostData).then(function(h_ins_result) {
                                var childIds = [];
                                body.child_dob.forEach(function(item1, index1) {
                                    if (item1 != "") {
                                        childIds.push(new Promise(function(resolve, reject) {
                                            if (body.child_dob[index1] != "" && body.child_gender[index1] !== undefined) {
                                                var obj1 = {
                                                    insurance_id: insurance_id,
                                                    child_dob: body.child_dob[index1],
                                                    child_gender: parseInt(body.child_gender[index1]),
                                                    child_tobacco_product: (valid(body.child_tobacco_product)) ? (body.child_tobacco_product[index1] === undefined) ? 0 : 1 : 0,
                                                    created_at: Date.now()
                                                }
                                                db.insertData('health_ins_other_details', obj1).then(function(c_result) {
                                                    if (c_result.insertId > 0) {
                                                        resolve(c_result.insertId);
                                                    }
                                                }).catch(function(error) {
                                                    reject(error);
                                                });
                                            } else {
                                                resolve(1);
                                            }
                                        }));
                                    }
                                });
                                Promise.all(childIds).then((sid) => {
                                    var name = body.first_name + " " + body.last_name;
                                    var logo = app_config.url.node_base_url + '/public/logo.png';
                                    var icon = app_config.url.node_base_url + '/public/icon.png';
                                    var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                                    var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                                    var templateParam = { logo: logo, icon: icon, icon2: icon2, icon3: icon3 };
                                    sendMail('insurance', templateParam, body.email, 'Insurance Request');
                                    req.flash('success_message', "Insurance added successfully");
                                    return res.redirect('/thank-you');
                                });
                            }).catch(function(error) {
                                req.flash('error_message', error.message);
                                return res.redirect('/');
                            });

                        }).catch(function(error) {
                            req.flash('error_message', error.message);
                            return res.redirect('/');
                        });
                    } else {
                        req.flash('error_message', "Something went wrong");
                        return res.redirect('/');
                    }
                    break;
            }
        }
        //}
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getModelList = function(req, res) {
    var query = "SELECT vehicle_model.* FROM vehicle_model JOIN vehicle_make ON vehicle_make.id = vehicle_model.make_id where vehicle_make.make ='" + req.query.maker + "' order by id DESC";
    db.dbQuery(query).then(function(result) {
        res.send(result);
    }).catch(function(error) {
        res.send([]);
    });
}

var getTrimList = function(req, res) {
    var query = "SELECT vehicle_trim.* FROM vehicle_trim JOIN vehicle_model ON vehicle_model.id = vehicle_trim.model_id where vehicle_model.model ='" + req.query.model + "' order by id DESC";
    db.dbQuery(query).then(function(result) {
        res.send(result);
    }).catch(function(error) {
        res.send([]);
    });
}

var ThankYouPage = function(req, res) {
    req.session.zipcode = '';
    return res.render('thank_you', req.response);
}
var ThankYouPageInsurance = function(req, res) {
    req.session.zipcode = '';
    return res.render('insurance_thank_you', req.response);
}

var sendMail = function(template_name, templateParam, email, subject) {
    // var sendMail = function() {
    // cconst sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // try {
    //     const msg = {
    //         to: 'krishansokhal2000@gmail.com',
    //         from: 'test@example.com',
    //         subject: 'Sending with Twilio SendGrid is Fun',
    //         text: 'and easy to do anywhere, even with Node.js',
    //         html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    //     };
    //     sgMail.send(msg);
    // } catch (error) {
    //     console.log(error.message);
    //     return error.message
    // }
    try {
        Promise.all([
            email.render(template_name, templateParam)
        ]).then((html) => {
            try {
                const msg = {
                    to: "krishansokhal2000@gmail.com",
                    from: 'test@example.com',
                    subject: subject,
                    //text: 'and easy to do anywhere, even with Node.js',
                    html: html[0],
                };
                sgMail.send(msg);
            } catch (error) {
                console.log(error.message);
                return error.message
            }
        });
    } catch (error) {
        console.log(error.message);
        return error.message
    }
}



var getHealthInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 11 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 11 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/health_isurance/inner-health-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/health_isurance/inner-health-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/health_isurance/inner-health-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/11");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getAccidentInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 12 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 12 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/accident_insurance/inner-accident-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/accident_insurance/inner-accident-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/accident_insurance/inner-accident-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/12");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}
var getDentalInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 13 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 13 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/dental_insurance/inner-dental-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/dental_insurance/inner-dental-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/dental_insurance/inner-dental-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/13");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}


var getMedicareInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 16 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 16 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/medicare_insurance/inner-medicare-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/medicare_insurance/inner-medicare-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/medicare_insurance/inner-medicare-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/16");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getMedicalInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 17 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 17 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/medical_insurance/inner-medical_malpractice-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/medical_insurance/inner-medical_malpractice-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/medical_insurance/inner-medical_malpractice-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/17");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}


var getCommercialInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 18 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 18 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/commercial_auto_insurance/inner-commercial_auto-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/commercial_auto_insurance/inner-commercial_auto-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/commercial_auto_insurance/inner-commercial_auto-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/18");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}


var getCyberInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 21 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 21 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/cyber_insurance/inner-cyber-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/cyber_insurance/inner-cyber-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/cyber_insurance/inner-cyber-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/21");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}


var getGeneralLiabilityInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 19 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 19 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/general_liability_insurance/inner-general_liability-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/general_liability_insurance/inner-general_liability-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/general_liability_insurance/inner-general_liability-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/19");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getProfessionalLiabilityIinsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 20 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 20 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/professional_liability_insurance/inner-professional_liability-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/professional_liability_insurance/inner-professional_liability-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/professional_liability_insurance/inner-professional_liability-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/20");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getSuretyBondsInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 22 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 22 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/surety_bonds_insurance/inner-surety_bonds-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/surety_bonds_insurance/inner-surety_bonds-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/surety_bonds_insurance/inner-surety_bonds-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/22");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getSmallGroupBenefitsInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 9 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 9 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/small_group_benefits_insurance/inner-small_group_benefits-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/small_group_benefits_insurance/inner-small_group_benefits-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/small_group_benefits_insurance/inner-small_group_benefits-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/9");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}


var getUmbrellaInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 8 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 8 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/umbrella_insurance/inner-umbrella-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/umbrella_insurance/inner-umbrella-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/umbrella_insurance/inner-umbrella-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/8");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var getMotorcycleInsurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            var videoQuery = "select url from videos where type = 7 AND status = 1 ORDER BY id DESC LIMIT 1";
            var blogQuery = "select id, image_1, title, type, short_description, created_at,duration from blogs where type = 7 AND status = 1 ORDER BY id DESC LIMIT 6";
            db.dbQuery(videoQuery).then(function(video_result) {
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    return res.render('insurance/motorcycle_insurance/inner-motorcycle-insurance', req.response);
                }).catch(function(error) {
                    req.response.video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = [];
                    return res.render('insurance/motorcycle_insurance/inner-motorcycle-insurance', req.response);
                });
            }).catch(function(error) {
                req.response.video = "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                return res.render('insurance/motorcycle_insurance/inner-motorcycle-insurance', req.response);
            });
        } else {
            var body = req.body;
            req.session.zipcode = body.zipcode;
            res.redirect("/add_insurance/7");
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var sendMailAWS = function(data) {
   // Load the AWS SDK for Node.js
    var AWS = require('aws-sdk');
    // Set the region 
    try {
    AWS.config.update({
        accessKeyId: "AKIA45HWDO6WRBNVXHYH",
        secretAccessKey: "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",
        region: "us-east-2"
    });
    if(data.template=="InsuranceApp"){
        var template = {
            subject:data.subject,
            name:data.name, 
            type: data.type,
            question: data.question,
            email: data.email,
            refferedBy: data.refferedby||"No",
            comment: data.comment,
            address: data.address,
            logo : data.logo,
            icon : data.icon,
            icon2 : data.icon2,
            icon3: data.icon3,
        }
    }else{
        var template = {
            subject:data.subject,
            html:data.html,
            logo : data.logo,
            icon : data.icon,
            icon2 : data.icon2,
            icon3: data.icon3,
        }
    }
    // console.log(template);
    
    // Create sendTemplatedEmail params 
    var params = {
    Destination: { /* required */
        // CcAddresses: [
        //   'EMAIL_ADDRESS',
        //   /* more CC email addresses */
        // ],
        ToAddresses: [
        data.email,
        /* more To email addresses */
        ]
    },
    Source: 'Hello@defyinsurance.com', /* required */
    Template: data.template, /* required */
    TemplateData : JSON.stringify(template), /* required */
    };
    // Create the promise and SES service object
    var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();
    // Handle promise's fulfilled/rejected states
    sendPromise.then(
    function(data) {
        console.log(data);
    }).catch(
        function(err) {
        console.error(err, err.stack);
    });
    } catch (error) {
        console.log(error);
    }
    }

var Insurance = function(req, res) {
    try {
        if (req.method == 'GET') {
            req.response.type = req.params.insurance_type;
            if(req.query.agentID && req.query.agentID != ""){
                req.response.agentID = req.query.agentID
            }else{
                req.response.agentID = "";
            }
            return res.render('insurance/insurance-form', req.response)
        } else {
            var body = req.body
            var adminMail = '';
            if(body.agentID!=""){
                var query = "select email from agents where id ="+body.agentID
                db.dbQuery(query).then(function(result) {
                    adminMail = result[0].email;
                })
            }else{
                adminMail = "hello@defyinsurance.com"
            }
            var postData = {
                first_name: body.first_name,
                question: body.question,
                last_name: body.last_name,
                email: body.email,
                phone_number: body.phone_number,
                zipcode: req.session.zipcode || "",
                city: body.city || "",
                state: body.state || "",
                referredby: body.referredby || "",
                comment: body.comment || "",
                type: body.type,
                requestedBy : body.agentID||1,
                created_at: Date.now()
            }
            db.insertData('user_insurance_details', postData).then(function(result) {
                var name = body.first_name + " " + body.last_name;
                var question = body.question;
                var comment = body.comment;
                var address = body.city + "," + body.state;
                var email = body.email;
                var referredby = body.referredby ? body.referredby : "";
                var subject = "Defy Insurance";
                var v_type = externalFunctions.getInsuranceType(body.type);
                var logo = app_config.url.node_base_url + '/public/logo.png';
                var icon = app_config.url.node_base_url + '/public/icon.png';
                var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                var html = "Thanks for connecting with Defy insurance. Our agent will connect with you soon."
                // var adminHtml = "<h3>Applied for - " + v_type + "</h3><p>Requested for -" + question + "</p><p>Name - " + name + "</p><p>Email - " + email + "</p>" + referredby + "<p>Comments / Description - " + comment + "</p><p>Address - " + address + "</p>";
                var userData = { template:"InsuranceAppUser",html: html, email: email, subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3 };
                var adminData = { template:"InsuranceApp", name: name,question:question,comment:comment,address:address,referredby:referredby,type:v_type, email: adminMail, subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3 };
                sendMailAWS(adminData);
                sendMailAWS(userData);
                req.flash('success_message', 'Your request has been registered successfully');
                return res.redirect('/insurance_videos');
            }).catch(function(error) {
                var err = JSON.stringify(error)
                req.flash('error_message', err);
                return res.redirect('/');
            });
        }
    } catch (Error) {
        var err = JSON.stringify(Error)
        req.flash('error_message', err);
        return res.redirect('/');
    }

}

var videoList = function(req,res){
    var videoQuery = "select * from videos where type = 17 AND status = 1 ORDER BY id DESC LIMIT 1";
    var otherVidesQuery = "select * from videos where not type = 17";
    db.dbQuery(videoQuery).then(function(video_result) {
        db.dbQuery(otherVidesQuery).then(function(other_video_result) {
            req.response.video_url = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
            req.response.video = video_result[0]
            req.response.other_video_list = other_video_result;
            return res.render('video-page',req.response)
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/');
        });
    }).catch(function(error) {
        req.flash('error_message', error.sqlMessage);
        return res.redirect('/');
    });
}

var Agent = function(req, res) {
    // console.log(req.query.search, 'search');
    if (req.query.searchByName != "" && req.query.search_by == "byName") {
        var query = "SELECT * FROM agents where first_name LIKE  " + "'%" + req.query.searchByName + "%' OR last_name LIKE" + "'%" + req.query.searchByName + "%'";
    } else if (req.query.search != "" && req.query.search_by == "byState") {
        var query = "SELECT * FROM agents where state = " + "'" + req.query.search + "'";
    } else {
        var query = "SELECT * FROM agents";
    }
    db.dbQuery(query).then(function(result) {
        // console.log(result)
        if (!valid(result)) {
            req.response.agents = result
            return res.render("agent-search", req.response)
        } else {
            req.response.agents = result
            return res.render("agent-search", req.response)
        }
    }).catch(function(error) {
        req.flash('error_message', error.sqlMessage);
        return res.redirect('/');
    });
}


var AgentSerch = function(req, res) {
    var id = req.params.id
    var query = "SELECT * FROM agents where id =" + id
    db.dbQuery(query).then(function(result) {
        // console.log(result)
        if (!valid(result)) {
            req.response.agents = result[0]
            return res.render("agent-page", req.response)
        } else {
            req.response.agents = result[0]
            return res.render("agent-page", req.response)
        }
    }).catch(function(error) {
        req.flash('error_message', error.sqlMessage);
        return res.redirect('/');
    });
}

var Referral = function(req, res) {
    var id = req.params.id
    var query = "SELECT * FROM agents where id =" + id
    db.dbQuery(query).then(function(result) {
        // console.log(result)
        if (!valid(result)) {
            req.flash('error_message', "Referral is not valid");
            return res.redirect('/');
        } else {
            req.response.agents = result[0]
            return res.render("agent-page", req.response)
        }
    }).catch(function(error) {
        req.flash('error_message', error.sqlMessage);
        return res.redirect('/');
    });
}

var Test = function(req, res) {
    return res.render("test", req.response)
}


router.get("/", Home);
//auto insurance
router.get("/get_auto_nsurance", getAutoInsurance);
router.post("/get_auto_nsurance", getAutoInsurance);
//home insurance
router.get("/get_home_nsurance", getHomeInsurance);
router.post("/get_home_nsurance", getHomeInsurance);
//life insurance
router.get("/get_life_nsurance", getLifeInsurance);
router.post("/get_life_nsurance", getLifeInsurance);
//renters insurancegetDentalInsurance
router.get("/get_renter_nsurance", getRentersInsurance);
router.post("/get_renter_nsurance", getRentersInsurance);
//travel insurance
router.get("/get_travel_nsurance", getTravelInsurance);
router.post("/get_travel_nsurance", getTravelInsurance);
//Business insurance
router.get("/get_business_nsurance", getBusinessInsurance);
router.post("/get_business_nsurance", getBusinessInsurance);
//work comp insurance
router.get("/get_worker_comp_nsurance", getWorkerCompInsurance);
router.post("/get_worker_comp_nsurance", getWorkerCompInsurance);

router.get("/insurance/getModelList", getModelList);
router.get("/insurance/getTrimList", getTrimList);
router.get("/insurance/:insurance_type", AddInsurance);
router.post("/insurance/:insurance_type", AddInsurance);
router.get("/thank-you", ThankYouPage);
router.get("/insurance-thank-you", ThankYouPageInsurance);
router.get("/sendMail", sendMail);

router.get("/get_health_nsurance", getHealthInsurance);
router.post("/get_health_nsurance", getHealthInsurance);

router.get("/get_accident_nsurance", getAccidentInsurance);
router.post("/get_accident_nsurance", getAccidentInsurance);
router.get("/get_dental_nsurance", getDentalInsurance);
router.post("/get_dental_nsurance", getDentalInsurance);
router.get("/get_medical_nsurance", getMedicalInsurance);
router.post("/get_medical_nsurance", getMedicalInsurance);
router.get("/get_medicare_nsurance", getMedicareInsurance);
router.post("/get_medicare_nsurance", getMedicareInsurance);

router.get("/get_commercial_nsurance", getCommercialInsurance);
router.post("/get_commercial_nsurance", getCommercialInsurance);
router.get("/get_cyber_nsurance", getCyberInsurance);
router.post("/get_cyber_nsurance", getCyberInsurance);
router.get("/get_general_liability_nsurance", getGeneralLiabilityInsurance);
router.post("/get_general_liability_nsurance", getGeneralLiabilityInsurance);
router.get("/get_professional_liability_nsurance", getProfessionalLiabilityIinsurance);
router.post("/get_professional_liability_nsurance", getProfessionalLiabilityIinsurance);
router.get("/get_small_group_benefits_nsurance", getSmallGroupBenefitsInsurance);
router.post("/get_small_group_benefits_nsurance", getSmallGroupBenefitsInsurance);
router.get("/get_surety_bonds_nsurance", getSuretyBondsInsurance);
router.post("/get_surety_bonds_nsurance", getSuretyBondsInsurance);
router.get("/get_umbrella_nsurance", getUmbrellaInsurance);
router.post("/get_umbrella_nsurance", getUmbrellaInsurance);
router.get("/get_motorcycle_nsurance", getMotorcycleInsurance);
router.post("/get_motorcycle_nsurance", getMotorcycleInsurance);
router.get("/add_insurance/:insurance_type", Insurance);
router.post("/add_insurance/:insurance_type", Insurance);
router.get("/insurance_videos", videoList);

router.get("/get_agent", Agent);
router.get("/get_agent_serch/:id", AgentSerch);
router.get("/get_referral/:id", Referral);

router.get("/test/:insurance_typent", Test);



module.exports = router;