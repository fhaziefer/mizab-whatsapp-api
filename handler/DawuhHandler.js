
const model = require('../model/index');

const DawuhHandler = async (pesanMasuk, sock, noWa, messages) => {

    const rndm = Math.floor(Math.random() * 870);
    const result = await DawuhRequest(rndm);

    if (!result.success) {
        return sock.sendMessage(noWa, {text: result.hasil}, {quoted: messages[0] });
    }

    return sock.sendMessage(noWa, {text: result.data}, {quoted: messages[0] });

}

const DawuhRequest = async(rndm) => {

    function titleCase(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++){
            str[i] = str[i].charAt(0).toUpperCase()+ str[i].slice(1);
        }
        return str.join(' ');
    }

        const result = {
            success: false,
            data: "Aku gak tau",
            hasil: 'Wah, maaf ternyata Dawuh tidak ditemukan. \nSilakan coba lagi',
        }

        let dawuh = await model.dawuh.findAll()

        if (dawuh.length < 0) {
            
            result.success = false;
            result.data = ''
        
        } else if (dawuh.length > 0 ){
            
            var rndm = Math.floor(Math.random() * dawuh.length);

            result.success = true
            result.data = `*_Dawuh hari ini_* \n \n "${dawuh[rndm]?.dawuh}" \n \n - _${titleCase(dawuh[rndm]?.dawuh_dari)}_ -`;
            
        }
        
        return result;

}

module.exports = {
    DawuhHandler
}