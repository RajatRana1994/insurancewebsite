var express = require('express');
var http = require('http');
var https = require('https');
var bodyparser = require('body-parser');
const formData = require("express-form-data");
var morgan = require('morgan');
var fs = require('fs');
var os = require('os');
var rfs = require('rotating-file-stream');
var path = require('path');
var session = require('express-session');
var engine = require('ejs-mate');
var flash = require('express-flash-messages');
var random = require('crypto-random-string');
var useragent = require('express-useragent');

var app = express();

/*############################### Morgan For Logs #######################*/

var logDirectory = path.join(__dirname, 'log')
    // ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
    // create a rotating write stream
var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
});
app.use(morgan('combined', {
    stream: accessLogStream
}));
/*############################### Morgan End #######################*/

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./local_storage');
}
var userLocalId = random({ length: 10 }) + Date.now();
localStorage.setItem('user_request', userLocalId);
app.use(useragent.express());

/*#############################Read FormData #############################*/
const options = {
    uploadDir: os.tmpdir(),
    autoClean: true
};
app.use(formData.parse(options));
/*##########################################################*/

//Parse Body with json or urlencoded format
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));

/*********** Web assets ************/
app.use('/web_assets', express.static(__dirname + '/public/front_end'));
app.use('/admin_assets', express.static(__dirname + '/public/admin_end'));
//app.use('/base_url', "http://13.58.125.166");
//app.use('/node_base_url', "http://13.58.125.166:3000");

/*########################################## Admin Support Methods ##################*/
app.use(flash());
app.use('/public', express.static('public'));
app.engine('ejs', engine);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(session({
    secret: 'insuranceApp@@#@@@#$@@*&$%$@B!@A&*@@R',
    resave: false,
    saveUninitialized: true,
    cookie: { expires: new Date(253402300000000) } /* { secure: true } */
}));

/*############################################################*/
server = http.createServer(app);

// app.get('/',function(req,res){
//     // req.response.about_video = "https://www.youtube.com/embed/9xwazD5SyVg";
//     var blogRes = []
// res.render('home',{blogRes});
// })    

var insuranceController = require('./controllers/insuranceController');
app.use('/', insuranceController);
var webController = require('./controllers/webController');
app.use('/', webController);
var apiController = require('./controllers/apiController');
app.use('/api/', apiController);
var adminController = require('./controllers/adminController');
app.use('/admin/', adminController);
var videoController = require('./controllers/videoController');
app.use('/admin/video/', videoController);
var blogController = require('./controllers/blogController');
app.use('/admin/blog/', blogController);
var agentController = require('./controllers/agentController');
app.use('/agent/', agentController);
var referralController = require('./controllers/referralController');
app.use('/referral/', referralController);
server.listen(5000, function() {
    console.log('Express is working..');
});
