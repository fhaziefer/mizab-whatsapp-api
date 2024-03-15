const Sequelize = require('sequelize');
const db = require('../../config/database/mysql');

var dawuh = db.define('dawuh',
{
    dawuh_id: {type:Sequelize.INTEGER, primaryKey:true},
    dawuh: Sequelize.STRING,
    dawuh_dari: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE
},{
    freezeTableName: true,
    timestamps: false
});

dawuh.removeAttribute('id');
module.exports = dawuh;