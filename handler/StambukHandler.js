
const model = require('../model/index');
const {Op} = require('sequelize');

const StambukHandler = async (pesanMasuk, sock, noWa, messages) => {

    const cmd = pesanMasuk.split('/');
    
    const namalengkap = cmd[1];
    const kelas = cmd[2];
    const tgl = cmd[3];
    const result = await StambukRequest(namalengkap, kelas, tgl)
    const stambuk = result.hasil

    if (!result.success) {
        return sock.sendMessage(noWa, {text: stambuk}, {quoted: messages[0] });
    }

    return sock.sendMessage(noWa, {text: result.data}, {quoted: messages[0] });

}

const StambukRequest = async(namalengkap, kelas, tgl) => {

    function titleCase(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++){
            str[i] = str[i].charAt(0).toUpperCase()+ str[i].slice(1);
        }
        return str.join(' ');
    }

    var date = tgl;
    var newdate = date.split("-").reverse().join("-");

    const result = {
        success: false,
        data: "Aku gak tau",
        hasil: `Stambuk tidak ditemukan dengan data: \nNama: ${titleCase(namalengkap)} \nKelas: ${kelas.toUpperCase()} \n \nPerbaharui Nama, Kelas, dan Tanggal Lahir`,
    }

    let user_data = await model.user_data.findAll({
        where: {
            status: 'mahasantri',
            [Op.or]: [{
                nama: { [Op.like]: '%' +namalengkap+ '%' },
                bagian: {[Op.like]: '%' +kelas+ '%' },
                tgl_lahir: {[Op.like]: '%' +newdate+ '%' },
            }]
        }, order: [["bagian", "ASC"]]
    })

    if (user_data.length < 0) {
        
        result.success = false;
        result.data = ''
    
    } else if (user_data.length > 0 ){

        const stambuk = user_data[0].user_data_id.split('S');
        result.success = true
        result.data = `Nama: ${titleCase(user_data[0]?.nama)} \nBagian: ${user_data[0]?.bagian.toUpperCase()} \nStambuk: ${stambuk[1]}`;
    
    }
    
    return result;
    }


module.exports = {
    StambukHandler
}