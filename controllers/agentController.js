var express = require('express');
var router = express.Router();
var isset = require('isset');
var empty = require('is-empty');
var moment = require('moment-timezone');
var valid = require('../valid');
var db = require('../db_function');
var app_config = require('../app_config');

var externalFunctions = require('../externalFunctions');
var AgentResult = {};


router.use(function(req, res, next) {
    if (isset(req.session.AgentData) && !empty(req.session.AgentData) && req.session.AgentData != undefined) {
        externalFunctions.getAgentDetails(req).then(function(agent_result) {
            AgentResult.name = agent_result.first_name; 
            AgentResult.last_name = agent_result.last_name;
            AgentResult.email = agent_result.email;
            AgentResult.password = agent_result.password;
            AgentResult.id = agent_result.id
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



var Dashboard = function(req, res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {    
        var AgentData = req.session.AgentData
        externalFunctions.getCountForAgentDashboard(AgentData.agent_id).then(function(count_result) {
            // console.log(count_result);
            return res.render('agent/dashboard', { title: 'Dashboard', AdminResult: AgentResult, totalReferred: count_result[0].totalReferred,totalInsurance:count_result[0].totalInsurance });
        }).catch(function(error) {
            return res.render('agent/dashboard', { title: 'Dashboard', AdminResult: AgentResult, totalReferred: 0,totalInsurance : 0 });
        });
    }
}


var getReferralList = function(req, res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM agents where referredBy = "+req.session.AgentData.agent_id+" order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('agent/referral/list', { title: 'Referral', AdminResult: AgentResult, result: result, moment: moment });
            } else {
                return res.render('agent/referral/list', { title: 'Referral', AdminResult: AgentResult, result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('agent/referral/list', { title: 'Referral', AdminResult: AgentResult, result: [], moment: moment });
        });
    }
}

var addReferral = function(req, res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == 'GET') {
            return res.render('agent/referral/add', { title: 'Add Referral', AdminResult: AgentResult });
        } else {
            var body = req.body;
            var email = body.email;
            var query = "SELECT * FROM agents where email = '"+email+"'"
        db.dbQuery(query).then(function(result) {
            if(result && result.length>0){
                req.flash('error_message', "This email is already exist !");
                return res.redirect('/agent/addReferral');
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
                        referredBy : req.session.AgentData.agent_id,
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
                        var userHtml = "<p>Welcome to Defy Insurance.</p><p>We have added you as a Referral in Defy Insurance. Here we are sharing your login details to access your Referral Admin.</p><br><p><strong>Email ID - </strong>"+email+"</p><p><strong>Password - </strong>"+password+"</p><p><strong>URL - </strong>"+url+"</p>";
                        
                        var userData = { template:"WelcomeDefy", html: userHtml, email: email, subject: subject,logo:logo,icon:icon,icon2:icon2,icon3:icon3 };
                        externalFunctions.sendMailAWS(userData)
                        req.flash('success_message', "Referral added successfully");
                        return res.redirect('/agent/referralList');
                    }).catch(function(error) {
                        var err = JSON.stringify(error)
                        req.flash('error_message', err);
                        return res.redirect('/agent/addReferral');
                    });
                }).catch(function(error) {
                    req.flash('error_message', error);
                    return res.redirect('/agent/addReferral');
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
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM agents where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Referral is not valid");
                return res.redirect('/agent/referralList');
            } else {
                db.dbQuery("delete from agents where id=" + id).then(function(result) {
                    externalFunctions.deleteSingleFileFromS3(result[0].image, app_config.directoryPath.user_asset).then(function(delImgRes) {
                        req.flash('success_message', "Referral deleted successfully");
                        return res.redirect('/admin/referralList');
                    }).catch(function(error) {
                        req.flash('error_message', error);
                        return res.redirect('/agent/referralList');
                    });
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/agent/referralList');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/agent/referralList');
        });
    }
}


var editReferral = function(req, res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == "POST") {
            var id = req.body.agent_id;
            var query = "SELECT * FROM agents where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Referral is not valid");
                    return res.redirect('/agent/referralList');
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
                                license : result[0].license,
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
                                return res.redirect('/agent/referralList');
                            }).catch(function(error) {
                                req.flash('error_message', error);
                                return res.redirect('/agent/editReferral/' + body.id);
                            });
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/agent/editReferral' + body.id);
                        });
                    } else {
                        var updatePostData = {
                            first_name: body.first_name,
                            last_name: body.last_name,
                            email: body.email,
                            phone_number: body.phone_number,
                            license : result[0].license,
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
                            return res.redirect('/agent/referralList');
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/agent/editReferral/' + body.id);
                        });
                    }

                }
            }).catch(function(error) {
                req.flash('error_message', error.sqlMessage);
                return res.redirect('/agent/referralList');
            });
        } else {
            var id = req.params.id;
            var query = "SELECT * FROM agents where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Referral is not valid");
                    return res.redirect('/agent/referralList');
                } else {
                    return res.render('agent/referral/edit', { title: 'Edit Referral', AdminResult: AgentResult, result: result });
                }
            })
        }
    }
}

var getUserInsuranceList = function(req, res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        var agent_id = req.session.AgentData.agent_id;
        var query = "SELECT * FROM user_insurance_details WHERE requestedBy = "+agent_id+" order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('agent/gerenal_insurance/list', { title: 'Users', AdminResult: AgentResult, user_result: result, moment: moment });
            } else {
                return res.render('agent/gerenal_insurance/list', { title: 'Users', AdminResult: AgentResult, user_result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('agent/gerenal_insurance/list', { title: 'Users', AdminResult: AgentResult, user_result: [], moment: moment });
        });
    }
}

var deleteInsurance = function(req, res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM user_insurance_details where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Insurance is not valid");
                return res.redirect('/agent/insurance_details');
            } else {
                db.dbQuery("delete from user_insurance_details where id=" + id).then(function(result) {
                    req.flash('success_message', "insurance deleted successfully");
                    return res.redirect('/agent/insurance_details');
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/agent/insurance_details');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/agent/insurance_details');
        });
    }
}

var detailInsurance = function (req,res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM user_insurance_details where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('agent/gerenal_insurance/list', { title: 'Insurance Details', AdminResult: AgentResult, user_result: result, moment: moment });
            } else {
                return res.render('agent/gerenal_insurance/insurance_details', { title: 'Users', AdminResult: AgentResult, user_result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/agent/insurance_list');
        });
    }
    
}


var getBlogsList = function(req, res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        var agent_id = req.session.AgentData.agent_id
        var query = "SELECT * FROM blogs WHERE addedby = "+agent_id+" order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('agent/blog/list', { title: 'Blogs', AdminResult: AgentResult, result: result, moment: moment });
            } else {
                return res.render('agent/blog/list', { title: 'Blogs', AdminResult: AgentResult, result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('agent/blog/list', { title: 'Blogs', AdminResult: AgentResult, result: [], moment: moment });
        });
    }
}

var addBlog = function(req, res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == 'GET') {
            return res.render('agent/blog/add', { title: 'Add Blog', AdminResult: AgentResult });
        } else {
            var body = req.body;
            var agent_id = req.session.AgentData.agent_id;
            externalFunctions.uploadMultipleFiles(req, app_config.directoryPath.blogs).then(function(imagePathArr) {
                var postData = {
                    type: parseInt(body.blog_type),
                    title: body.title,
                    duration: body.duration,
                    short_description: body.short_description,
                    description: body.description,
                    image_1: valid(imagePathArr[0]) ? imagePathArr[0] : '',
                    image_2: valid(imagePathArr[1]) ? imagePathArr[1] : '',
                    image_3: valid(imagePathArr[2]) ? imagePathArr[2] : '',
                    image_4: valid(imagePathArr[3]) ? imagePathArr[3] : '',
                    addedby : agent_id,
                    created_at: Date.now()
                }
                db.insertData('blogs', postData).then(function(result) {
                    req.flash('success_message', "Blogs added successfully");
                    return res.redirect('/agent/blog/list');
                }).catch(function(error) {
                    var err = JSON.parse(error)
                    req.flash('error_message', err);
                    return res.redirect('/agent/blog/add');
                });
            }).catch(function(error) {
                var err = JSON.parse(error)
                req.flash('error_message', err);
                return res.redirect('/agent/blog/add');
            });
        }
    }
}

var deleteBlog = function(req, res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM blogs where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Blog is not valid");
                return res.redirect('/agent/blog/list');
            } else {
                var imagesArr = [];
                imagesArr.push(result[0].image_1);
                if (!empty(result[0].image_2))
                    imagesArr.push(result[0].image_2);
                if (!empty(result[0].image_3))
                    imagesArr.push(result[0].image_3);
                if (!empty(result[0].image_4))
                    imagesArr.push(result[0].image_4);
                db.dbQuery("delete from blogs where id=" + id).then(function(result) {
                    externalFunctions.deleteMultipleFileFromS3(imagesArr, app_config.directoryPath.blogs).then(function(delImgRes) {
                        req.flash('success_message', "Blog deleted successfully");
                        return res.redirect('/agent/blog/list');
                    }).catch(function(error) {
                        req.flash('error_message', error);
                        return res.redirect('/agent/blog/list');
                    });
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/agent/blog/list');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/agent/blog/list');
        });
    }
}

var editBlog = function(req, res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == "POST") {
            var id = req.body.id;
            var query = "SELECT * FROM blogs where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Blog is not valid");
                    return res.redirect('/agent/blog/list');
                } else {
                    var body = req.body;
                    var where = "id = " + body.id;
                    if (req.files && req.files.image && req.files.image[0].originalFilename != "" || req.files.image[1].originalFilename != "" || req.files.image[2].originalFilename != "" || req.files.image[3].originalFilename != "") {
                        externalFunctions.uploadMultipleFiles(req, app_config.directoryPath.blogs).then(function(imagePathArr) {
                            var updatePostData = {
                                type: parseInt(body.blog_type) || result[0].type,
                                title: body.title,
                                duration: body.duration,
                                short_description: body.short_description,
                                description: body.description,
                                image_1: valid(imagePathArr[0]) ? imagePathArr[0] : result[0].image_1,
                                image_2: valid(imagePathArr[1]) ? imagePathArr[1] : result[0].image_2,
                                image_3: valid(imagePathArr[2]) ? imagePathArr[2] : result[0].image_3,
                                image_4: valid(imagePathArr[3]) ? imagePathArr[3] : result[0].image_4,
                                addedby : result[0].addedby,
                                created_at: Date.now()
                            }
                            db.updateWhere('blogs', updatePostData, where).then(function(result) {
                                req.flash('success_message', "Blogs edit successfully");
                                return res.redirect('/agent/blog/list');
                            }).catch(function(error) {
                                req.flash('error_message', error);
                                return res.redirect('/agent/blog/edit/' + body.id);
                            });
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/agent/blog/edit' + body.id);
                        });
                    } else {
                        var updatePostData = {
                            type: parseInt(body.blog_type) || result[0].type,
                            title: body.title,
                            duration: body.duration,
                            short_description: body.short_description,
                            description: body.description,
                            image_1: result[0].image_1,
                            image_2: result[0].image_2,
                            image_3: result[0].image_3,
                            image_4: result[0].image_4,
                            addedby : result[0].addedby,
                            created_at: Date.now()
                        }
                        console.log(updatePostData);

                        db.updateWhere('blogs', updatePostData, where).then(function(result) {
                            req.flash('success_message', "Blogs edit successfully");
                            return res.redirect('/agent/blog/list');
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/agent/blog/edit/' + body.id);
                        });
                    }
                }
            }).catch(function(error) {
                req.flash('error_message', error.sqlMessage);
                return res.redirect('/agent/blog/list');
            });
        } else {
            var id = req.params.id;
            var query = "SELECT * FROM blogs where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Blog is not valid");
                    return res.redirect('/agent/blog/list');
                } else {
                    return res.render('agent/blog/edit', { title: 'Edit Blog', AdminResult: AgentResult, result: result });
                }
            })
        }
    }
}

var editProfile = function(req, res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == "POST") {
            var id = req.body.agent_id;
            var query = "SELECT * FROM agents where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Agent is not valid");
                    return res.redirect('/agent/dashboard');
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
                                email: result[0].email,
                                phone_number: body.phone_number,
                                license : result[0].license,
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
                                req.flash('success_message', "Profile Updated successfully");
                                return res.redirect('/agent/edit_profile/' + body.agent_id);
                            }).catch(function(error) {
                                req.flash('error_message', JSON.stringify(error));
                                console.log("error" ,JSON.stringify(error));
                                
                                return res.redirect('/agent/edit_profile/' + body.agent_id);
                            });
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/agent/edit_profile' + body.agent_id);
                        });
                    } else {
                        var updatePostData = {
                            first_name: body.first_name,
                            last_name: body.last_name,
                            email: result[0].email,
                            phone_number: body.phone_number,
                            license : result[0].license,
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
                            req.flash('success_message', "Profile updated successfully");
                            return res.redirect('/agent/edit_profile/'+ body.agent_id);
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/agent/edit_profile/' + body.agent_id);
                        });
                    }

                }
            }).catch(function(error) {
                req.flash('error_message', error.sqlMessage);
                return res.redirect('/agent/dashboard');
            });
        } else {
            var id = req.params.id;
            var query = "SELECT * FROM agents where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "agent is not valid");
                    return res.redirect('/agent/dashboard');
                } else {
                    return res.render('agent/profile', { title: 'Update Profile', AdminResult: AgentResult, result: result });
                }
            })
        }
    }
}

var changePassword = function(req,res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
        return res.redirect('/admin/logout');
    } else {
    if (req.method == "GET") {
        return res.render("agent/change-password",{ title: 'Chenge Password', AdminResult: AgentResult })
    }else{
        var body = req.body;
        if(body.old_pass!=AgentResult.password){
            req.flash('error_message', "Invalid old password");
            return res.redirect('/agent/change-password');
        }
        if(body.new_pass!=body.confirm_pass){
            req.flash('error_message', "New password and confirm password not macth!");
            return res.redirect('/agent/change-password');
        }
        var where = "id = " + AgentResult.id;
        var updatePostData = {
            password : body.confirm_pass
        }
        db.updateWhere('agents', updatePostData, where).then(function(result) {
            req.flash('success_message', "Your Pssword is changed successfully Please login here !");
            return res.redirect('/admin/login');
        }).catch(function(error) {
            req.flash('error_message', error);
            return res.redirect('/agent/change-password');
        });
    }
}
}

var updateStatus = function (req,res) {
    if (!isset(req.session.AgentData) || empty(req.session.AgentData)) {
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
            return res.redirect('/agent/insurance_details/'+ body.id);
        }).catch(function(error) {
            var err = JSON.stringify(error)
            req.flash('error_message', err);
            return res.redirect('/agent/insurance_details/'+ body.id);
        });
    }
}

router.get("/dashboard", Dashboard);

router.get("/referralList", getReferralList);
router.get("/addReferral", addReferral);
router.post("/addReferral", addReferral);
router.get("/deleteReferral/:id", deleteReferral);
router.get("/editReferral/:id", editReferral);
router.post("/editReferral/:id", editReferral);
router.get("/insurance_list", getUserInsuranceList);
router.get("/delete_nsurance/:id", deleteInsurance);
router.get("/insurance_details/:id", detailInsurance);

router.get("/blog/list", getBlogsList);
router.get("/blog/add", addBlog);
router.post("/blog/add", addBlog);
router.get("/blog/delete/:id", deleteBlog);
router.get("/blog/edit/:id", editBlog);
router.post("/blog/edit/:id", editBlog);
router.get("/edit_profile/:id", editProfile);
router.post("/edit_profile/:id", editProfile);
router.get("/change-password", changePassword);
router.post("/change-password", changePassword);
router.post("/updateStatus", updateStatus);

module.exports = router;