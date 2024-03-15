
const model = require('../model/index');

const QuoteHandler = async (pesanMasuk, sock, noWa, messages) => {

    const rndm = Math.floor(Math.random() * 870);
    const result = await QuoteRequest(rndm);

    if (!result.success) {
        return sock.sendMessage(noWa, {text: result.hasil}, {quoted: messages[0] });
    }

    return sock.sendMessage(noWa, {text: result.data}, {quoted: messages[0] });

}

const QuoteRequest = async(rndm) => {

        const result = {
            success: false,
            data: "Aku gak tau",
            hasil: 'Wah, maaf ternyata quote tidak ditemukan. \nSilakan coba lagi',
        }

        let user_data = await model.user_data.findAll({
            where: {
                status: 'mahasantri',
            }
        })

        if (user_data.length < 0) {
            
            result.success = false;
            result.data = ''
        
        } else if (user_data.length > 0 ){

            var rndm = Math.floor(Math.random() * user_data.length);

            result.success = true
            result.data = `*_Kata-Kata hari ini_* \n \n "${user_data[rndm]?.bio}" \n \n - _${user_data[rndm]?.nama}_ -`;
            
        }
        
        return result;

}

module.exports = {
    QuoteHandler
}