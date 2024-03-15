const Sequelize = require('sequelize');
const db = require('../../config/database/mysql');

var user = db.define('user',
{
    user_id: {
        field: 'user_id', 
        type:Sequelize.STRING, 
        primaryKey:true
    },
    user_data_id: {
        field: 'user_data_id', 
        type:Sequelize.STRING,
        allowNull: true
    },
    username: {
        field: 'username',
        type:Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        field: 'password',
        type:Sequelize.STRING,
        allowNull: false
    },
    group_id: {
        field: 'group_id',
        type: Sequelize.INTEGER,
        allowNull: false
    },
    created_at: { 
        field: 'created_at',
        type: Sequelize.DATE
    },
    updated_at: { 
        field: 'updated_at',
        type: Sequelize.DATE
    },
},{
    freezeTableName: true,
    timestamps: false
});
user.removeAttribute('id');

module.exports = user;