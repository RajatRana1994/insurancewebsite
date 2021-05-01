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

var getBlogsList = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM blogs order by id DESC";
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                return res.render('admin/blog/list', { title: 'Blogs', AdminResult: AdminResult, result: result, moment: moment });
            } else {
                return res.render('admin/blog/list', { title: 'Blogs', AdminResult: AdminResult, result: result, moment: moment });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/blog/list', { title: 'Blogs', AdminResult: AdminResult, result: [], moment: moment });
        });
    }
}

var addBlog = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == 'GET') {
            return res.render('admin/blog/add', { title: 'Add Blog', AdminResult: AdminResult });
        } else {
            var body = req.body;
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
                    addedby : 1,
                    created_at: Date.now()
                }
                db.insertData('blogs', postData).then(function(result) {
                    req.flash('success_message', "Blogs added successfully");
                    return res.redirect('/admin/blog/list');
                }).catch(function(error) {
                    console.log(error)
                    req.flash('error_message', error);
                    return res.redirect('/admin/blog/add');
                });
            }).catch(function(error) {
                console.log(error)
                req.flash('error_message', error);
                return res.redirect('/admin/blog/add');
            });
        }
    }
}

var deleteBlog = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM blogs where id = " + id;
        db.dbQuery(query).then(function(result) {
            if (!valid(result)) {
                req.flash('error_message', "Blog is not valid");
                return res.redirect('/admin/blog/list');
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
                        return res.redirect('/admin/blog/list');
                    }).catch(function(error) {
                        req.flash('error_message', error);
                        return res.redirect('/admin/blog/list');
                    });
                }).catch(function(error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/blog/list');
                });
            }
        }).catch(function(error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/blog/list');
        });
    }
}

var editBlog = function(req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == "POST") {
            var id = req.body.id;
            var query = "SELECT * FROM blogs where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Blog is not valid");
                    return res.redirect('/admin/blog/list');
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
                                return res.redirect('/admin/blog/list');
                            }).catch(function(error) {
                                req.flash('error_message', error);
                                return res.redirect('/admin/blog/edit/' + body.id);
                            });
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/blog/edit' + body.id);
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
                            return res.redirect('/admin/blog/list');
                        }).catch(function(error) {
                            req.flash('error_message', error);
                            return res.redirect('/admin/blog/edit/' + body.id);
                        });
                    }
                }
            }).catch(function(error) {
                req.flash('error_message', error.sqlMessage);
                return res.redirect('/admin/blog/list');
            });
        } else {
            var id = req.params.id;
            var query = "SELECT * FROM blogs where id = " + id;
            db.dbQuery(query).then(function(result) {
                if (!valid(result)) {
                    req.flash('error_message', "Blog is not valid");
                    return res.redirect('/admin/blog/list');
                } else {
                    return res.render('admin/blog/edit', { title: 'Edit Blog', AdminResult: AdminResult, result: result });
                }
            })
        }
    }
}


router.get("/list", getBlogsList);
router.get("/add", addBlog);
router.post("/add", addBlog);
router.get("/delete/:id", deleteBlog);
router.get("/edit/:id", editBlog);
router.post("/edit/:id", editBlog);


module.exports = router;