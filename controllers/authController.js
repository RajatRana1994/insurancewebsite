var userModel = require('../models/User')
var bcrypt = require('bcryptjs')
var env = require('../env')
var utility = require('../modules/utility')
var validator = require('validator');
var jwt = require('jsonwebtoken')
var segmentModel = require('../models/Segment')
var userSizeModel = require('../models/UserSize')
//const thumb = require('node-video-thumb')
//var ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
// const ffmpeg = require('fluent-ffmpeg');
// ffmpeg.setFfmpegPath(ffmpegPath);

// exports.testingUpload = async function(req,res){
//     try{
//         if (req.file) {
//             console.log('file', req.file)
//             console.log("dd",__dirname)
//             console.log("dd",__dirname+'/../../'+req.file.path)
//             var name=req.file.filename.split('.').slice(0, -1).join('.')
//             var proc = ffmpeg(__dirname+'/../../'+req.file.path)
//                 .takeScreenshots({ count: 1, timemarks: ['00:00:01.000', '6'],filename: name },`${__dirname}/../../storage/thumnail`, function (err) {
//                     console.log('screenshotse saved',err)
//                 });
//                 console.log("--",proc)
//          }

//         return res.status(200).json({
//             status: 'failure',
//             message: 'Email already registered'
//         })
//     }catch(err){
//         console.log("err",err)
//     }
// }
/**
 * @Function : socialLogin
 * @method:POST
 * @description: Login through social account.
 * @param firstName @type STRING.
 * @param lastName @type STRING.
 * @param password @type STRING.
 * @param email @type STRING.
 * @param DOB @type STRING.
 * @param country @type STRING.
 * @param gender @type STRING.
 * @param profilePic @type STRING.
 * @param socialId @type STRING.
 * @param socialType @type STRING.
 * @return  status,message @type JSON
 */
exports.socialLogin = async function (req, res) {
    try {
        console.log("req-->", req.body)
        if (!req.body.socialType) {
            return res.status(200).json({
                status: 'failure',
                message: 'Social Type is required'
            })
        }
        if (!req.body.socialId) {
            return res.status(200).json({
                status: 'failure',
                message: 'Social Id is required'
            })
        }

        if (req.body.email) {
            if (!validator.isEmail(req.body.email)) {
                return res.status(200).json({
                    status: 'failure',
                    message: 'Email adress not correct'
                })
            }
            let emailFound = await userModel.findOne({
                email: req.body.email.toLowerCase()
            })
            console.log("emailFound", emailFound)
            if (emailFound) {
                console.log("Found")
                if (emailFound.blocked === 'true') {
                    return res.status(200).json({
                        status: 'failure',
                        message: 'You are blocked by admin, please contact admin'
                    })
                }
                if (emailFound.acountDelete === 'true') {
                    return res.status(200).json({
                        status: 'failure',
                        message: 'Your account is deleted, please contact admin'
                    })
                }
                let token = jwt.sign({
                    id: emailFound.id
                }, env.jwtKey)
                let sizeData = await userSizeModel.findOne({
                    user: emailFound._id
                })
                let size = false
                if (sizeData) {
                    size = true
                }

                return res.status(200).json({
                    status: 'success',
                    message: 'Sign in successfully',
                    token: token,
                    size
                })
            }
        }
        let user = new userModel()
        user.socialType = req.body.socialType
        user.socialId = req.body.socialId
        let findUser = await userModel.findOne({
            socialType: req.body.socialType,
            socialId: req.body.socialId
        })
        //console.log("find user", findUser)
        if (findUser) {
            if (findUser.blocked === 'true') {
                return res.status(200).json({
                    status: 'failure',
                    message: 'You are blocked by admin, please contact admin'
                })
            }
            if (findUser.acountDelete === 'true') {
                return res.status(200).json({
                    status: 'failure',
                    message: 'Your account is deleted, please contact admin'
                })
            }
            let token = jwt.sign({
                id: findUser.id
            }, env.jwtKey)

            return res.status(200).json({
                status: 'success',
                message: 'Sign in successfully',
                token: token
            })
        }

        if (!req.body.gender) {
            return res.status(200).json({
                status: 'failure',
                message: 'Gender is required'
            })
        }
        let segment = await segmentModel.find()
        // console.log("segemnt", segment)
        let segmentId = segment.filter(x => x.segmentName === req.body.gender);
        // console.log("segment", segmentId)
        if (!segmentId.length) {
            return res.status(200).json({
                status: 'failure',
                message: 'Gender can only be men/women/children'
            })
        }
        user.gender = segmentId[0]._id
        user.userActive = true
        if (req.body.firstName)
            user.firstName = req.body.firstName
        if (req.body.lastName)
            user.lastName = req.body.lastName
        if (req.body.DOB)
            user.DOB = req.body.DOB
        if (req.body.country)
            user.country = req.body.country
        if (req.body.zipCode)
            user.zipCode = req.body.zipCode
        if (req.body.email)
            user.email = req.body.email.toLowerCase()
        if (req.body.profilePic) {
            user.profilePic = req.body.profilePic
        }
        // console.log("user-->",user)
        await user.save()
        let token = jwt.sign({
            id: user.id
        }, env.jwtKey)

        return res.status(200).json({
            status: 'success',
            message: 'Sign in successfully',
            token: token
        })
        //console.log("user-->",user)
    } catch (err) {
        //console.log(err)
        return res.status(200).json({
            status: 'failure',
            message: err
        })
    }
}

// function chkStatus(user,res) {
//     console.log("99",user)
//     if (user.blocked === 'true') {
//         return res.status(200).json({
//             status: 'failure',
//             message: 'You are blocked by admin, please contact admin'
//         })
//     }
//     if (user.acountDelete === 'true') {
//         return res.status(200).json({
//             status: 'failure',
//             message: 'Your account is deleted, please contact admin'
//         })
//     }
//     return true
// }

/**
 * @Function : register
 * @method:POST
 * @description: Register the user.
 * @param firstName @type STRING.
 * @param lastName @type STRING.
 * @param password @type STRING.
 * @param email @type STRING.
 * @param DOB @type STRING.
 * @param country @type STRING.
 * @param gender @type STRING.
 * @param profilePic @type FILE.
 * @return  status,message @type JSON
 */

exports.register = async function (req, res) {
    try {
        //console.log('in req', req)
        if (!req.body.email) {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('Email is required')
            })
        }

        if (!req.body.firstName) {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('First Name is required')
            })
        }
        /** Commenting code after discussing with Sherwin now we are making First name as required only. **/
        
        // if (!req.body.lastName) {
        //     return res.status(200).json({
        //         status: 'failure',
        //         message: req.localize.translate('Last Name is required')
        //     })
        // }

        if (!req.body.password) {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('Password is required')
            })
        }
        if (!req.body.gender) {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('Gender is required')
            })
        }

        if (!validator.isEmail(req.body.email)) {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('Email adress not correct')
            })
        }
        const chkEmailId = await userModel.findOne({
            email: req.body.email.toLowerCase()
        })

        if (chkEmailId) {
            if (chkEmailId.acountDelete === 'true') {
                return res.status(200).json({
                    status: 'failure',
                    message: req.localize.translate('Your account is deleted, please contact admin')
                })
            }
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('Email already registered')
            })
        }

        const user = new userModel()
        let segment = await segmentModel.find()
        //console.log("segemnt", segment)
        let segmentId = segment.filter(x => x.segmentName === req.body.gender);
        //console.log("segment", segmentId)
        if (!segmentId.length) {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('Gender can only be men/women/children')
            })
        }
        user.firstName = req.body.firstName
        user.lastName = req.body.lastName||""
        user.password = req.body.password
        user.email = req.body.email.toLowerCase()
        user.verificationCode = await utility.generateNewToken()
        user.DOB = req.body.DOB||""
        user.country = req.body.country
        user.gender = segmentId[0]._id
        user.zipCode = req.body.zipCode||""
        if (req.file) {
            //console.log('file', req.file)
            user.profilePic = req.file.path
        }
        var userMailData = {
            email: user.email,
            firstname: user.firstName,
            lastname: user.lastName,
            verifying_token: user.verificationCode,
            password: user.password
        };
        await user.save()
        utility.readTemplateSendMail(user.email, '[FITNONCE] Email Verification', userMailData, 'verify_email', function (err, resp) {});
        return res.status(200).json({
            status: 'success',
            message: req.localize.translate('Signup successfully, please check your email to activate your account')
        })
    } catch (err) {
        // console.log('erre', err)
        return res.status(500).send(err)
    }
}
/**
 * @Function : verifyLink
 * @method:GET
 * @description: Verify the user and activate the user.
 * @param key @type STRING.
 */

exports.verifyLink = async function (req, res) {
    try {
        const user = await userModel.findOne({
            verificationCode: req.params.key
        })
        //console.log('key--->', req.params.key)
        // console.log("user-->", user)
        if (user) {
            let html = 'Your account is already active, please login to your account'
            if (user.userActive === 'false') {
                user.userActive = 'true'
                html = `Your account is active now, you can login to your account`
                await user.save()
            }
            return res.render('verificationSuccess', {
                html
            })

        } else {
            let html = `The link is not correct please try again`
            return res.render('verificationSuccess', {
                html
            })
        }

    } catch (err) {
        return res.status(500).send(err)
    }
}

/**
 * @Function : login
 * @method:POST
 * @description: Verify the user and activate the user.
 * @param email @type STRING.
 * @param password @type STRING.
 * @return  status,message token @type JSON
 */

exports.login = async function (req, res) {
    try {

        // added gender in login response
        const user = await userModel.findOne({
            email: req.body.email
        }).populate({
            path: 'gender',
            select: {
                segmentName: 1
            }
        })
        if (!user) {
            return res.status(200).json({
                status: 'failure',
                // message: req.localize.translate('Email not found, please try again')
                message: req.localize.translate('Email address not correct')
            })
        }
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('Password not matched, please try again')
            })
        }
        if (user.userActive === 'false') {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('Please activate your account first')
            })
        }

        if (user.blocked === 'true') {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('You are blocked by admin, please contact admin')
            })
        }
        if (user.acountDelete === 'true') {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('Your account is deleted, please contact admin')
            })
        }
        let sizeData = await userSizeModel.findOne({
            user: user._id
        })
        let size = false
        if (sizeData) {
            size = true
        }

        let token = jwt.sign({
            id: user.id
        }, env.jwtKey)

        return res.status(200).json({
            status: 'success',
            message: req.localize.translate('Sign in successfully'),
            token: token,
            gender: user.gender.segmentName,
            size
        })
    } catch (err) {
        //console.log("err-->",err)
        return res.status(500).send(err)
    }
}
/**
 * @Function : forgetPassword
 * @method:POST
 * @description: user password change.
 * @param email @type STRING.
 * @return  status,message @type JSON
 */

exports.forgetPassword = async function (req, res) {
    try {
        if (!validator.isEmail(req.body.email)) {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('Email address not correct')
            })
        }
        const user = await userModel.findOne({
            email: req.body.email.toLowerCase()
        })
        if (!user) {
            return res.status(200).json({
                status: 'failure',
                message: req.localize.translate('Invalid Account')
            })
        }
        var randomPassword = Math.random().toString(36).slice(-8);
        user.password = randomPassword
        await user.save()
        //console.log('random password', randomPassword)
        var userMailData = {
            email: user.email,
            firstname: user.firstName,
            lastname: user.lastName,
            password: randomPassword
        };
        utility.readTemplateSendMail(user.email, '[FITNONCE] Forget Password', userMailData, 'forgot_password', function (err, resp) {});
        return res.status(200).json({
            status: 'success',
            message: req.localize.translate('Please check you email to login')
        })
    } catch (err) {
        return res.status(500).send(err)
    }
}