// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({
    accessKeyId: "AKIA45HWDO6WRBNVXHYH",
    secretAccessKey: "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",
    region: "us-east-2"
});

// Create createTemplate params
var params = {
  Template: {
    TemplateName: "InsuranceAppUser",
    SubjectPart: "{{subject}}",
    HtmlPart: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Defy</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&amp;display=swap" rel="stylesheet">
        <style>
            @media (max-width:600px) {
              td{
               padding:0px 10px !important;
            }
          }
        </style>
      </head>
      <body>
        <div align="center" style="max-width:680px; width:100%;margin:0 auto; display:flex;">
          <table style="font-family: 'Roboto', sans-serif; border:1px solid #eee;border-collapse: collapse;">
            <tbody>
              <tr align="center" style="">
                <td style="padding:24px 0px; background-color: #21ce99;"><img src="{{logo}}" width="100" alt="corona-fact-logo"/></td>
              </tr>
              <tr align="center">
                <td>Address - {{html}}</td>
              </tr>
              <tr align="center">
                <td style="border-top:1px solid #eee;">
                </td>
              </tr>
              
              <tr align="center">
                  <td style=" padding:0px 60px;background-color: #0a0c0e; ">
                    <div style="margin:40px 0px;">
                    <a href="#"><img style="border-radius:25px; color:#000;" src="{{icon}}" width="40" alt="email-icon"></a>
                    <a href="#"><img style="margin:0px 25px; border-radius:25px;" src="{{icon2}}" width="40" alt="email-icon"></a>
                    <a href="#"><img style=" border-radius:25px;" src="{{icon3}}" width="40" alt="email-icon"></a>
                    <p style="line-height:24px; font-size:14px; color:#fff; margin:20px 0px 0px;line-height: 1.5;">© 2021, 2130 Fulton St, San Francisco, CA 94117, United States.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
    </html>`,
    TextPart: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Defy</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&amp;display=swap" rel="stylesheet">
        <style>
            @media (max-width:600px) {
              td{
               padding:0px 10px !important;
            }
          }
        </style>
      </head>
      <body>
        <div align="center" style="max-width:680px; width:100%;margin:0 auto; display:flex;">
          <table style="font-family: 'Roboto', sans-serif; border:1px solid #eee;border-collapse: collapse;">
            <tbody>
              <tr align="center" style="">
                <td style="padding:24px 0px; background-color: #21ce99;"><img src="{{logo}}" width="100" alt="corona-fact-logo"/></td>
              </tr>
              <tr align="center">
                <td>Address - {{html}}</td>
              </tr>
              <tr align="center">
                <td style="border-top:1px solid #eee;">
                </td>
              </tr>
              
              <tr align="center">
                  <td style=" padding:0px 60px;background-color: #0a0c0e; ">
                    <div style="margin:40px 0px;">
                    <a href="#"><img style="border-radius:25px; color:#000;" src="{{icon}}" width="40" alt="email-icon"></a>
                    <a href="#"><img style="margin:0px 25px; border-radius:25px;" src="{{icon2}}" width="40" alt="email-icon"></a>
                    <a href="#"><img style=" border-radius:25px;" src="{{icon3}}" width="40" alt="email-icon"></a>
                    <p style="line-height:24px; font-size:14px; color:#fff; margin:20px 0px 0px;line-height: 1.5;">© 2021, 2130 Fulton St, San Francisco, CA 94117, United States.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
    </html>`
  }
};

// Create the promise and SES service object
var templatePromise = new AWS.SES({apiVersion: '2010-12-01'}).createTemplate(params).promise();

// Handle promise's fulfilled/rejected states
templatePromise.then(
  function(data) {
    console.log(data);
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });