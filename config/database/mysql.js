require('dotenv').config();

const Sequelize = require('sequelize');

const db = new Sequelize(
    process.env.DB,
    process.env.USERDB,
    process.env.PASSWORD,
    {
        dialect: process.env.DIALECT,
        host: process.env.HOST,
        logging: false
});

db
  .authenticate()
  .then(() => {
    console.log(`${process.env.DB} OK`
    );
  })
  .catch(err => {
    console.error('gak oke')
  });

module.exports = db;