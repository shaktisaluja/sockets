require("dotenv").config();

module.exports = {
  host: {
    port: process.env.PORT || 5000,
    hostIP: process.env.HOST || "localhost",
  },
  app: {
    name: "Memesake Backend",
    serverURL: process.env.BASE_SERVER_URL,
    apiURL: process.env.BASE_API_URL,
    clientURL: "https://192.168.0.59:3000" || process.env.BASE_CLIENT_URL,
  },
  aws: {
    bucketName: process.env.AWS_BUCKET_NAME,
    fileURL: `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}`,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    sesSenderAddress: "suryapratap.babbar@simbaquartz.com",
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "auth/google/callback" || process.env.GOOGLE_CALLBACK_URL,
    callbackUrlHead: process.env.CALLBACK_URL_HEAD || "http://127.0.0.1:5000",
  },
  database: process.env.DB_URL,
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenLife: process.env.ACCESS_TOKEN_LIFE,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenLife: process.env.REFRESH_TOKEN_LIFE,
  },
  nodemailer: {
    sender: process.env.NODEMAILER_EMAIL_SENDER,
    pass: process.env.NODEMAILER_EMAIL_PASS,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
  baseUrl: {
    base_client_url: process.env.BASE_CLIENT_URL,
    base_server_url: process.env.BASE_SERVER_URL,
    frontend_redirect_url: process.env.FRONT_REDIRECT_URL,
  },
  coins: {
    buyPrice: 0.05,
    redeemPrice: 0.035,
    minAmount: 200,
    commissionRate: 0.5,
    purchaseCommission: 0.7,
    bundles: [
      {
        id: 1,
        amount: 200,
        // cost: 10,
      },
      {
        id: 2,
        amount: 400,
        // cost: 20,
      },
      {
        id: 3,
        amount: 1000,
        // cost: 50,
      },
      {
        id: 4,
        amount: 1400,
        // cost: 70,
      },
      {
        id: 5,
        amount: 2000,
        // cost: 100,
      },
    ],
  },
};
