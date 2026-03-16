require('dotenv').config();
const vars = {
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? 'SET' : 'MISSING',
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING'
};
console.log(JSON.stringify(vars, null, 2));
