const AWS = require("aws-sdk");
const { accessKeyId, secretAccessKey, region, sesSenderAddress } =
  require("../config/keys").aws;

const SES_CONFIG = {
  accessKeyId,
  secretAccessKey,
  region,
};

const ses = new AWS.SES(SES_CONFIG);

/**
 * Sends email address
 * @param {Array} recipients - Array of recipient email addresses
 * @param {String} subject - Subject line of the email
 * @param {String} template - Email body in html with inline styles
 */
const sendEmail = (recipients, subject, template) => {
  return new Promise((resolve, reject) => {
    try {
      const params = {
        Destination: {
          ToAddresses: recipients, // Email address/addresses that you want to send your email
        },
        Message: {
          Body: {
            Html: {
              // HTML Format of the email
              Charset: "UTF-8",
              Data: template,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: subject,
          },
        },
        Source: sesSenderAddress,
      };
      const sendEmail = async () => await ses.sendEmail(params).promise();
      sendEmail();
      resolve();
    } catch (error) {
      return reject(error);
    }
  });
};

const generateOTP = () => {
  var digits = "0123456789";
  var otpLength = 4;
  var otp = "";
  for (let i = 1; i <= otpLength; i++) {
    var index = Math.floor(Math.random() * digits.length);
    otp = otp + digits[index];
  }
  return otp;
};

module.exports = { generateOTP, sendEmail };
