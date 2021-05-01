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
var random = require('crypto-random-string');
var db = require('../db_function');
var externalFunctions = require('../externalFunctions');
var app_config = require('../app_config');
const AWS = require("aws-sdk");
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

var InsuranceMoreProduct = function(req, res) {
    try {
        return res.render('ins_more_products', req.response);
    } catch (Error) {
        console.log(Error.message);
    }
};

var defyAbout = function(req, res) {
    try {
        var videoQuery = "select url from videos where type = 19 ORDER BY id DESC LIMIT 1";
        var blogQuery = "select id, image_1, title, type,short_description, created_at from blogs where status = 1 ORDER BY id DESC LIMIT 3";
        var teamQuery = "select * from team_members where status = 1 ORDER BY id ASC";
        db.dbQuery(videoQuery).then(function(video_result) {
            externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                db.dbQuery(teamQuery).then(function(team_result) {
                    req.response.about_video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    req.response.teamRes = (team_result.length > 0) ? team_result : [];
                    return res.render('about-defy', req.response);
                }).catch(function(error) {
                    req.response.about_video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    req.response.teamRes = [];
                    return res.render('about-defy', req.response);
                });
            }).catch(function(error) {
                req.response.about_video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                req.response.teamRes = [];
                return res.render('about-defy', req.response);
            });
        }).catch(function(error) {
            req.response.about_video = "https://www.youtube.com/embed/9xwazD5SyVg";
            req.response.blogRes = [];
            req.response.teamRes = [];
            return res.render('about-defy', req.response);
        });
    } catch (Error) {
        console.log(Error.message);
    }
};

var contactUs = function(req, res) {
    try {
        if (req.method == 'GET') {
            return res.render('contact', req.response);
        } else {
            var body = req.body;
            var postData = {
                user_id: req.session.user_id || "",
                product_of_interest: body.product_of_interest || "",
                first_name: body.first_name || "",
                last_name: body.last_name || "",
                phone_number: body.phone_number || "",
                time_preference: body.time_preference || "",
                email: body.email || "",
                message: body.message || "",
                question : body.question || "",
                city : body.city || "",
                state : body.state || "",
                created_at: Date.now()
            }
            db.insertData('contact_us', postData).then(function(result) {
                if(valid(body.question)){
                var name = body.first_name + " " + body.last_name;
                var question = body.question;
                var comment = body.message;
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
                var adminData = { template:"InsuranceApp", name: name,question:question,comment:comment,address:address,referredby:referredby,type:v_type, email: "hello@defyinsurance.com", subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3 };
                sendMailAWS(adminData);
                sendMailAWS(userData);
                    return res.redirect('/insurance_videos');
                }else{
                req.flash('success_message', "Message send successfully");
                return res.redirect('/contact');
                }
            }).catch(function(error) {
                req.flash('error_message', error.message);
                return res.redirect('/contact');
            });
        }
    } catch (Error) {
        console.log(Error.message);
    }
};
var referUsers = function(req, res) {
    try {
        if (req.method == 'GET') {
            return res.render('referal', req.response);
        } else {
            var body = req.body;
            var referToIds = [];
            var postData = {
                user_id: req.session.user_id,
                first_name: body.sender_first_name,
                last_name: body.sender_last_name,
                email: body.sender_email,
                phone_number: body.sender_phone_no,
                referal_code: random({ length: 14 }),
                created_at: Date.now()
            }
            db.insertData('refer_by_details', postData).then(function(result) {
                body.referal_first_name.forEach(function(item, index) {
                    if (item != "") {
                        referToIds.push(new Promise(function(resolve, reject) {
                            if (body.referal_first_name[index] != "") {
                                var obj = {
                                    refer_user_id: result.insertId,
                                    first_name: body.referal_first_name[index],
                                    last_name: body.referal_last_name[index],
                                    email: body.referal_email[index],
                                    phone_number: body.referal_phone_no[index],
                                    created_at: Date.now()
                                }
                                db.insertData('refer_to_details', obj).then(function(result) {
                                    resolve(result.insertId);
                                }).catch(function(error) {
                                    reject(error);
                                });
                            }
                        }));
                    }
                });
                Promise.all(referToIds).then((refer_id) => {
                    req.flash('success_message', "Referal send successfully");
                    return res.redirect('/referal');
                }).catch((Error) => {
                    req.flash('error_message', Error);
                    return res.redirect('/referal');
                });
            }).catch(function(error) {
                req.flash('error_message', error.message);
                return res.redirect('/referal');
            });
        }
    } catch (Error) {
        console.log(Error.message);
    }
};

var blogList = function(req, res) {
    try {
        var blogRes = [];
        var blogQuery = "select id, image_1, title, type, short_description,duration, created_at from blogs where status = 1 ORDER BY id DESC";
        externalFunctions.getBlogData(blogQuery).then(function(result) {
            if (result.length > 0) {
                req.response.blogRes = result;
                return res.render('blog', req.response);
            } else {
                req.response.blogRes = blogRes;
                return res.render('blog', req.response);
            }
        }).catch(function(error) {
            req.response.blogRes = blogRes;
            return res.render('blog', req.response);
        });
    } catch (Error) {
        console.log(Error.message);
    }
};

var blogDetails = function(req, res) {
    try {
        var id = req.params.id;
        var blogQuery = "select * from blogs where status = 1 AND id = " + id;
        externalFunctions.getBlogData(blogQuery).then(function(result) {
            if (result.length > 0) {
                blogRes = result[0];
                req.response.blogRes = blogRes;
                var type = result[0].type;
                var blogQuery = "select id, image_1, title, type, short_description,duration,created_at from blogs where type = " + type + " AND status = 1 And Not id = " + id + " ORDER BY id DESC LIMIT 3";
                externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                    req.response.blogList = (blog_result.length > 0) ? blog_result : [];
                    return res.render('blog_details', req.response);
                }).catch(function(error) {
                    req.response.blogList = [];
                    return res.render('blog_details', req.response);
                });

            } else {
                return res.redirect('/blogs');
            }
        }).catch(function(error) {
            return res.redirect('/blogs');
        });
    } catch (Error) {
        console.log(Error.message);
    }
};

var carrierInfo = function(req, res) {
    try {
        if (req.query.search && req.query.search != "") {
            var query = "SELECT * FROM carrier where name LIKE  " + "'%" + req.query.search + "%'";
        }else {
            var query = "SELECT * FROM carrier";
        }
        db.dbQuery(query).then(function(result) {
            // console.log(result)
            if (!valid(result)) {
                req.response.carrierInfo = result
                req.response.search = req.query.search
                return res.render("all_carrier_info", req.response)
            } else {
                req.response.carrierInfo = result
                req.response.search = req.query.search
                return res.render("all_carrier_info", req.response)
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/');
        });
    } catch (Error) {
        console.log(Error.message);
    }
};
var getCarrierSearch = function(req,res){
    var search = req.body.search;
    var query = "SELECT * FROM carrier where name LIKE  " + "'%" + search + "%'";
    db.dbQuery(query).then(function(result) {
        if (!valid(result)) {
            return res.json(result)
        } else {
            return res.json(result)
        }
    }).catch(function(error) {
        return res.json(error)
    });
}

var videosList = function(req, res) {
    try {
        var videoRes = [];
        where = "status = 1";
        db.getWhere('videos', where).then(function(result) {
            if (result.length > 0) {
                videoRes = result;
            }
            req.response.videoRes = videoRes;
            return res.render('videos_list', req.response);
        }).catch(function(error) {
            req.response.videoRes = videoRes;
            return res.render('videos_list', req.response);
        });
    } catch (Error) {
        console.log(Error.message);
    }
};

var teamMemberDetails = function(req, res) {
    try {
        var id = req.params.id;
        where = "status = 1 AND id = " + id;
        db.getWhere('team_members', where).then(function(result) {
            if (result.length > 0) {
                memberRes = result[0];
                req.response.memberRes = memberRes;
                return res.render('team_member_detail', req.response);
            } else {
                return res.redirect('/about-defy');
            }
        }).catch(function(error) {
            return res.redirect('/about-defy');
        });
    } catch (Error) {
        console.log(Error.message);
    }
};

var saveEBookDetails = function(req, res) {
    var body = req.body;
    var postData = {
        user_id: req.session.user_id,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        created_at: Date.now()
    }
    db.insertData('e_book', postData).then(function(result) {
        req.flash('success_message', "E-book data saved successfully");
        return res.redirect('/');
    }).catch(function(error) {
        req.flash('error_message', error.message);
        return res.redirect('/');
    });
}

var getResourcesPages = function(req, res) {
    try {
        var type = parseInt(req.params.type);
        if (type == 1)
            return res.render('resources/resource1', req.response);
        else if (type == 2)
            return res.render('resources/resource2', req.response);
        else if (type == 3)
            return res.render('resources/resource3', req.response);
        else if (type == 4)
            return res.render('resources/resource4', req.response);
        else if (type == 5)
            return res.render('resources/resource5', req.response);
        else
            return res.redirect('/');
    } catch (Error) {
        return res.redirect('/');
    }
};



var careers = function(req, res) {
    if (req.method == 'GET') {
    var query = "SELECT * FROM careers order by id DESC"
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Careers is not valid");
                return res.render('inner-careers', req.response);
            } else {
                req.response.careers = result
                return res.render('inner-careers', req.response);
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/home');
        });
    }else{
        var body = req.body
        externalFunctions.uploadSingleImage(req, app_config.directoryPath.careersResume).then(function(image_url) {
            var postData = {
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email,
                phone_number: body.phone_number,
                position : body.position,
                state : body.state,
                experience : body.experience,
                image : image_url,
                created_at: Date.now()
            }
            db.insertData('job_requests', postData).then(function(result) {
                // getInsuranceType(body.type)
                var name = body.first_name + " " + body.last_name;
                var position = body.position;
                var email = body.email;
                var phone_number = body.phone_number;
                var experience = body.experience;
                var logo = app_config.url.node_base_url + '/public/logo.png';
                var icon = app_config.url.node_base_url + '/public/icon.png';
                var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                var subject = "Career Applied Request";
                var state = body.state ? "<p>State - "+body.state+"</p>":""
                var userHtml = "Thanks for connecting with Defy insurance. Our agent will connect with you soon."
                var adminHtml = "<h3>Applied for - " + position + "</h3><p>Name - " + name + "</p><p>Email - " + email + "</p><p>Experience - " + experience + "</p><p>Phone Number - " + phone_number + "</p>"+state+"";
                var adminData = {template:"CareerAppliedRequest", html: adminHtml, email: "Hello@defyinsurance.com", subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3 };
                var userData = {template:"CareerAppliedRequest", html: userHtml, email: email, subject: subject ,logo:logo,icon:icon,icon2:icon2,icon3:icon3};
                externalFunctions.sendMailAWS(adminData);
                externalFunctions.sendMailAWS(userData);
                req.flash('success_message', 'Your request has been registered successfully');
                return res.redirect('/thank-you');
            }).catch(function(error) {
                req.flash('error_message', error);
                return res.redirect('/admin/agent/add');
            });
        })
    }
}



var claimsCenter = function(req, res) {
    if (req.method == 'GET') {
    return res.render('claims-center', req.response);
    }else{
        var body = req.body
        externalFunctions.uploadSingleImage(req, app_config.directoryPath.blogs).then(function(image_url) {
            var postData = {
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email,
                phone_number: body.phone_number,
                policy_number : body.policy_number,
                date : body.date,
                com_name : body.com_name,
                description : body.description,
                image : image_url,
                type: body.type,
                created_at: Date.now()
            }
            db.insertData('claims', postData).then(function(result) {
                // getInsuranceType(body.type)
                var name = body.first_name + " " + body.last_name;
                var policy_number = body.policy_number;
                var email = body.email;
                var phone_number = body.phone_number;
                var date = body.data;
                var com_name = body.com_name;
                var description = body.description
                var subject = "Reported Claim";
                var type = body.type;
                var logo = app_config.url.node_base_url + '/public/logo.png';
                var icon = app_config.url.node_base_url + '/public/icon.png';
                var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                var userHtml = "Thanks for connecting with Defy insurance. Our agent will connect with you soon."
                var adminHtml = "<img src"+image_url+" width='50' height='50'><h3>Applied for - " + type + "</h3><p>Policy Number -" + policy_number + "</p><p>Name - " + name + "</p><p>Email - " + email + "</p><p>Phone Number - " + phone_number + "</p><p>Carrier (Insurance company name)"+com_name+"</p><p>Incident description"+description+"</p><p>Date of Accident"+date+"</p>";
                var adminData = { template: "ReportedClaim", html: adminHtml, email: "Concierge@defyinsurance.com", subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3};
                var userData = { template: "ReportedClaim" ,html: userHtml, email: email, subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon };
                externalFunctions.sendMailAWS(adminData);
                externalFunctions.sendMailAWS(userData);
                req.flash('success_message', 'Your request has been registered successfully');
                return res.redirect('/thank-you');
            }).catch(function(error) {
                req.flash('error_message', error);
                return res.redirect('/');
            });
        }).catch(function(error) {
            var err = JSON.stringify(error)
            req.flash('error_message', err);
            return res.redirect('/');
        });
    }
}
var affiliatePartners = function(req, res) {
    try {
        if (req.method == 'GET') {
            return res.render('inner-affiliate-partners', req.response);
        } else {
            var body = req.body
            var postData = {
                first_name: body.first_name,
                question: body.question_work,
                last_name: body.last_name,
                email: body.email,
                web_link: body.web_link,
                type: body.type,
                created_at: Date.now()
            }
            db.insertData('partnership_requests', postData).then(function(result) {
                // getInsuranceType(body.type)
                var name = body.first_name + " " + body.last_name;
                var question = body.question_work;
                var email = body.email;
                var web_link = body.web_link;
                var subject = "Partner With Defy Insurance";
                var v_type = body.type;
                var logo = app_config.url.node_base_url + '/public/logo.png';
                var icon = app_config.url.node_base_url + '/public/icon.png';
                var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                var userHtml = "Thanks for connecting with Defy insurance. Our agent will connect with you soon."
                var adminHtml = "<h3>Applied for - " + v_type + "</h3><p>Comment -" + question + "</p><p>Name - " + name + "</p><p>Email - " + email + "</p><p>Website Link - " + web_link + "</p>";
                var adminData = {template:"Partners", html: adminHtml, email: "hello@defyinsurnace.com", subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3};
                var userData = {template:"Partners", html: userHtml, email: email, subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3};
                externalFunctions.sendMailAWS(adminData);
                externalFunctions.sendMailAWS(userData);
                req.flash('success_message', 'Your request has been registered successfully');
                return res.redirect('/thank-you');
            }).catch(function(error) {
                var err = JSON.stringify(error)
                req.flash('error_message', err);
                return res.redirect('/');
            });
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }

}

var clientsLogin = function(req, res) {
    return res.render('clients-login', req.response);
}

var calculators = function(req, res) {
    return res.render('calculators', req.response);
}

var policyReviewRequest = function(req, res) {
    try {
        if (req.method == 'GET') {
            return res.render('policy-review-request', req.response);
        } else {
            var body = req.body
            var postData = {
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email,
                phone_number: body.phone_number,
                type: body.type,
                notes : body.notes,
                created_at: Date.now()
            }
            db.insertData('policy_review_request', postData).then(function(result) {
                // getInsuranceType(body.type)
                var name = body.first_name + " " + body.last_name;
                var notes = body.notes;
                var email = body.email;
                var phone_number = body.phone_number;
                var subject = "Policy With Defy Insurance";
                var v_type = externalFunctions.getInsuranceType(body.type);
                var logo = app_config.url.node_base_url + '/public/logo.png';
                var icon = app_config.url.node_base_url + '/public/icon.png';
                var icon2 = app_config.url.node_base_url + '/public/icon2.png';
                var icon3 = app_config.url.node_base_url + '/public/icon3.png';
                var userHtml = "Thanks for connecting with Defy insurance. Our agent will connect with you soon."
                var adminHtml = "<h3>Applied for - " + v_type + "</h3><p>Nots -" + notes + "</p><p>Name - " + name + "</p><p>Email - " + email + "</p><p>Contact No. - " + phone_number + "</p>";
                var adminData = { template:"PolicyInsurance", html: adminHtml, email: "Hello@defyinsurance.com", subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3};
                var userData = { template:"PolicyInsurance", html: userHtml, email: email, subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3};
                externalFunctions.sendMailAWS(adminData);
                externalFunctions.sendMailAWS(userData);
                req.flash('success_message', 'Your request has been registered successfully');
                return res.redirect('/thank-you');
            }).catch(function(error) {
                var err = JSON.stringify(error)
                req.flash('error_message', err);
                return res.redirect('/');
            });
        }
    } catch (Error) {
        req.flash('error_message', Error.message);
        return res.redirect('/');
    }
}

var whyDefy = function(req, res) {
    try {
        var videoQuery = "select url from videos where type = 20 ORDER BY id DESC LIMIT 1";
        var blogQuery = "select id, image_1, title, type,short_description, created_at from blogs where status = 1 ORDER BY id DESC LIMIT 3";
        var teamQuery = "select * from team_members where status = 1 ORDER BY id ASC";
        db.dbQuery(videoQuery).then(function(video_result) {
            externalFunctions.getBlogData(blogQuery).then(function(blog_result) {
                db.dbQuery(teamQuery).then(function(team_result) {
                    console.log(video_result.length);
                    req.response.about_video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    req.response.teamRes = (team_result.length > 0) ? team_result : [];
                    return res.render('why-defy', req.response);
                }).catch(function(error) {
                    req.response.about_video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                    req.response.blogRes = (blog_result.length > 0) ? blog_result : [];
                    req.response.teamRes = [];
                    return res.render('why-defy', req.response);
                });
            }).catch(function(error) {
                req.response.about_video = (video_result.length > 0) ? video_result[0].url : "https://www.youtube.com/embed/9xwazD5SyVg";
                req.response.blogRes = [];
                req.response.teamRes = [];
                return res.render('why-defy', req.response);
            });
        }).catch(function(error) {
            req.response.about_video = "https://www.youtube.com/embed/9xwazD5SyVg";
            req.response.blogRes = [];
            req.response.teamRes = [];
            return res.render('why-defy', req.response);
        });
    } catch (Error) {
        console.log(Error.message);
    }
};

var teamDefy = function(req, res) {
    var query = "SELECT * FROM team_members";
    db.dbQuery(query).then(function(result) {
        if (!valid(result)) {
            req.response.teamMembers = result
            return res.render('team-defy', req.response);
        } else {
            req.response.teamMembers = result
            return res.render('team-defy', req.response);
        }
    }).catch(function(error) {
        req.flash('error_message', error.sqlMessage);
        return res.render('/home', req.response);
    });

}

var detailsDefy = function(req,res){
    var id = req.params.id
    var query = "SELECT * FROM team_members WHERE id ="+id;
    db.dbQuery(query).then(function(result) {
        if (!valid(result)) {
            req.response.memberRes = result[0]
            return res.render('team_member_detail', req.response);
        } else {
            req.response.memberRes = result[0]
            return res.render('team_member_detail', req.response);
        }
    }).catch(function(error) {
        req.flash('error_message', error.sqlMessage);
        return res.render('/home', req.response);
    });
}

var termsOfUse = function(req, res) {
    return res.render('terms-of-use', req.response);
}

var privacyPolicy = function(req, res) {
    return res.render('privacy-policy', req.response);
}
var copyRight = function(req, res) {
    return res.render('copy-right', req.response);
}
var AutoInsurance = function(req,res){
    return res.render('insurance/auto/car_insurance',req.response)
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
router.get("/insurance_more_product", InsuranceMoreProduct);
router.get("/about-defy", defyAbout);
router.get("/contact", contactUs);
router.post("/contact", contactUs);
router.get("/referal", referUsers);
router.post("/referal", referUsers);
router.get("/blogs", blogList);
router.get("/blog-details/:id", blogDetails);
router.get("/carrier-info", carrierInfo);
router.get("/videos", videosList);
router.get("/team-member/:id", teamMemberDetails);
router.post("/save-ebook", saveEBookDetails);
router.get("/resource/:type", getResourcesPages);
router.get("/careers", careers);
router.post("/careers", careers);
router.get("/claims-center", claimsCenter);
router.post("/claims-center", claimsCenter);
router.get("/affiliate-partners", affiliatePartners);
router.post("/affiliate-partners", affiliatePartners);
router.get("/clients-login", clientsLogin);
router.get("/calculators", calculators);
router.get("/policy-review-request", policyReviewRequest);
router.post("/policy-review-request", policyReviewRequest);
router.get("/why-defy", whyDefy);
router.get("/team-defy", teamDefy);
router.get("/team-details-defy/:id", detailsDefy);
router.get("/terms-of-use", termsOfUse);
router.get("/privacy-policy", privacyPolicy);
router.get("/copy-right", copyRight);

router.get("/auto-insurance", AutoInsurance);
router.post("/getCarrierSearch", getCarrierSearch);
module.exports = router;