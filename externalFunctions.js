var url = require('url');
var fs = require('fs');
var valid = require('./valid');
var path = require('path');
var Response = require('./jsonResponses');
var validator = require('validator');
var rand = require('crypto-random-string');
var db = require('./db_function');
const crypto = require('crypto');
const algorithm = 'aes-192-cbc';
const password = '@#@@@INSURANCE#@@@@APP_+%$#%';
const key = crypto.scryptSync(password, '#@!#INSURANCE#@', 24);
const iv = Buffer.alloc(16, 0);

var bucket_cred = require('./bucket_cred');
var AWS = require('aws-sdk');
var ffmpeg = require('fluent-ffmpeg');
var command = new ffmpeg();


module.exports.uniqueEmail = function(req) {
    return new Promise((resolve, reject) => {
        var where = "email = '" + req.body.email + "'";
        db.getWhere('app_users', where).then(function(user_result) {
            if (valid(user_result)) {
                reject(Response.invalid_error("Email already exists"));
            } else {
                resolve(true);
            }
        });
    });
}

module.exports.uniquePhoneNumber = function(req) {
    return new Promise((resolve, reject) => {
        var where = "phone_number = '" + req.body.phone_number + "' AND country_code = '" + req.body.country_code + "'";
        db.getWhere('app_users', where).then(function(user_result) {
            if (valid(user_result)) {
                reject(Response.invalid_error("Phone number already exists"));
            } else {
                resolve(true);
            }
        });
    });
}

module.exports.getUserDetails = function(req) {
    return new Promise((resolve, reject) => {
        var where = "id = " + req.body.user_id;
        db.getWhere('app_users', where).then(function(user_result) {
            if (!valid(user_result)) {
                reject(Response.invalid_error("User id is not valid"));
            } else {
                var q = url.parse(req.url, true);
                if (q.pathname == '/signup' || q.pathname == '/updatePhoneVerifiedStatus' || q.pathname == '/login' || q.pathname == '/logout') {
                    resolve(user_result[0]);
                } else {
                    if (valid(req.headers.authorization) && req.headers.authorization != undefined) {
                        if (req.headers.authorization == user_result[0].authentication_token) {
                            if (user_result[0].status != 1)
                                reject(Response.unknown_error("Account not activated"));
                            else if (user_result[0].phone_is_verified != 1)
                                reject(Response.unknown_error("Phone number not verified"));
                            else if (user_result[0].deleted_status == 1)
                                reject(Response.unknown_error("Your account deleted, please contact to admin"));
                            else
                                resolve(user_result[0]);
                        } else
                            reject(Response.authorization_failed("Authorization failed"));
                    } else {
                        reject(Response.authorization_failed("Authorization failed"));
                    }
                }
            }
        });
    });
}

module.exports.getAdminDetails = function(req) {
    return new Promise((resolve, reject) => {
        var where = "id = " + req.session.AdminData.admin_id;
        db.getWhere('admin_details', where).then(function(admin_result) {
            if (!valid(admin_result)) {
                reject("Admin details is not valid");
            } else {
                resolve(admin_result[0]);
            }
        });
    });
}

module.exports.getAgentDetails = function(req) {
    return new Promise((resolve, reject) => {
        var where = "id = " + req.session.AgentData.agent_id;
        db.getWhere('agents', where).then(function(admin_result) {
            if (!valid(admin_result)) {
                reject("Admin details is not valid");
            } else {
                resolve(admin_result[0]);
            }
        });
    });
}
module.exports.getReferralDetails = function(req) {
    return new Promise((resolve, reject) => {
        var where = "id = " + req.session.ReferralData.agent_id;
        db.getWhere('agents', where).then(function(admin_result) {
            if (!valid(admin_result)) {
                reject("Admin details is not valid");
            } else {
                resolve(admin_result[0]);
            }
        });
    });
}

module.exports.getCountForDashboard = function(sqlDateTime) {
    return new Promise((resolve, reject) => {
        db.getCountOfRecords("select * from app_users where signup_date = '" + sqlDateTime + "'").then(function(todayTotalUsers) {
            db.getCountOfRecords("select * from app_users").then(function(totalUsers) {
                db.getCountOfRecords("select * from car_insurance").then(function(totalCarInsurance) {
                    db.getCountOfRecords("select * from home_insurance").then(function(totalHomeInsurance) {
                        var ret_arr = [{ todayTotalUsers: todayTotalUsers, totalUsers: totalUsers, totalCarInsurance: totalCarInsurance, totalHomeInsurance: totalHomeInsurance }];
                        resolve(ret_arr);
                    });
                });
            });
        });
    });
}

module.exports.getCountForAgentDashboard = function(agentid) {
    return new Promise((resolve, reject) => {
        db.getCountOfRecords("select * from referral where referredBy = '" + agentid + "'").then(function(totalReferred) {
            db.getCountOfRecords("select * from user_insurance_details where requestedBy = '" + agentid + "'").then(function(totalInsurance) {
            var ret_arr = [{ totalReferred: totalReferred,totalInsurance:totalInsurance}];
            resolve(ret_arr);
        })
        });
    });
}

module.exports.checkMakeExistence = function(req) {
    return new Promise((resolve, reject) => {
        var where = "make = '" + req.body.make + "'";
        db.getWhere('vehicle_make', where).then(function(result) {
            if (valid(result)) {
                reject("Make already exists");
            } else {
                resolve(true);
            }
        });
    });
}

module.exports.checkModelExistence = function(req, make_id) {
    return new Promise((resolve, reject) => {
        var where = "model = '" + req.body.model + "' AND make_id = '" + make_id + "'";
        db.getWhere('vehicle_model', where).then(function(result) {
            if (valid(result)) {
                reject("Model already exists");
            } else {
                resolve(true);
            }
        });
    });
}

module.exports.checkTrimExistence = function(req, model_id) {
    return new Promise((resolve, reject) => {
        var where = "trim = '" + req.body.trim + "' AND model_id = '" + model_id + "'";
        db.getWhere('vehicle_trim', where).then(function(result) {
            if (valid(result)) {
                reject("Trim already exists");
            } else {
                resolve(true);
            }
        });
    });
}

module.exports.getIndustryType = function(type) {
    return new Promise((resolve, reject) => {
        type = parseInt(type);
        var typeVal = '';
        switch (type) {
            case 1:
                typeVal = 'Retail Bakeries';
                break;
            case 2:
                typeVal = 'Other Building Material Dealers';
                break;
            case 3:
                typeVal = 'Art Dealers';
                break;
            case 4:
                typeVal = 'Other Direct Selling Establishments';
                break;
            case 5:
                typeVal = 'Communication Equipment Repair and Maintenance';
                break;
            case 6:
                typeVal = 'Candy shop';
                break;
            case 7:
                typeVal = 'Art Gallery';
                break;
            case 8:
                typeVal = 'Mailing Or Addressing Company';
                break;
            case 9:
                typeVal = 'Popcorn Shop';
                break;
            case 10:
                typeVal = 'Pretzel Shop';
                break;
        }
        resolve(typeVal);
    });
}

module.exports.getBusinessStructure = function(business_structure) {
    return new Promise((resolve, reject) => {
        business_structure = parseInt(business_structure);
        var businessStructureVal = '';
        switch (business_structure) {
            case 1:
                businessStructureVal = 'Individual / Sole Proprietor';
                break;
            case 2:
                businessStructureVal = 'Joint Venture';
                break;
            case 3:
                businessStructureVal = 'LLC';
                break;
            case 4:
                businessStructureVal = 'Partnership';
                break;
            case 5:
                businessStructureVal = 'Trust';
                break;
            case 6:
                businessStructureVal = 'C Corporation';
                break;
            case 7:
                businessStructureVal = 'S Corporation';
                break;
            case 8:
                businessStructureVal = 'Unincorporated Association';
                break;
            case 9:
                businessStructureVal = 'Nonprofit';
                break;
            case 10:
                businessStructureVal = 'Other';
                break;
        }
        resolve(businessStructureVal);
    });
}

module.exports.calculate = function(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
        dist = dist * 1.609344;
    }
    if (unit == "N") {
        dist = dist * 0.8684;
    }
    return dist;
};

module.exports.readFiles = function(dirname) {
    var Promise = require('promise');
    var fs = require('fs');
    var path = require('path');
    return new Promise((resolve, reject) => {
        fs.readdir(dirname, function(err, filenames) {
            if (err)
                return reject(err);
            promiseAllP(filenames,
                (filename, index, resolve, reject) => {
                    fs.readFile(path.resolve(dirname, filename), 'utf-8', function(err, content) {
                        if (err)
                            return reject(err);
                        return resolve({
                            filename: filename,
                            contents: content
                        });
                    });
                }).then(results => {
                return resolve(results);
            }).catch(error => {
                return reject(error);
            });
        });
    });
};


function promiseAllP(items, block) {
    var promises = [];
    items.forEach(function(item, index) {
        promises.push(function(item, i) {
            return new Promise(function(resolve, reject) {
                return block.apply(this, [item, index, resolve, reject]);
            });
        }(item, index))
    });
    return Promise.all(promises);
}

module.exports.date_diff_indays = function(date1, date2) {
    var dt1 = new Date(date1);
    var dt2 = new Date(date2);
    console.log(dt1);
    console.log(dt2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
};

module.exports.date_diff_in_hours = function(date1, date2) {
    var dt1 = new Date(date1);
    var dt2 = new Date(date2);
    var timeDiff = Math.abs(dt2.getTime() - dt1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600));
    return diffDays;
};

module.exports.date_diff_in_mins = function(date1, date2) {
    var dt1 = new Date(date1);
    var dt2 = new Date(date2);
    var timeDiff = Math.abs(dt2.getTime() - dt1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 60));
    return diffDays;
};

module.exports.getDateTime = function() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
};

module.exports.enCrypt = function(content) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

module.exports.deCrypt = function(content) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

module.exports.uploadVideo = function(req, directoryPath) {
    try {
        return new Promise(function(resolve, reject) {
            try {
                if (valid(req.files)) {
                    if (valid(req.files.video_url)) {
                        try {
                            var now = new Date;
                            var utcTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
                            fs.readFile(req.files.video_url.path, (err, data) => {
                                if (err)
                                    return reject("Something went Wrong");

                                var base64data = new Buffer(data, 'binary');
                                let s3bucket = new AWS.S3({
                                    version: bucket_cred.aws.version,
                                    accessKeyId: bucket_cred.aws.key_id,
                                    secretAccessKey: bucket_cred.aws.secret_key,
                                    Bucket: bucket_cred.aws.bucket
                                });
                                var fileName = path.basename(req.files.video_url.path);
                                var extension = path.extname(fileName);
                                var contentType = extension.replace('.', '');
                                var params = {
                                    Bucket: bucket_cred.aws.bucket,
                                    Key: directoryPath + utcTime + extension,
                                    Body: base64data,
                                    ACL: bucket_cred.aws.access_level,
                                    ContentType: 'video/' + contentType
                                };
                                try {
                                    s3bucket.upload(params, function(err, data) {
                                        if (err) {
                                            return reject(err);
                                        }
                                        return resolve(data.Location);
                                    });
                                } catch (error) {
                                    return reject(error.message);
                                }
                            });
                        } catch (error) {
                            return reject(error.message);
                        }
                    } else {
                        resolve("");
                    }
                } else {
                    resolve("");
                }
            } catch (error) {
                return reject(error.message);
            }
        });
    } catch (error) {
        return reject(error.message);
    }
};

var createThumbnail = async function(video_url, thumbnailName) {
    return new Promise(async function(resolve, reject) {
        await ffmpeg(video_url)
            .screenshots({
                timestamps: [30.5, '50%', '01:10.123'],
                filename: thumbnailName + ".png",
                folder: '/var/www/html/temp/',
                size: '420x320'
            }).on('end', function() {
                resolve(1);
            });
    });
}

module.exports.uploadThumbnailToS3 = function(video_url, directoryPath) {
    try {
        return new Promise(function(resolve, reject) {
            try {
                if (valid(video_url)) {
                    try {
                        var now = new Date;
                        var utcTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
                        var thumbnailName = utcTime;
                        //create thumbnail
                        createThumbnail(video_url, thumbnailName).then(function() {
                            fs.readFile('/var/www/html/temp/' + thumbnailName + '_1.png', (err, data) => {
                                if (err) {
                                    return reject("Something went Wrong");
                                }

                                var base64data = new Buffer(data, 'binary');
                                let s3bucket = new AWS.S3({
                                    version: bucket_cred.aws.version,
                                    accessKeyId: bucket_cred.aws.key_id,
                                    secretAccessKey: bucket_cred.aws.secret_key,
                                    Bucket: bucket_cred.aws.bucket
                                });
                                var params = {
                                    Bucket: bucket_cred.aws.bucket,
                                    Key: directoryPath + thumbnailName + ".png",
                                    Body: base64data,
                                    ACL: bucket_cred.aws.access_level,
                                    ContentType: 'image/png'
                                };
                                try {
                                    s3bucket.upload(params, function(err, result) {
                                        if (err) {
                                            return reject(err);
                                        }
                                        fs.unlinkSync('/var/www/html/temp/' + thumbnailName + '_1.png');
                                        return resolve(result.Location);
                                    });
                                } catch (error) {
                                    return reject(error.message);
                                }
                            });
                        });
                    } catch (error) {
                        return reject(error.message);
                    }

                } else {
                    resolve("");
                }
            } catch (error) {
                return reject(error.message);
            }
        });
    } catch (error) {
        return reject(error.message);
    }
};

module.exports.uploadMultipleFiles = function(req, directoryPath) {
    try {
        return new Promise(function(resolve, reject) {
            try {
                if (valid(req.files)) {
                    if (valid(req.files.image)) {
                        try {
                            if (Array.isArray(req.files.image)) {
                                var now = new Date;
                                var utcTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
                                var images_data = [];
                                req.files.image.forEach(function(value, index) {
                                    if (value.originalFilename != '' && value.size > 0) {
                                        images_data.push(new Promise(function(resolve1, reject1) {
                                            fs.readFile(value.path, (err, data) => {
                                                if (err)
                                                    return reject1('Something went wrong');

                                                var base64data = new Buffer(data, 'binary');
                                                let s3bucket = new AWS.S3({
                                                    version: bucket_cred.aws.version,
                                                    accessKeyId: bucket_cred.aws.key_id,
                                                    secretAccessKey: bucket_cred.aws.secret_key,
                                                    Bucket: bucket_cred.aws.bucket
                                                });
                                                var fileName = path.basename(value.path);
                                                var extension = path.extname(fileName);
                                                var contentType = extension.replace('.', '');
                                                s3bucket.createBucket(function() {
                                                    var params = {
                                                        Bucket: bucket_cred.aws.bucket,
                                                        Key: directoryPath + rand({
                                                            length: 5
                                                        }) + utcTime + extension,
                                                        Body: base64data,
                                                        ACL: bucket_cred.aws.access_level,
                                                        ContentType: 'image/' + contentType
                                                    };
                                                    try {
                                                        s3bucket.upload(params, function(err, data) {
                                                            if (err) {
                                                                return reject1('Something went wrong');
                                                            }
                                                            return resolve1(data.Location);
                                                        });
                                                    } catch (error) {
                                                        return reject1(error.message);
                                                    }
                                                });
                                            });
                                        }));
                                    } else {
                                        images_data.push("");
                                    }

                                });

                                Promise.all(images_data).then(function(images) {
                                    return resolve(images);
                                }).catch(function(error) {
                                    return reject(error);
                                });

                            } else {
                                return reject('Something went wrong');
                            }
                        } catch (error) {
                            return reject(error.message);
                        }
                    } else {
                        resolve("");
                    }
                } else {
                    resolve("");
                }
            } catch (error) {
                return reject(error.message);
            }
        });
    } catch (error) {
        return reject(error.message);
    }
};

module.exports.uploadSingleImage = function(req, directoryPath) {
    try {
        return new Promise(function(resolve, reject) {
            try {
                if (valid(req.files)) {
                    if (valid(req.files.image)) {
                        try {
                            var now = new Date;
                            var utcTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
                            fs.readFile(req.files.image.path, (err, data) => {
                                if (err)
                                    return reject("Something went Wrong");
                                var base64data = new Buffer(data, 'binary');
                                let s3bucket = new AWS.S3({
                                    version: bucket_cred.aws.version,
                                    accessKeyId: bucket_cred.aws.key_id,
                                    secretAccessKey: bucket_cred.aws.secret_key,
                                    Bucket: bucket_cred.aws.bucket
                                });
                                var fileName = path.basename(req.files.image.path);
                                var extension = path.extname(fileName);
                                var contentType = extension.replace('.', '');
                                var params = {
                                    Bucket: bucket_cred.aws.bucket,
                                    Key: directoryPath + utcTime + extension,
                                    Body: base64data,
                                    ACL: bucket_cred.aws.access_level,
                                    ContentType: 'image/' + contentType
                                };
                                try {
                                    s3bucket.upload(params, function(err, data) {
                                        if (err) {
                                            return reject(err);
                                        }
                                        return resolve(data.Location);
                                    });
                                } catch (error) {
                                    return reject(error.message);
                                }
                            });
                        } catch (error) {
                            return reject(error.message);
                        }
                    } else {
                        resolve("");
                    }
                } else {
                    resolve("");
                }
            } catch (error) {
                console.log(error);
                
                return reject(error.message);
            }
        });
    } catch (error) {
        console.log("error",error);
        return reject(error.message);
    }
};

module.exports.deleteSingleFileFromS3 = function(fileNameWithPath, directoryPath) {
    try {
        return new Promise(function(resolve, reject) {
            try {
                if (valid(fileNameWithPath)) {
                    try {
                        let s3bucket = new AWS.S3({
                            version: bucket_cred.aws.version,
                            accessKeyId: bucket_cred.aws.key_id,
                            secretAccessKey: bucket_cred.aws.secret_key,
                            Bucket: bucket_cred.aws.bucket
                        });
                        var KeyFile = fileNameWithPath.substring(fileNameWithPath.lastIndexOf("/") + 1, fileNameWithPath.length);
                        var params = {
                            Bucket: bucket_cred.aws.bucket,
                            Key: directoryPath + KeyFile
                        };
                        try {
                            s3bucket.deleteObject(params, function(err, data) {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve(1);
                            });
                        } catch (error) {
                            return reject(error.message);
                        }
                    } catch (error) {
                        return reject(error.message);
                    }
                } else {
                    resolve("");
                }
            } catch (error) {
                return reject(error.message);
            }
        });
    } catch (error) {
        return reject(error.message);
    }
};

module.exports.deleteMultipleFileFromS3 = function(fileNameWithPathArr, directoryPath) {
    try {
        return new Promise(function(resolve, reject) {
            try {
                if (valid(fileNameWithPathArr)) {
                    try {
                        let s3bucket = new AWS.S3({
                            version: bucket_cred.aws.version,
                            accessKeyId: bucket_cred.aws.key_id,
                            secretAccessKey: bucket_cred.aws.secret_key,
                            Bucket: bucket_cred.aws.bucket
                        });
                        var deleRes = [];
                        fileNameWithPathArr.forEach(function(value, index) {
                            var KeyFile = value.substring(value.lastIndexOf("/") + 1, value.length);
                            deleRes.push(new Promise(function(resolve1, reject1) {
                                try {
                                    var params = {
                                        Bucket: bucket_cred.aws.bucket,
                                        Key: directoryPath + KeyFile
                                    };
                                    s3bucket.deleteObject(params, function(err, data) {
                                        if (err) {
                                            return reject1(err);
                                        }
                                        return resolve1(1);
                                    });
                                } catch (error) {
                                    return reject1(error.message);
                                }
                            }));
                        });

                        Promise.all(deleRes).then(function(images) {
                            return resolve(1);
                        }).catch(function(error) {
                            return reject(error);
                        });

                    } catch (error) {
                        return reject(error.message);
                    }
                } else {
                    resolve("");
                }
            } catch (error) {
                return reject(error.message);
            }
        });
    } catch (error) {
        return reject(error.message);
    }
};

module.exports.getAppUserDetails = function(user_id) {
    return new Promise((resolve, reject) => {
        var userOtherInfo = {};
        var add_query = "SELECT * FROM user_address where user_id=" + user_id;
        var edu_query = "SELECT * FROM user_education where user_id=" + user_id;
        var family_mem_query = "SELECT * FROM user_family_member where user_id=" + user_id;
        var pets_query = "SELECT * FROM user_pets where user_id=" + user_id;
        var asset_query = "SELECT * FROM user_asset where user_id=" + user_id;
        var work_query = "SELECT * FROM user_work where user_id=" + user_id;
        var vehi_query = "SELECT * FROM user_vehicles where user_id=" + user_id;
        db.dbQuery(add_query).then(function(address_result) {
            userOtherInfo.user_address = valid(address_result) ? address_result : [];
            db.dbQuery(edu_query).then(function(edu_result) {
                userOtherInfo.user_education = valid(edu_result) ? edu_result : [];
                db.dbQuery(family_mem_query).then(function(family_member_result) {
                    userOtherInfo.user_family_member = valid(family_member_result) ? family_member_result : [];
                    db.dbQuery(pets_query).then(function(pets_result) {
                        userOtherInfo.user_pets = valid(pets_result) ? pets_result : [];
                        db.dbQuery(asset_query).then(function(asset_result) {
                            userOtherInfo.user_assets = valid(asset_result) ? asset_result : [];
                            db.dbQuery(work_query).then(function(work_result) {
                                userOtherInfo.user_work = valid(work_result) ? work_result : [];
                                db.dbQuery(vehi_query).then(function(vehicle_result) {
                                    userOtherInfo.user_vehicle = valid(vehicle_result) ? vehicle_result : [];
                                    return resolve(userOtherInfo);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

module.exports.checkCategoryExistence = function(req) {
    return new Promise((resolve, reject) => {
        var where = "type = '" + req.body.type + "' AND category = '" + req.body.category + "'";
        db.getWhere('category', where).then(function(result) {
            if (valid(result)) {
                reject("Category already exists");
            } else {
                resolve(true);
            }
        });
    });
}

module.exports.getCategoryListByType = function(type) {
    return new Promise((resolve, reject) => {
        var where = "type = " + type;
        db.getWhere('category', where).then(function(result) {
            var catArr = [];
            if (valid(result)) {
                for (var i = 0; i <= result.length - 1; i++) {
                    catArr.push(result[i].category);
                }
                resolve(catArr);
            } else {
                resolve(catArr);
            }
        });
    });
}

module.exports.getBlogData = function(query) {
    return new Promise((resolve, reject) => {
        db.dbQuery(query).then(function(result) {
            var blogArr = [];
            if (valid(result)) {
                for (var i = 0; i <= result.length - 1; i++) {
                    var v_type = '';
                    if (result[i].type == 1)
                        var v_type = "Auto";
                    if (result[i].type == 2)
                        var v_type = "Home";
                    if (result[i].type == 3)
                        var v_type = "Business";
                    if (result[i].type == 4)
                        var v_type = "Work Compensation";
                    if (result[i].type == 5)
                        var v_type = "Renters";
                    if (result[i].type == 6)
                        var v_type = "Home Insurance Floater";
                    if (result[i].type == 7)
                        var v_type = "Motorcycle, RV, Boat";
                    if (result[i].type == 8)
                        var v_type = "Umbrella";
                    if (result[i].type == 9)
                        var v_type = "Small Group Benefits";
                    if (result[i].type == 10)
                        var v_type = "Life";
                    if (result[i].type == 11)
                        var v_type = "Health care";
                    if (result[i].type == 12)
                        var v_type = "Accident";
                    if (result[i].type == 13)
                        var v_type = "Dental";
                    if (result[i].type == 14)
                        var v_type = "Short-Term Medical";
                    if (result[i].type == 15)
                        var v_type = "Vision";
                    if (result[i].type == 16)
                        var v_type = "Medicare";
                    if (result[i].type == 17)
                        var v_type = "Medical Insurance";
                    if (result[i].type == 18)
                        var v_type = "Commercial Auto Insurance";
                    if (result[i].type == 19)
                        var v_type = "General Liability Insurance";
                    if (result[i].type == 20)
                        var v_type = "Professional Liability Insurance";
                    if (result[i].type == 21)
                        var v_type = "Cyber Insurance";
                    if (result[i].type == 22)
                        var v_type = "Surety Bonds Insurance";
                    if (result[i].type == 23)
                        var v_type = "Contact Us";
                    result[i].category = v_type;
                    result[i].time_since = timeSince(result[i].created_at);
                    blogArr.push(result[i]);
                }
                resolve(blogArr);
            } else {
                resolve(blogArr);
            }
        });
    });
}


module.exports.sendMailAWS = function(data) {
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

module.exports.getInsuranceType = function(type) {
    if (type == 1)
        var v_type = "Auto Insurance";
    if (type == 2)
        var v_type = "Home Insurance";
    if (type == 3)
        var v_type = "Business Insurance";
    if (type == 4)
        var v_type = "Work Compensation Insurance";
    if (type == 5)
        var v_type = "Renters Insurance";
    if (type == 6)
        var v_type = "Home Insurance Floater Insurance";
    if (type == 7)
        var v_type = "Motorcycle, RV, Boat Insurance";
    if (type == 8)
        var v_type = "Umbrella Insurance";
    if (type == 9)
        var v_type = "Small Group Benefits Insurance";
    if (type == 10)
        var v_type = "Life Insurance";
    if (type == 11)
        var v_type = "Health care Insurance";
    if (type == 12)
        var v_type = "Accident Insurance";
    if (type == 13)
        var v_type = "Dental Insurance";
    if (type == 14)
        var v_type = "Short-Term Medical Insurance";
    if (type == 15)
        var v_type = "Vision Insurance";
    if (type == 16)
        var v_type = "Medicare Insurance";
    if (type == 17)
        var v_type = "Medical Insurance";
    if (type == 18)
        var v_type = "Commercial Auto Insurance";
    if (type == 19)
        var v_type = "General Liability Insurance";
    if (type == 20)
        var v_type = "Professional Liability Insurance";
    if (type == 21)
        var v_type = "Cyber Insurance";
    if (type == 22)
        var v_type = "Surety Bonds Insurance";
    if (type == 23)
        var v_type = "Contact Us";
    return v_type;
}


function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}