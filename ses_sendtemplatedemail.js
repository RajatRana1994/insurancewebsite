// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({
    accessKeyId: "AKIA45HWDO6WRBNVXHYH",
    secretAccessKey: "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",
    region: "us-east-2"
});
// Create sendTemplatedEmail params 
var params = {
  Destination: { /* required */
    // CcAddresses: [
    //   'EMAIL_ADDRESS',
    //   /* more CC email addresses */
    // ],
    ToAddresses: [
      'krishansokhal2000@gmail.com',
      /* more To email addresses */
    ]
  },
  Source: 'Hello@defyinsurance.com', /* required */
  Template: 'MyTemplate', /* required */
  TemplateData : JSON.stringify({subject:"Defy",name:"Krishan",favoriteanimal:"testing"}),
  // TemplateData: '{ \"subject\":\"Defy\", \"name\":\"krishan\", \"favoriteanimal\": \"alligator\" }', /* required */
//   ReplyToAddresses: [
//     'EMAIL_ADDRESS'
//   ],
};


console.log(params);

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