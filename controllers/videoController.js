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

router.use(function (req, res, next) {
    if (isset(req.session.AdminData) && !empty(req.session.AdminData) && req.session.AdminData != undefined) {
        externalFunctions.getAdminDetails(req).then(function (admin_result) {
            AdminResult.name = admin_result.name;
            AdminResult.email = admin_result.email;
            AdminResult.password = admin_result.password;
            var now = new Date;
            var utc_timestamp = now.valueOf();
            req.body.created_at = utc_timestamp;
            sqlDateTime = moment().format("YYYY-MM-DD");
            next();
        }).catch(function (error) {
            req.flash('error_message', error);
            return res.redirect('/admin/login');
        });
    } else {
        next();
    }
});

var getVideosList = function (req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var query = "SELECT * FROM videos order by id DESC";
        db.dbQuery(query).then(function (result) {
            if (!valid(result)) {
                return res.render('admin/video/list', {title: 'Videos', AdminResult: AdminResult, result: result, moment: moment});
            } else {
                return res.render('admin/video/list', {title: 'Videos', AdminResult: AdminResult, result: result, moment: moment});
            }
        }).catch(function (error) {
            req.flash('error_message', error.sqlMessage);
            return res.render('admin/video/list', {title: 'Videos', AdminResult: AdminResult, result: [], moment: moment});
        });
    }
}

var addVideo = function (req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        if (req.method == 'GET') {
            return res.render('admin/video/add', {title: 'Add Video', AdminResult: AdminResult});
        } else {
            var body = req.body;
            externalFunctions.uploadVideo(req, app_config.directoryPath.videos).then(function (video_url) {
                externalFunctions.uploadThumbnailToS3(video_url, app_config.directoryPath.videos).then(function (thumbnail) {
                    var postData = {
                        type: parseInt(body.video_type),
                        title: body.title,
                        description: body.description,
                        url: video_url,
                        thumbnail: thumbnail,
                        created_at: Date.now()
                    }
                    db.insertData('videos', postData).then(function (result) {
                        req.flash('success_message', "Video added successfully");
                        return res.redirect('/admin/video/list');
                    }).catch(function (error) {
                        req.flash('error_message', error);
                        return res.redirect('/admin/video/add');
                    });
                }).catch(function (error) {
                    req.flash('error_message', error);
                    return res.redirect('/admin/video/add');
                });
            }).catch(function (error) {
                req.flash('error_message', error);
                return res.redirect('/admin/video/add');
            });
        }
    }
}

var deleteVideo = function (req, res) {
    if (!isset(req.session.AdminData) || empty(req.session.AdminData)) {
        return res.redirect('/admin/logout');
    } else {
        var id = req.params.id;
        var query = "SELECT * FROM videos where id = " + id;
        db.dbQuery(query).then(function (result) {
            if (!valid(result)) {
                req.flash('error_message', "Video is not valid");
                return res.redirect('/admin/video/list');
            } else {
                var imagesArr = [];
                imagesArr.push(result[0].url);
                imagesArr.push(result[0].thumbnail);
                db.dbQuery("delete from videos where id=" + id).then(function (result) {
                    externalFunctions.deleteMultipleFileFromS3(imagesArr, app_config.directoryPath.videos).then(function (delImgRes) {
                        req.flash('success_message', "Video deleted successfully");
                        return res.redirect('/admin/video/list');
                    }).catch(function (error) {
                        req.flash('error_message', error);
                        return res.redirect('/admin/video/list');
                    });
                }).catch(function (error) {
                    req.flash('error_message', error.sqlMessage);
                    return res.redirect('/admin/video/list');
                });
            }
        }).catch(function (error) {
            req.flash('error_message', error.sqlMessage);
            return res.redirect('/admin/video/list');
        });
    }
}


router.get("/list", getVideosList);
router.get("/add", addVideo);
router.post("/add", addVideo);
router.get("/delete/:id", deleteVideo);

module.exports = router;