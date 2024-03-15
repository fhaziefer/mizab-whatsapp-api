require('dotenv').config();

const Sequelize = require('sequelize');
const db = require('../../config/database/mysql');

// DEFINE ISI DATABASE MENJADI MODEL
var user_data = db.define('user_data',
{
    user_data_id: {type:Sequelize.STRING, primaryKey:true},
    nama: Sequelize.STRING,
    wali: Sequelize.STRING,
    bagian: Sequelize.STRING,
    kamar: Sequelize.STRING,
    tgl_lahir: Sequelize.STRING,
    bio: Sequelize.STRING,
    khidmah: Sequelize.STRING,
    alamat_id: Sequelize.STRING,
    contact_id: Sequelize.STRING,
    nilai_id: Sequelize.STRING,
    status: Sequelize.STRING,
    avatar: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE
},{
    // SUPAYA NAMA TABEL TIDAK BERUBAH KETIKA BERISI BANYAK (CONTOH CONTAC MENJADI CONTACTS)
    freezeTableName: true,
    // MEMATIKAN FITUR TIMESTAMP AUTO UPDATE KETIKA DI MYSQL SUDAH DISETTING AUTO UPDAT
    timestamps: false
});
// EXPORT MODEL KE INDEX
module.exports = user_data;