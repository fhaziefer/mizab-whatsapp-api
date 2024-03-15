
// KALIJAGA APPS
// DATA USER
const user = require('./kalijaga_apps/user');
const normalDate = require('./kalijaga_apps/normalDate');
const user_data = require('./kalijaga_apps/user_data');
const dawuh = require('./kalijaga_apps/dawuh');

// CONSTRUCT MODEL
const model = {};

// KALIJAGA APPS
// DATA USER
model.user = user;
model.normalDate = normalDate;
model.user_data = user_data;
model.dawuh = dawuh;

// EXPORT ALL MODEL
module.exports = model;