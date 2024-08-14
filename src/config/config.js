

const dotenv = require("dotenv");


dotenv.config();

const config = {
    mongo_url: process.env.MONGO_URL,
    mailPassword: process.env.MAILPASSWORD
}

module.exports = config;