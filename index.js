const {
    default: makeWASocket,
	MessageType, 
    MessageOptions, 
    Mimetype,
	DisconnectReason,
	BufferJSON,
    AnyMessageContent, 
	delay, 
	fetchLatestBaileysVersion, 
	isJidBroadcast, 
	makeCacheableSignalKeyStore, 
	makeInMemoryStore, 
	MessageRetryMap, 
	useMultiFileAuthState,
	msgRetryCounterMap,
	isJidGroup
} = require("@adiwajshing/baileys");

const log = (pino = require("pino"));
const { session } = {"session": "baileys_auth_info"};
const { Boom } =require("@hapi/boom");
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require("express");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require("body-parser");
const model = require('./model/index');

// HANDLER
const { StambukHandler } = require('./handler/StambukHandler');
const { QuoteHandler } = require('./handler/QuoteHandler');
const { DawuhHandler } = require('./handler/DawuhHandler');

const app = require("express")()
// enable files upload
app.use(fileUpload({ createParentPath: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/assets", express.static(__dirname + "/public/assets"));

app.get("/scan", (req, res) => {
  res.sendFile("./public/qrcodepage.html", {
    root: __dirname,
  });
});

app.get("/", (req, res) => {
  res.sendFile("./public/index.html", {
    root: __dirname,
  });
});

const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 8000;
const qrcode = require("qrcode");
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
let sock;
let qr;
let soket;

async function connectToWhatsApp() {
	const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
	let { version, isLatest } = await fetchLatestBaileysVersion();
    sock = makeWASocket({
        printQRInTerminal: true,
		auth: state,
		logger: log({ level: "silent" }),
		version,
		shouldIgnoreJid: jid => isJidBroadcast(jid)
    });
	store.bind(sock.ev);
	sock.multi = true
	sock.ev.on('connection.update', async (update) => {
		const { connection, lastDisconnect } = update;
		if(connection === 'close') {
            let reason = new Boom(lastDisconnect.error).output.statusCode;
			if (reason === DisconnectReason.badSession) {
				console.log(`Bad Session File, Please Delete ${session} and Scan Again`);
				fs.rmdir(session, { recursive: true }, (err) => {
					if (err) {
						console.error(err);
					}
					connectToWhatsApp();
				});
			} else if (reason === DisconnectReason.connectionClosed) {
				console.log("Connection closed, reconnecting....");
				connectToWhatsApp();
			} else if (reason === DisconnectReason.connectionLost) {
				console.log("Connection Lost from Server, reconnecting...");
				connectToWhatsApp();
			} else if (reason === DisconnectReason.connectionReplaced) {
				console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
				sock.logout();
			} else if (reason === DisconnectReason.loggedOut) {
				console.log(`Device Logged Out, Please Delete ${session} and Scan Again.`);
				sock.end();
				fs.rmdir(session, { recursive: true }, (err) => {
					if (err) {
						console.error(err);
					}
					connectToWhatsApp();
				});
			} else if (reason === DisconnectReason.restartRequired) {
				console.log("Restart Required, Restarting...");
				connectToWhatsApp();
			} else if (reason === DisconnectReason.timedOut) {
				console.log("Connection TimedOut, Reconnecting...");
				connectToWhatsApp();
			} else {
				sock.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
				fs.rmdir(session, { recursive: true }, (err) => {
					if (err) {
						console.error(err);
					}
					connectToWhatsApp();
				});
			}
        }
		else if(connection === 'open') {
			console.log('opened connection');
			let getGroups = await sock.groupFetchAllParticipating();
			let groups = Object.values(await sock.groupFetchAllParticipating())
			for (let group of groups) {
				console.log("id_group: "+group.id+" || Nama Group: " +group.subject);
			}
			return;
        }
		
		if (update.qr){
            qr = update.qr;
            updateQR("qr");
        }
		else if(qr = undefined){
            updateQR("loading");
        }
        else{
            if (update.connection === "open") {
                updateQR("qrscanned");
                return;
            }
        }		
    });
	sock.ev.on("creds.update", saveCreds);
	sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if(type === "notify"){
            if(!messages[0].key.fromMe && !messages[0].key.participant) {
				
				//tentukan jenis pesan berbentuk text                
                const pesan = messages[0].message.conversation;
                //tentukan jenis pesan apakah bentuk button
                const responseButton = messages[0].message.buttonsResponseMessage;
				//nowa dari pengirim pesan sebagai id
                const noWa = messages[0].key.remoteJid;
				//update status read (centang 2 bitu pada wa user) 
				await sock.readMessages([messages[0].key]);
				//kecilkan semua pesan yang masuk lowercase 
                const pesanMasuk = pesan.toLowerCase() || '';
				
				if(pesanMasuk === "pppp"){
                    const response = await sock.sendMessage(noWa, {text: "Nomor Official Aktif Mas 😘"},{quoted: messages[0] });
                } else if (pesanMasuk.includes("#stambuk/")){
                    
                    const cmd = pesanMasuk.split('/');
                    if (cmd.length < 4) {
                        await sock.sendMessage(noWa, {text: "Format Salah. ketik *#stambuk/Nama Lengkap/Nama Kelas/Tanggal Lahir*"},{quoted: messages[0] });
                    } else {
                        await StambukHandler(pesanMasuk, sock, noWa, messages)   
                    }
                }
                else if (pesanMasuk.includes("#stanbuk/")){
                    
                    const cmd = pesanMasuk.split('/');
                    if (cmd.length < 4) {
                        await sock.sendMessage(noWa, {text: "Format Salah. ketik *#stambuk/Nama Lengkap/Nama Kelas/Tanggal Lahir*"},{quoted: messages[0] });
                    } else {
                        await StambukHandler(pesanMasuk, sock, noWa, messages)   
                    }
                }
                else if(responseButton){
                    if(responseButton.selectedButtonId == "id1"){
                        await sock.sendMessage(noWa, {
                            text:`*${model.normalDate.curHr}, Dulur!* \n\nUntuk mendapatkan nomor stambuk Anda\nKirimkan pesan dengan format: \n\n*#stambuk/Nama/Nama Kelas/Tanggal Lahir* \n\ \n \n*Contoh:* \n#stambuk/Yusuf Fadlulloh/A1/01-08-2003`
                        });  
                    }
                    else if (responseButton.selectedButtonId == "id2"){
                        await DawuhHandler(pesanMasuk, sock, noWa, messages) 
                    }
                    else if (responseButton.selectedButtonId == "id3"){
                        await QuoteHandler(pesanMasuk, sock, noWa, messages) 
                    }
                    else{
                        await sock.sendMessage(noWa, {
                            text: "Pesan tombol invalid"
                        });
                    } 
				} else {
                    const buttons = [
                        {buttonId: "id1", buttonText: {displayText: 'Cari Stambuk'}, type: 1},
                        {buttonId: "id2", buttonText: {displayText: 'Dawuh Hari Ini'}, type: 1},
                        {buttonId: "id3", buttonText: {displayText: 'Quote Hari Ini'}, type: 1},
                    ]
                    const buttonInfo = {
                        text: `*${model.normalDate.curHr}, Dulur!* \n\nIni adalah Nomor official MizabApps, MizabApps adalah Aplikasi yang berisi banyak hal islami yang bermanfaat!\nSimpan nomor ini untuk mendapatkan informasi terbaru tentang Mizab Lirboyo \nBerikut ini adalah layanan yang bisa Anda dapatkan di Nomor ini`,
                        buttons: buttons,
                        headerType: 1,
						viewOnce:true
                    }
                    await sock.sendMessage(noWa, buttonInfo, {quoted: messages[0]});
                }
            }		
		}		
    });

    sock.ev.on('call', async (json) => {
		let {id, from, status} = json[0];
		if(status == 'offer'){
			sock.rejectCall(id, from).then(() => {
				sock.sendMessage(from, {text: "Maaf kami tidak bisa menerima telpon, hanya boleh mengirim pesan"});
			})
		}
	});
}

io.on("connection", async (socket) => {
    soket = socket;
    if (isConnected) {
        updateQR("connected");
    } else if (qr) {
        updateQR("qr");   
    }
});

const isConnected = () => {
    return (sock.user);
};

const updateQR = (data) => {
    switch (data) {
        case "qr":
            qrcode.toDataURL(qr, (err, url) => {
                soket?.emit("qr", url);
                soket?.emit("log", "QR Code received, please scan!");
            });
            break;
        case "connected":
            soket?.emit("qrstatus", "./assets/check.svg");
            soket?.emit("log", "WhatsApp terhubung!");
            break;
        case "qrscanned":
            soket?.emit("qrstatus", "./assets/check.svg");
            soket?.emit("log", "QR Code Telah discan!");
            break;
        case "loading":
            soket?.emit("qrstatus", "./assets/loader.gif");
            soket?.emit("log", "Registering QR Code , please wait!");
            break;
        default:
            break;
    }
};

// send text message to wa user
app.post("/send-message", async (req, res) =>{

    const pesankirim = req.body.message.replace(/\|>/g, '\n');
    const number = req.body.number;
    
	let numberWA;
    try {
        if(!req.files) 
        {
            if(!number) {
                 res.status(500).json({
                    status: false,
                    response: 'Nomor WA belum tidak disertakan!'
                });
            }
            else
            {
                numberWA = '62' + number + "@s.whatsapp.net";
                if (isConnected) {
                    const exists = await sock.onWhatsApp(numberWA);
                    if (exists?.jid || (exists && exists[0]?.jid)) {
                        sock.sendMessage(exists.jid || exists[0].jid, { text: pesankirim })
                        .then((result) => {
                            res.status(200).json({
                                status: true,
                                response: result,
                            });
                        })
                        .catch((err) => {
                            res.status(500).json({
                                status: false,
                                response: err,
                            });
                        });
                    } else {
                        res.status(500).json({
                            status: false,
                            response: `Nomor ${number} tidak terdaftar.`,
                        });
                    }
                } else {
                    res.status(500).json({
                        status: false,
                        response: `WhatsApp belum terhubung.`,
                    });
                }    
            }
        }
    } catch (err) {
        res.status(500).send(err);
    }
    
});

// send OTP to wa user
app.post("/otp", async (req, res) =>{

    const otp = Math.floor(Math.random() * 10000) + 9999;
    const pesankirim = `Kode Otp Mizab Apps Anda adalah: ${otp}, berlaku dalam 3 menit`
    const number = req.body.number;
    
	let numberWA;
    try {
        if(!req.files) 
        {
            if(!number) {
                 res.status(500).json({
                    status: false,
                    response: 'Nomor WA belum tidak disertakan!'
                });
            }
            else
            {
                numberWA = '62' + number + "@s.whatsapp.net";
                if (isConnected) {
                    const exists = await sock.onWhatsApp(numberWA);
                    if (exists?.jid || (exists && exists[0]?.jid)) {
                        sock.sendMessage(exists.jid || exists[0].jid, { text: pesankirim })
                        .then((result) => {
                            res.status(200).json({
                                status: true,
                                response: result,
                                otp: otp
                            });
                        })
                        .catch((err) => {
                            res.status(500).json({
                                status: false,
                                response: err,
                            });
                        });
                    } else {
                        res.status(500).json({
                            status: false,
                            response: `Nomor ${number} tidak terdaftar.`,
                        });
                    }
                } else {
                    res.status(500).json({
                        status: false,
                        response: `WhatsApp belum terhubung.`,
                    });
                }    
            }
        }
    } catch (err) {
        res.status(500).send(err);
    }
    
});

connectToWhatsApp()
.catch (err => console.log("unexpected error: " + err) ) // catch any errors

server.listen();
