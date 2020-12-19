require('dotenv').config()
const { decryptMedia } = require('@open-wa/wa-automate')

const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const axios = require('axios')
const fetch = require('node-fetch')

const appRoot = require('app-root-path')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const db_group = new FileSync(appRoot+'/data/group.json')  //! GROUP DATA CACHE
const db = low(db_group)
db.defaults({ group: []}).write()

const {
    removeBackgroundFromImageBase64
} = require('remove.bg')

const {
    exec
} = require('child_process')

const {
    menuId,
    cekResi,
    urlShortener,
    meme,
    translate,
    getLocationData,
    images,
    resep,
    rugapoi,
    rugaapi,
    cariKasar
} = require('../tools/index')

const {
    msgFilter,
    color,
    processTime,
    isUrl
} = require('../utils')

const { uploadImages } = require('../utils/fetcher')

const fs = require('fs-extra')
const banned = JSON.parse(fs.readFileSync('./data/banned.json'))
const simi = JSON.parse(fs.readFileSync('./data/simi.json'))
const ngegas = JSON.parse(fs.readFileSync('./data/kasar.json'))
//! Custom Grup
const groupList = JSON.parse(fs.readFileSync('./data/group-list.json'))
// ? BOT - Settings
const {botName,
    ownerNumber,
    memberLimit,
    groupLimit,
    prefix,
    waFeed,} = require('../setting/data/bot-setting.json')
const style = require('../setting/console')


const {
    apiNoBg,
	apiSimi
} = JSON.parse(fs.readFileSync('./data/api-key.json'))

//! Require Handle MSG for Owner
// const rDev = require('./OnwerMsg')
// const { textMenu } = require('../)

function formatin(duit){
    let	reverse = duit.toString().split('').reverse().join('');
    let ribuan = reverse.match(/\d{1,3}/g);
    ribuan = ribuan.join('.').split('').reverse().join('');
    return ribuan;
}

const inArray = (needle, haystack) => {
    let length = haystack.length;
    for(let i = 0; i < length; i++) {
        if(haystack[i].id == needle) return i;
    }
    return false;
}

// ! Convert
const library = require('../test/convert/library')



module.exports = HandleMsg = async (RBot, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, chatId, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        var { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await RBot.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await RBot.getGroupAdmins(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
		const chats = (type === 'chat') ? body : (type === 'image' || type === 'video') ? caption : ''
		const pengirim = sender.id
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false

        // Bot Prefix
        body = (type === 'chat' && body.startsWith(prefix)) ? body : ((type === 'image' && caption || type === 'video' && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.trim().substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
		const argx = chats.slice(0).trim().split(/ +/).shift().toLowerCase()
        const isCmd = body.startsWith(prefix)
        const uaOverride = process.env.UserAgent
        const url = args.length !== 0 ? args[0] : ''
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
	    const isQuotedVideo = quotedMsg && quotedMsg.type === 'video'

		// [IDENTIFY]
		const isOwnerBot = ownerNumber.includes(pengirim)
        const isBanned = banned.includes(pengirim)
		const isSimi = simi.includes(chatId)
		const isNgegas = ngegas.includes(chatId)
		const isKasar = await cariKasar(chats)

        //! Custom Grup
        const isGroupList = groupList.includes(groupId)
        const groupName = (name || formattedTitle)
        const formatTime = moment(t * 1000).format('DD/MM/YY HH:mm:ss')
        const formatCommand = `${command} [${args.length}]`


        //! Group Admin Request Activation Bot
        if (command == 'reqbot' && isGroupAdmins){
            RBot.reply(from,"Permintaan akan di Acc 1 x 24 jam.",id)
            await RBot.sendText(ownerNumber, groupId)
            return style.bot(`REQ : ${groupId}`)
        }

        //! Owner Acc Req
        if (command == "acc" && isOwnerBot){
            const check = groupList.includes(args[0])
            if(args.length === 1){
                if(!check){
                    groupList.push(args[0])
                    fs.writeFileSync('./data/group-list.json', JSON.stringify(groupList))
                    await RBot.sendText(args[0],"[BOT] R-Bot sudah aktif")
                    await RBot.sendText(args[0],menuId.textMenu("members"))
                    return style.botAct('[☑] Success activated RBot')
                } else {
                    return RBot.reply(from,"[☑] RBot already running")
                }
            } else {
                await RBot.reply(from,"[✘] Wrong format text")
                return null
            }
        }

        // ! Owner Adding Group (Manual)
        if (command == 'addgrup' && isOwnerBot){
            if(isGroupList){
                RBot.sendText(from,"[BOT] R-Bot sudah aktif")
                return style.botAct('Activated in',groupName)
            } else {
                groupList.push(groupId)
                fs.writeFileSync('./data/group-list.json', JSON.stringify(groupList))
                RBot.sendText(from,"[BOT] R-Bot berhasil di Aktifkan")
                return style.botAct('Started in', groupName)
            }
        }
        if (command == 'delgrup' && isOwnerBot){
            if(!isGroupList){
                RBot.sendText(from,"[BOT] R-Bot sudah tidak aktif")
                return style.botNonAct('No Bot Active in', groupName)
            } else {
                let index = groupList.indexOf(groupId)
                groupList.splice(index,1)
                fs.writeFileSync('./data/group-list.json', JSON.stringify(groupList))
                RBot.sendText(from,"[BOT] R-Bot berhasil di Non-Aktifkan")
                return style.botNonAct('NonActive in', groupName)
            }
        }

        //! MSG from not Regist Group
        if (!isGroupList && isGroupMsg && isCmd) {
            return null
        }

            //! [BETA] Avoid Spam Message
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) {
            return style.spamChat(formatTime,formatCommand,'from',pushname);
        }
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) {
            return style.spamGroup(formatTime, formatCommand, 'from', pushname, 'in' ,groupName)
        }
            //! BadWord
        if(!isCmd && isKasar && isGroupMsg) {
            style.badWord(formatTime, formatCommand, 'from' , pushname, 'in', groupName)
        }
            //! EXE
        if (isCmd && !isGroupMsg) {
            style.exeChat(formatTime,formatCommand,'from', pushname)
        }
        if (isCmd && isGroupMsg) {
            style.exeGroup(formatTime, formatCommand,'from' , pushname, 'in', groupName)
        }

        //! [BETA] Avoid Spam Message
        msgFilter.addFilter(from)

	//! Filter Banned People
        if (isBanned) {
            return style.banPerson(formatTime,formatCommand,'from', pushname)
        }

		//! COMMAND
        switch (command) {
        // Menu and TnC
        case 'speed':
        case 'ping':
        case 'tes':
            await RBot.sendText(from, `Respon ${botName}: ${processTime(t, moment())} Second`)
            break
        case 'changelog' :
        case 'update' :
            await RBot.reply(from, menuId.textChangeLog(),id)
            break
        case 'tnc':
        case 'peraturan' :
        case 'aturan':
            await RBot.sendText(from, menuId.textTnC())
            break
        case 'menu':
        case 'help':
            await RBot.sendText(from, menuId.textMenu(pushname))
            .then(() => ((isGroupMsg) && (isGroupAdmins)) ? RBot.sendText(from, `Menu Admin Grup: *${prefix}menuadmin*`) : null)
            break
        case 'menuadmin':
            if (!isGroupMsg) return RBot.reply(from, '✘ Perintah ini hanya dapat digunakan didalam grup!', id)
            if (!isGroupAdmins) return RBot.reply(from, '✘ Perintah ini hanya dapat digunakan oleh admin grup!', id)
            await RBot.sendText(from, menuId.textAdmin())
            break
        case 'donate':
        case 'donasi':
            await RBot.sendText(from, menuId.textDonasi())
            break
        case 'botowner':
        case 'ownerbot' :
            await RBot.sendContact(from, ownerNumber)
            break
        case 'join':
            if (args.length == 0) return RBot.reply(from, `Jika ingin memasukkan ${botName} kedalam group, silahkan invite atau dengan\nketik ${prefix}join [link group]`, id)
            let linkgrup = body.slice(6)
            let islink = linkgrup.match(/(https:\/\/chat.whatsapp.com)/gi)
            let chekgrup = await RBot.inviteInfo(linkgrup)
            if (!islink) return RBot.reply(from, '✘ Format link salah', id)
            if (isOwnerBot) {
                await RBot.joinGroupViaLink(linkgrup)
                .then(async () => {
                    await RBot.sendText(from, `☑ Berhasil menambahkan ${botName}`)
                    console.log(chekgrup.id);
                        await RBot.sendText(chekgrup.id, `Hai members ${groupName}, untuk menggunakan fitur ${botName} silahkan ketik ${prefix}menu`)
                    })
            } else {
                let cgrup = await RBot.getAllGroups()
                if (cgrup.length > groupLimit) return RBot.reply(from, `Saat ini ${botName} sudah melebihi kapasitas untuk masuk kedalam group. \nGroup Now : ${groupLimit}`, id)
                if (cgrup.size < memberLimit) return RBot.reply(from, `Minimal anggota group harus lebih dari ${memberLimit} anggota`, id)
                await RBot.joinGroupViaLink(linkgrup)
                    .then(async () =>{
                        await RBot.reply(from, `☑ Berhasil menambahkan ${botName}`, id)
                    })
                    .catch(() => {
                        RBot.reply(from, '✘ Gagal!', id)
                    })
            }
            break
        case 'botstat': {
            const loadedMsg = await RBot.getAmountOfLoadedMessages()
            const chatIds = await RBot.getAllChatIds()
            const groups = await RBot.getAllGroups()
            RBot.sendText(from, `Status :\n- *${loadedMsg}* Loaded Messages\n- *${groups.length}* Group Chats\n- *${chatIds.length - groups.length}* Personal Chats\n- *${chatIds.length}* Total Chats`)
            break
        }

        // Sticker Creator
        case 'sticker':
        case 'stiker':
            if ((isMedia || isQuotedImage) && args.length === 0) {
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                RBot.sendImageAsSticker(from, imageBase64)
                .then(() => {
                    RBot.reply(from, '↳ Sukses dibuat',id)
                    style.msg(`Sticker Processed for ${processTime(t, moment())} Second`)
                })
            } else if (args[0] === 'nobg') {
                if (isMedia || isQuotedImage) {
                    try {
                    var mediaData = await decryptMedia(message, uaOverride)
                    var imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                    var base64img = imageBase64
                    var outFile = './media/noBg.png'
                    // kamu dapat mengambil api key dari website remove.bg dan ubahnya difolder settings/api.json
                    //! Take API KEY at remove.bg
                    var result = await removeBackgroundFromImageBase64({ base64img, apiKey: apiNoBg, size: 'auto', type: 'auto', outFile })
                    await fs.writeFile(outFile, result.base64img)
                    await RBot.sendImageAsSticker(from, `data:${mimetype};base64,${result.base64img}`)
                    } catch(err) {
                    console.log(err)
	   	                await RBot.reply(from, `Penggunaan fitur ${prefix}nobg hari ini sudah habis`, id)
                    }
                }
            } else if (args.length === 1) {
                if (!isUrl(url)) { await RBot.reply(from, '✘ link tidak valid', id) }
                RBot.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined)
                    ? RBot.sendText(from, '✘ Link tersebut tidak memuat gambar.')
                    : RBot.reply(from, '↳ Sukses dibuat')).then(() => style.msg(`\tSticker Processed for ${processTime(t, moment())} Second`))
            } else {
                await RBot.reply(from, `Untuk membuat sticker kamu harus mengirimkan gambar dengan caption ${prefix}sticker`, id)
            }
            break
        case 'stickergif':
        case 'stikergif':
        case 'gifsticker':
        case 'gifstiker':
            if (isMedia || isQuotedVideo) {
                if (mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10) {
                    var mediaData = await decryptMedia(message, uaOverride)
                    RBot.reply(from, '[⏳] Sticker di proses', id)
                    var filename = `./media/stickergif.${mimetype.split('/')[1]}`
                    await fs.writeFileSync(filename, mediaData)
                    await exec(`gify ${filename} ./media/stickergf.gif --fps=30 --scale=240:240`, async function (error, stdout, stderr) {
                        var gif = await fs.readFileSync('./media/stickergf.gif', { encoding: "base64" })
                        await RBot.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
                        .catch(() => {
                            RBot.reply(from, 'Maaf filenya terlalu besar!', id)
                        })
                    })
                  } else {
                    RBot.reply(from, `[✘] Maksimal gif 10 detik!`, id)
                   }
                } else {
		    RBot.reply(from, `[✘] Kirim gif dengan caption *${prefix}stickergif*`, id)
	        }
            break
        case 'stikergiphy':
        case 'stickergiphy':
            if (args.length !== 1) return RBot.reply(from, `[✘] Format pesan salah.\nKetik${prefix}stickergiphy <link_giphy>`, id)
            const isGiphy = url.match(new RegExp(/https?:\/\/(www\.)?giphy.com/, 'gi'))
            const isMediaGiphy = url.match(new RegExp(/https?:\/\/media.giphy.com\/media/, 'gi'))
            if (isGiphy) {
                const getGiphyCode = url.match(new RegExp(/(\/|\-)(?:.(?!(\/|\-)))+$/, 'gi'))
                if (!getGiphyCode) { return RBot.reply(from, '[✘] Gagal mengambil kode giphy', id) }
                const giphyCode = getGiphyCode[0].replace(/[-\/]/gi, '')
                const smallGifUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
                RBot.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    RBot.reply(from, '↳ Sukses dibuat')
                    style.msg(`\tSticker Processed for ${processTime(t, moment())} Second`)
                }).catch((err) => console.log(err))
            } else if (isMediaGiphy) {
                const gifUrl = url.match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
                if (!gifUrl) { return RBot.reply(from, '[✘] Gagal mengambil kode giphy', id) }
                const smallGifUrl = url.replace(gifUrl[0], 'giphy-downsized.gif')
                RBot.sendGiphyAsSticker(from, smallGifUrl)
                .then(() => {
                    RBot.reply(from, '↳ Sukses dibuat')
                    style.msg(`\tSticker Processed for ${processTime(t, moment())} Second`)
                })
                .catch(() => {
                    RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
                })
            } else {
                await RBot.reply(from, '[✘] Sticker harus dari link Giphy ', id)
            }
            break
        case 'meme':
            if ((isMedia || isQuotedImage) && args.length >= 2) {
                const top = arg.split('|')[0]
                const bottom = arg.split('|')[1]
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const getUrl = await uploadImages(mediaData, false)
                const ImageBase64 = await meme.custom(getUrl, top, bottom)
                RBot.sendFile(from, ImageBase64, 'image.png', '', null, true)
                    .then(() => {
                        RBot.reply(from, '↳ Sukses dibuat',id)
                    })
                    .catch(() => {
                        RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`)
                    })
            } else {
                await RBot.reply(from, `Cara penggunaan, kirim gambar dengan caption ${prefix}meme <teks_atas> | <teks_bawah>\ncontoh: ${prefix}meme teks atas | teks bawah`, id)
            }
            break
        case 'quotemaker':
            const qmaker = body.trim().split('|')
            if (qmaker.length >= 3) {
                const quotes = qmaker[1]
                const author = qmaker[2]
                //! Turn Off Choosing Background
                const theme = "random"
                RBot.reply(from, '[⏳] Sedang di proses', id)
                try {
                    const hasilqmaker = await images.quote(quotes, author, theme)
                    RBot.sendFileFromUrl(from, `${hasilqmaker}`, '', '↳ Sukses dibuat', id)
                } catch {
                    RBot.reply('[✘] Format pesan salah', id)
                }
            } else {
                RBot.reply(from, `Ketik ${prefix}quotemaker |<isi_quote>|<author>|\n\ncontoh: ${prefix}quotemaker |aku sayang kamu|-R-Bot|`)
            }
            break

            //! Turn OFF THIS FEATURE
        case 'nulis':
            if (args.length == 0) return RBot.reply(from, `Membuat bot menulis teks yang dikirim menjadi gambar\nPemakaian: ${prefix}nulis [teks]\n\ncontoh: ${prefix}nulis i love you 3000`, id)
            const nulisq = body.slice(7)
            const nulisp = await rugaapi.tulis(nulisq)
            await RBot.sendImage(from, `${nulisp}`, '', 'Nih...', id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break

        //Islam Command
        //! Thanks to ARUGA API
        case 'daftarsurah':
            try {
                axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah.json')
                .then((response) => {
                    let hehex = '╔〘 List Surah 〙\n'
                    for (let i = 0; i < response.data.data.length; i++) {
                        hehex += '╠ '
                        hehex += response.data.data[i].name.transliteration.id.toLowerCase() + '\n'
                            }
                        hehex += '╚〘 Thanks to ARUGA 〙'
                    RBot.reply(from, hehex, id)
                })
            } catch(err) {
                RBot.reply(from, err, id)
            }
            break
        case 'infosurah':
            if (args.length == 0) return RBot.reply(from, `*_${prefix}infosurah <nama surah>_*\nMenampilkan informasi lengkap mengenai surah tertentu. Contoh : ${prefix}infosurah al-baqarah`, message.id)
                var responseh = await axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah.json')
                var { data } = responseh.data
                var idx = data.findIndex(function(post, index) {
                  if((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase())||(post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                    return true;
                });
                var pesan = ""
                pesan = pesan + "Nama : "+ data[idx].name.transliteration.id + "\n" + "Asma : " +data[idx].name.short+"\n"+"Arti : "+data[idx].name.translation.id+"\n"+"Jumlah ayat : "+data[idx].numberOfVerses+"\n"+"Nomor surah : "+data[idx].number+"\n"+"Jenis : "+data[idx].revelation.id+"\n"+"Keterangan : "+data[idx].tafsir.id
                RBot.reply(from, pesan, message.id)
              break
        case 'surah':
            if (args.length == 0) return RBot.reply(from, `*_${prefix}surah <nama surah> <ayat>_*\nMenampilkan ayat Al-Quran tertentu beserta terjemahannya dalam bahasa Indonesia. Contoh penggunaan : ${prefix}surah al-baqarah 1\n\n*_${prefix}surah <nama surah> <ayat> en/id_*\nMenampilkan ayat Al-Quran tertentu beserta terjemahannya dalam bahasa Inggris / Indonesia. Contoh penggunaan : ${prefix}surah al-baqarah 1 id`, message.id)
                var responseh = await axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah.json')
                var { data } = responseh.data
                var idx = data.findIndex(function(post, index) {
                  if((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase())||(post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                    return true;
                });
                nmr = data[idx].number
                if(!isNaN(nmr)) {
                  var responseh2 = await axios.get('https://api.quran.sutanlab.id/surah/'+nmr+"/"+args[1])
                  var {data} = responseh2.data
                  var last = function last(array, n) {
                    if (array == null) return void 0;
                    if (n == null) return array[array.length - 1];
                    return array.slice(Math.max(array.length - n, 0));
                  };
                  bhs = last(args)
                  pesan = ""
                  pesan = pesan + data.text.arab + "\n\n"
                  if(bhs == "en") {
                    pesan = pesan + data.translation.en
                  } else {
                    pesan = pesan + data.translation.id
                  }
                  pesan = pesan + "\n\n(Q.S. "+data.surah.name.transliteration.id+":"+args[1]+")"
                  RBot.reply(from, pesan, message.id)
                }
              break
        case 'tafsir':
            if (args.length == 0) return RBot.reply(from, `*_${prefix}tafsir <nama surah> <ayat>_*\nMenampilkan ayat Al-Quran tertentu beserta terjemahan dan tafsirnya dalam bahasa Indonesia. Contoh penggunaan : ${prefix}tafsir al-baqarah 1`, message.id)
                var responsh = await axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah.json')
                var {data} = responsh.data
                var idx = data.findIndex(function(post, index) {
                  if((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase())||(post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                    return true;
                });
                nmr = data[idx].number
                if(!isNaN(nmr)) {
                  var responsih = await axios.get('https://api.quran.sutanlab.id/surah/'+nmr+"/"+args[1])
                  var {data} = responsih.data
                  pesan = ""
                  pesan = pesan + "Tafsir Q.S. "+data.surah.name.transliteration.id+":"+args[1]+"\n\n"
                  pesan = pesan + data.text.arab + "\n\n"
                  pesan = pesan + "_" + data.translation.id + "_" + "\n\n" +data.tafsir.id.long
                  RBot.reply(from, pesan, message.id)
              }
              break
        case 'alaudio':
            if (args.length == 0) return RBot.reply(from, `*_${prefix}ALaudio <nama surah>_*\nMenampilkan tautan dari audio surah tertentu. Contoh penggunaan : ${prefix}ALaudio al-fatihah\n\n*_${prefix}ALaudio <nama surah> <ayat>_*\nMengirim audio surah dan ayat tertentu beserta terjemahannya dalam bahasa Indonesia. Contoh penggunaan : ${prefix}ALaudio al-fatihah 1\n\n*_${prefix}ALaudio <nama surah> <ayat> en_*\nMengirim audio surah dan ayat tertentu beserta terjemahannya dalam bahasa Inggris. Contoh penggunaan : ${prefix}ALaudio al-fatihah 1 en`, message.id)
              ayat = "ayat"
              bhs = ""
                var responseh = await axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah.json')
                var surah = responseh.data
                var idx = surah.data.findIndex(function(post, index) {
                  if((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase())||(post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                    return true;
                });
                nmr = surah.data[idx].number
                if(!isNaN(nmr)) {
                  if(args.length > 2) {
                    ayat = args[1]
                  }
                  if (args.length == 2) {
                    var last = function last(array, n) {
                      if (array == null) return void 0;
                      if (n == null) return array[array.length - 1];
                      return array.slice(Math.max(array.length - n, 0));
                    };
                    ayat = last(args)
                  }
                  pesan = ""
                  if(isNaN(ayat)) {
                    var responsih2 = await axios.get('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/islam/surah/'+nmr+'.json')
                    var {name, name_translations, number_of_ayah, number_of_surah,  recitations} = responsih2.data
                    pesan = pesan + "Audio Quran Surah ke-"+number_of_surah+" "+name+" ("+name_translations.ar+") "+ "dengan jumlah "+ number_of_ayah+" ayat\n"
                    pesan = pesan + "Dilantunkan oleh "+recitations[0].name+" : "+recitations[0].audio_url+"\n"
                    pesan = pesan + "Dilantunkan oleh "+recitations[1].name+" : "+recitations[1].audio_url+"\n"
                    pesan = pesan + "Dilantunkan oleh "+recitations[2].name+" : "+recitations[2].audio_url+"\n"
                    RBot.reply(from, pesan, message.id)
                  } else {
                    var responsih2 = await axios.get('https://api.quran.sutanlab.id/surah/'+nmr+"/"+ayat)
                    var {data} = responsih2.data
                    var last = function last(array, n) {
                      if (array == null) return void 0;
                      if (n == null) return array[array.length - 1];
                      return array.slice(Math.max(array.length - n, 0));
                    };
                    bhs = last(args)
                    pesan = ""
                    pesan = pesan + data.text.arab + "\n\n"
                    if(bhs == "en") {
                      pesan = pesan + data.translation.en
                    } else {
                      pesan = pesan + data.translation.id
                    }
                    pesan = pesan + "\n\n(Q.S. "+data.surah.name.transliteration.id+":"+args[1]+")"
                    await RBot.sendFileFromUrl(from, data.audio.secondary[0])
                    await RBot.reply(from, pesan, message.id)
                  }
              }
              break
        case 'jsolat':
            if (args.length == 0) return RBot.reply(from, `Melihat jadwal solat di setiap daerah \nketik: ${prefix}jsolat [namadaerah]\n\nuntuk list daerah yang ada\nketik: ${prefix}daerah`, id)
            const solatx = body.slice(8)
            const solatj = await rugaapi.jadwaldaerah(solatx)
            await RBot.reply(from, solatj, id)
            .catch(() => {
                RBot.reply(from, `Masukkan nama daerah. contoh ${prefix}jsolat Kudus`, id)
            })
            break
        case 'daerah':
            const daerahq = await rugaapi.daerah()
            await RBot.reply(from, daerahq, id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        //Media
        case 'instagram':
            if (args.length == 0) return RBot.reply(from, `Untuk mendownload gambar atau video dari instagram\nketik: ${prefix}instagram [link_ig]`, id)
            const instag = await rugaapi.insta(args[0])
            await RBot.sendFileFromUrl(from, instag, '', '', id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'ytmp3':
            if (args.length == 0) return RBot.reply(from, `Untuk mendownload lagu dari youtube\nketik: ${prefix}ytmp3 [link_yt]`, id)
            rugaapi.ytmp3(args[0])
            .then(async(res) => {
				if (res.status == 'error') return RBot.sendFileFromUrl(from, `${res.link}`, '', `${res.judul}`, id)
				if (res.status == 'filesize') return RBot.sendFileFromUrl(from, `${res.link}`, '', `${res.judul}`, id)
				await RBot.sendFileFromUrl(from, `${res.thumb}`, '', `Youtube ditemukan\n\nJudul: ${res.judul}\n\nUkuran: ${res.size}\n\nAudio sedang dikirim`, id)
				await RBot.sendFileFromUrl(from, `${res.link}`, '', '', id)
			})
            break
        case 'ytmp4':
            if (args.length == 0) return RBot.reply(from, `Untuk mendownload video dari youtube\nketik: ${prefix}ytmp3 [link_yt]`)
            rugaapi.ytmp4(args[0])
            .then(async(res) => {
				if (res.status == 'error') return RBot.sendFileFromUrl(from, `${res.link}`, '', `${res.judul}`, id)
				if (res.status == 'filesize') return RBot.sendFileFromUrl(from, `${res.link}`, '', `${res.judul}`, id)
				await RBot.sendFileFromUrl(from, `${res.thumb}`, '', `Youtube ditemukan\n\nJudul: ${res.judul}\n\nUkuran: ${res.size}\n\nVideo sedang dikirim`, id)
				await RBot.sendFileFromUrl(from, `${res.link}`, '', '', id)
			})
            break

		//Primbon Menu
		case 'artinama':
			if (args.length == 0) return RBot.reply(from, `Untuk mengetahui arti nama seseorang\nketik ${prefix}artinama Namanya`, id)
            rugaapi.artinama(body.slice(10))
			.then(async(res) => {
				await RBot.reply(from, `Arti : ${res}`, id)
			})
			break
		case 'cekjodoh':
			if (args.length !== 2) return RBot.reply(from, `Untuk mengecek jodoh melalui nama\nketik: ${prefix}cekjodoh nama pasangan\n\ncontoh: ${prefix}cekjodoh aku kamu\n\nhanya bisa pakai nama panggilan (satu kata)`)
			rugaapi.cekjodoh(args[0],args[1])
			.then(async(res) => {
				await RBot.sendFileFromUrl(from, `${res.link}`, '', `${res.text}`, id)
			})
			break

        // Random Kata
        case 'fakta':
            fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/faktaunix.txt')
            .then(res => res.text())
            .then(body => {
                let splitnix = body.split('\n')
                let randomnix = splitnix[Math.floor(Math.random() * splitnix.length)]
                RBot.reply(from, randomnix, id)
            })
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'katabijak':
            fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/katabijax.txt')
            .then(res => res.text())
            .then(body => {
                let splitbijak = body.split('\n')
                let randombijak = splitbijak[Math.floor(Math.random() * splitbijak.length)]
                RBot.reply(from, randombijak, id)
            })
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'pantun':
            fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/pantun.txt')
            .then(res => res.text())
            .then(body => {
                let splitpantun = body.split('\n')
                let randompantun = splitpantun[Math.floor(Math.random() * splitpantun.length)]
                RBot.reply(from, randompantun.replace(/aruga-line/g,"\n"), id)
            })
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'quote':
            const quotex = await rugaapi.quote()
            await RBot.reply(from, quotex, id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break

        //Random Images
        case 'anime':
            if (args.length == 0) return RBot.reply(from, `Untuk menggunakan ${prefix}anime\nSilahkan ketik: ${prefix}anime [query]\nContoh: ${prefix}anime random\n\nquery yang tersedia:\nrandom, waifu, husbu, neko`, id)
            if (args[0] == 'random' || args[0] == 'waifu' || args[0] == 'husbu' || args[0] == 'neko') {
                fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/anime/' + args[0] + '.txt')
                .then(res => res.text())
                .then(body => {
                    let randomnime = body.split('\n')
                    let randomnimex = randomnime[Math.floor(Math.random() * randomnime.length)]
                    RBot.sendFileFromUrl(from, randomnimex, '', 'Nee..', id)
                })
                .catch(() => {
                    RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
                })
            } else {
                RBot.reply(from, `Maaf query tidak tersedia. Silahkan ketik ${prefix}anime untuk melihat list query`)
            }
            break
        case 'kpop':
            if (args.length == 0) return RBot.reply(from, `Untuk menggunakan ${prefix}kpop\nSilahkan ketik: ${prefix}kpop [query]\nContoh: ${prefix}kpop bts\n\nquery yang tersedia:\nblackpink, exo, bts`, id)
            if (args[0] == 'blackpink' || args[0] == 'exo' || args[0] == 'bts') {
                fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/kpop/' + args[0] + '.txt')
                .then(res => res.text())
                .then(body => {
                    let randomkpop = body.split('\n')
                    let randomkpopx = randomkpop[Math.floor(Math.random() * randomkpop.length)]
                    RBot.sendFileFromUrl(from, randomkpopx, '', 'Nee..', id)
                })
                .catch(() => {
                    RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
                })
            } else {
                RBot.reply(from, `Maaf query tidak tersedia. Silahkan ketik ${prefix}kpop untuk melihat list query`)
            }
            break
        case 'memes':
            const randmeme = await meme.random()
            RBot.sendFileFromUrl(from, randmeme, '', '', id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break

        // Search Any
        case 'images':
            if (args.length == 0) return RBot.reply(from, `Untuk mencari gambar di pinterest\nketik: ${prefix}images [search]\ncontoh: ${prefix}images naruto`, id)
            const cariwall = body.slice(8)
            const hasilwall = await images.fdci(cariwall)
            await RBot.sendFileFromUrl(from, hasilwall, '', '', id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'sreddit':
            if (args.length == 0) return RBot.reply(from, `Untuk mencari gambar di sub reddit\nketik: ${prefix}sreddit [search]\ncontoh: ${prefix}sreddit naruto`, id)
            const carireddit = body.slice(9)
            const hasilreddit = await images.sreddit(carireddit)
            await RBot.sendFileFromUrl(from, hasilreddit, '', '', id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
	    break
        case 'resep':
            if (args.length == 0) return RBot.reply(from, `Untuk mencari resep makanan\nCaranya ketik: ${prefix}resep [search]\n\ncontoh: ${prefix}resep tahu`, id)
            const cariresep = body.slice(7)
            const hasilresep = await resep.resep(cariresep)
            await RBot.reply(from, hasilresep + '\n\nIni kak resep makanannya..', id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'nekopoi':
             rugapoi.getLatest()
            .then((result) => {
                rugapoi.getVideo(result.link)
                .then((res) => {
                    let heheq = '\n'
                    for (let i = 0; i < res.links.length; i++) {
                        heheq += `${res.links[i]}\n`
                    }
                    RBot.reply(from, `Title: ${res.title}\n\nLink:\n${heheq}\nmasih tester bntr :v`)
                })
            })
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'stalkig':
            if (args.length == 0) return RBot.reply(from, `Untuk men-stalk akun instagram seseorang\nketik ${prefix}stalkig [username]\ncontoh: ${prefix}stalkig ini.arga`, id)
            const igstalk = await rugaapi.stalkig(args[0])
            const igstalkpict = await rugaapi.stalkigpict(args[0])
            await RBot.sendFileFromUrl(from, igstalkpict, '', igstalk, id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'wiki':
            if (args.length == 0) return RBot.reply(from, `Untuk mencari suatu kata dari wikipedia\nketik: ${prefix}wiki [kata]`, id)
            const wikip = body.slice(6)
            const wikis = await rugaapi.wiki(wikip)
            await RBot.reply(from, wikis, id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'cuaca':
            if (args.length == 0) return RBot.reply(from, `Untuk melihat cuaca pada suatu daerah\nketik: ${prefix}cuaca [daerah]`, id)
            const cuacaq = body.slice(7)
            const cuacap = await rugaapi.cuaca(cuacaq)
            await RBot.reply(from, cuacap, id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
	case 'lirik':
		if (args.length == 0) return RBot.reply(from, `Untuk mencari lirik dari sebuah lagu\bketik: ${prefix}lirik [judul_lagu]`, id)
		rugaapi.lirik(body.slice(7))
		.then(async (res) => {
			await RBot.reply(from, `Lirik Lagu: ${body.slice(7)}\n\n${res}`, id)
		})
		break
        case 'chord':
            if (args.length == 0) return RBot.reply(from, `Untuk mencari lirik dan chord dari sebuah lagu\bketik: ${prefix}chord [judul_lagu]`, id)
            const chordq = body.slice(7)
            const chordp = await rugaapi.chord(chordq)
            await RBot.reply(from, chordp, id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'ss': //jika error silahkan buka file di folder settings/api.json dan ubah apiSS 'API-KEY' yang kalian dapat dari website https://apiflash.com/
            if (args.length == 0) return RBot.reply(from, `Membuat bot men-screenshot sebuah web\n\nPemakaian: ${prefix}ss [url]\n\ncontoh: ${prefix}ss http://google.com`, id)
            const scrinshit = await meme.ss(args[0])
            await RBot.sendFile(from, scrinshit, 'ss.jpg', 'cekrek', id)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'play'://silahkan kalian custom sendiri jika ada yang ingin diubah
            if (args.length == 0) return RBot.reply(from, `Untuk mencari lagu dari youtube\n\nPenggunaan: ${prefix}play judul lagu`, id)
            axios.get(`https://arugaytdl.herokuapp.com/search?q=${body.slice(6)}`)
            .then(async (res) => {
                await RBot.sendFileFromUrl(from, `${res.data[0].thumbnail}`, ``, `Lagu ditemukan\n\nJudul: ${res.data[0].title}\nDurasi: ${res.data[0].duration}detik\nUploaded: ${res.data[0].uploadDate}\nView: ${res.data[0].viewCount}\n\nsedang dikirim`, id)
                axios.get(`https://arugaz.herokuapp.com/api/yta?url=https://youtu.be/${res.data[0].id}`)
                .then(async(rest) => {
					if (Number(rest.data.filesize.split(' MB')[0]) >= 10.00) return RBot.reply(from, 'Maaf ukuran file terlalu besar!')
                    await RBot.sendPtt(from, `${rest.data.result}`, id)
                })
                .catch(() => {
                    RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
                })
            })
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
        case 'whatanime':
            if (isMedia && type === 'image' || quotedMsg && quotedMsg.type === 'image') {
                if (isMedia) {
                    var mediaData = await decryptMedia(message, uaOverride)
                } else {
                    var mediaData = await decryptMedia(quotedMsg, uaOverride)
                }
                const fetch = require('node-fetch')
                const imgBS4 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                RBot.reply(from, 'Searching....', id)
                fetch('https://trace.moe/api/search', {
                    method: 'POST',
                    body: JSON.stringify({ image: imgBS4 }),
                    headers: { "Content-Type": "application/json" }
                })
                .then(respon => respon.json())
                .then(resolt => {
                	if (resolt.docs && resolt.docs.length <= 0) {
                		RBot.reply(from, 'Maaf, saya tidak tau ini anime apa, pastikan gambar yang akan di Search tidak Buram/Kepotong', id)
                	}
                    const { is_adult, title, title_chinese, title_romaji, title_english, episode, similarity, filename, at, tokenthumb, anilist_id } = resolt.docs[0]
                    teks = ''
                    if (similarity < 0.92) {
                    	teks = '*Saya memiliki keyakinan rendah dalam hal ini* :\n\n'
                    }
                    teks += `➸ *Title Japanese* : ${title}\n➸ *Title chinese* : ${title_chinese}\n➸ *Title Romaji* : ${title_romaji}\n➸ *Title English* : ${title_english}\n`
                    teks += `➸ *R-18?* : ${is_adult}\n`
                    teks += `➸ *Eps* : ${episode.toString()}\n`
                    teks += `➸ *Kesamaan* : ${(similarity * 100).toFixed(1)}%\n`
                    var video = `https://media.trace.moe/video/${anilist_id}/${encodeURIComponent(filename)}?t=${at}&token=${tokenthumb}`;
                    RBot.sendFileFromUrl(from, video, 'anime.mp4', teks, id).catch(() => {
                        RBot.reply(from, teks, id)
                    })
                })
                .catch(() => {
                    RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
                })
            } else {
				RBot.reply(from, `Maaf format salah\n\nSilahkan kirim foto dengan caption ${prefix}whatanime\n\nAtau reply foto dengan caption ${prefix}whatanime`, id)
			}
            break

        // Other Command
        case 'resi':
            if (args.length !== 2) return RBot.reply(from, `Maaf, format pesan salah.\nSilahkan ketik pesan dengan ${prefix}resi <kurir> <no_resi>\n\nKurir yang tersedia:\njne, pos, tiki, wahana, jnt, rpx, sap, sicepat, pcp, jet, dse, first, ninja, lion, idl, rex`, id)
            const kurirs = ['jne', 'pos', 'tiki', 'wahana', 'jnt', 'rpx', 'sap', 'sicepat', 'pcp', 'jet', 'dse', 'first', 'ninja', 'lion', 'idl', 'rex']
            if (!kurirs.includes(args[0])) return RBot.sendText(from, `Maaf, jenis ekspedisi pengiriman tidak didukung layanan ini hanya mendukung ekspedisi pengiriman ${kurirs.join(', ')} Tolong periksa kembali.`)
            console.log('Memeriksa No Resi', args[1], 'dengan ekspedisi', args[0])
            cekResi(args[0], args[1]).then((result) => RBot.sendText(from, result))
            break
        case 'tts':
            if (args.length == 0) return RBot.reply(from, `Mengubah teks menjadi sound (google voice)\nketik: ${prefix}tts <kode_bahasa> <teks>\ncontoh : ${prefix}tts id halo\nuntuk kode bahasa cek disini : https://anotepad.com/note/read/5xqahdy8`)
            const ttsGB = require('node-gtts')(args[0])
            const dataText = body.slice(8)
                if (dataText === '') return RBot.reply(from, 'apa teksnya syg..', id)
                try {
                    ttsGB.save('./media/tts.mp3', dataText, function () {
                    RBot.sendPtt(from, './media/tts.mp3', id)
                    })
                } catch (err) {
                    RBot.reply(from, err, id)
                }
            break
        case 'translate':
            if (args.length != 1) return RBot.reply(from, `Maaf, format pesan salah.\nSilahkan reply sebuah pesan dengan caption ${prefix}translate <kode_bahasa>\ncontoh ${prefix}translate id`, id)
            if (!quotedMsg) return RBot.reply(from, `Maaf, format pesan salah.\nSilahkan reply sebuah pesan dengan caption ${prefix}translate <kode_bahasa>\ncontoh ${prefix}translate id`, id)
            const quoteText = quotedMsg.type == 'chat' ? quotedMsg.body : quotedMsg.type == 'image' ? quotedMsg.caption : ''
            translate(quoteText, args[0])
                .then((result) => RBot.sendText(from, result))
                .catch(() => RBot.sendText(from, 'Error, Kode bahasa salah.'))
            break
		case 'covidindo':
			rugaapi.covidindo()
			.then(async (res) => {
				await RBot.reply(from, `${res}`, id)
			})
			break
        case 'ceklokasi':
            if (quotedMsg.type !== 'location') return RBot.reply(from, `Maaf, format pesan salah.\nKirimkan lokasi dan reply dengan caption ${prefix}ceklokasi`, id)
            console.log(`Request Status Zona Penyebaran Covid-19 (${quotedMsg.lat}, ${quotedMsg.lng}).`)
            const zoneStatus = await getLocationData(quotedMsg.lat, quotedMsg.lng)
            if (zoneStatus.kode !== 200) RBot.sendText(from, 'Maaf, Terjadi error ketika memeriksa lokasi yang anda kirim.')
            let datax = ''
            for (let i = 0; i < zoneStatus.data.length; i++) {
                const { zone, region } = zoneStatus.data[i]
                const _zone = zone == 'green' ? 'Hijau* (Aman) \n' : zone == 'yellow' ? 'Kuning* (Waspada) \n' : 'Merah* (Bahaya) \n'
                datax += `${i + 1}. Kel. *${region}* Berstatus *Zona ${_zone}`
            }
            const text = `*CEK LOKASI PENYEBARAN COVID-19*\nHasil pemeriksaan dari lokasi yang anda kirim adalah *${zoneStatus.status}* ${zoneStatus.optional}\n\nInformasi lokasi terdampak disekitar anda:\n${datax}`
            RBot.sendText(from, text)
            break
        case 'shortlink':
            if (args.length == 0) return RBot.reply(from, `ketik ${prefix}shortlink <url>`, id)
            if (!isUrl(args[0])) return RBot.reply(from, 'Maaf, url yang kamu kirim tidak valid.', id)
            const shortlink = await urlShortener(args[0])
            await RBot.sendText(from, shortlink)
            .catch(() => {
                RBot.reply(from, `[✘] Maaf, ada yang error! Silahkan hubungi owner ${prefix}botowner`, id)
            })
            break
		case 'bapakfont':
			if (args.length == 0) return RBot.reply(from, `Mengubah kalimat menjadi alayyyyy\n\nketik ${prefix}bapakfont kalimat`, id)
			rugaapi.bapakfont(body.slice(11))
			.then(async(res) => {
				await RBot.reply(from, `${res}`, id)
			})
			break

		//Fun Menu
		case 'klasmen':
			if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
			const klasemen = db.get('group').filter({id: groupId}).map('members').value()[0]
            let urut = Object.entries(klasemen).map(([key, val]) => ({id: key, ...val})).sort((a, b) => b.denda - a.denda);
            let textKlas = "*Klasemen Denda Sementara*\n"
            let i = 1;
            urut.forEach((klsmn) => {
            textKlas += i+". @"+klsmn.id.replace('@c.us', '')+" ➤ Rp"+formatin(klsmn.denda)+"\n"
            i++
            });
            await RBot.sendTextWithMentions(from, textKlas)
			break

        // Group Commands (group admin only)
	    case 'add':
            if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
            if (!isGroupAdmins) return RBot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return RBot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
	        if (args.length !== 1) return RBot.reply(from, `Untuk menggunakan ${prefix}add\nPenggunaan: ${prefix}add <nomor>\ncontoh: ${prefix}add 628xxx`, id)
                try {
                    await RBot.addParticipant(from,`${args[0]}@c.us`)
                } catch {
                    RBot.reply(from, 'Tidak dapat menambahkan target', id)
                }
            break
        case 'kick':
            if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
            if (!isGroupAdmins) return RBot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return RBot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length === 0) return RBot.reply(from, 'Maaf, format pesan salah.\nSilahkan tag satu atau lebih orang yang akan dikeluarkan', id)
            if (mentionedJidList[0] === botNumber) return await RBot.reply(from, 'Maaf, format pesan salah.\nTidak dapat mengeluarkan akun bot sendiri', id)
            await RBot.sendTextWithMentions(from, `Request diterima, mengeluarkan:\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return await RBot.sendText(from, 'Gagal, kamu tidak bisa mengeluarkan admin grup.')
                await RBot.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case 'promote':
            if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
            if (!isGroupAdmins) return RBot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return RBot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length !== 1) return RBot.reply(from, 'Maaf, hanya bisa mempromote 1 user', id)
            if (groupAdmins.includes(mentionedJidList[0])) return await RBot.reply(from, 'Maaf, user tersebut sudah menjadi admin.', id)
            if (mentionedJidList[0] === botNumber) return await RBot.reply(from, 'Maaf, format pesan salah.\nTidak dapat mempromote akun bot sendiri', id)
            await RBot.promoteParticipant(groupId, mentionedJidList[0])
            await RBot.sendTextWithMentions(from, `Request diterima, menambahkan @${mentionedJidList[0].replace('@c.us', '')} sebagai admin.`)
            break
        case 'demote':
            if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
            if (!isGroupAdmins) return RBot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return RBot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            if (mentionedJidList.length !== 1) return RBot.reply(from, 'Maaf, hanya bisa mendemote 1 user', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return await RBot.reply(from, 'Maaf, user tersebut belum menjadi admin.', id)
            if (mentionedJidList[0] === botNumber) return await RBot.reply(from, 'Maaf, format pesan salah.\nTidak dapat mendemote akun bot sendiri', id)
            await RBot.demoteParticipant(groupId, mentionedJidList[0])
            await RBot.sendTextWithMentions(from, `Request diterima, menghapus jabatan @${mentionedJidList[0].replace('@c.us', '')}.`)
            break
        case 'bye':
            if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
            if (!isGroupAdmins) return RBot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            RBot.sendText(from, 'Good bye... ( ⇀‸↼‶ )').then(() => RBot.leaveGroup(groupId))
            break
        case 'del':
            if (!isGroupAdmins) return RBot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!quotedMsg) return RBot.reply(from, `Maaf, format pesan salah silahkan.\nReply pesan bot dengan caption ${prefix}del`, id)
            if (!quotedMsgObj.fromMe) return RBot.reply(from, `Maaf, format pesan salah silahkan.\nReply pesan bot dengan caption ${prefix}del`, id)
            RBot.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        case 'tagall':
        case 'everyone':
            if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
            if (!isGroupAdmins) return RBot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            const groupMem = await RBot.getGroupMembers(groupId)
            let hehex = `╔ ⋘⋙ *Hi ${groupName}* ⋘⋙\n`
            for (let i = 0; i < groupMem.length; i++) {
                hehex += '╠'
                hehex += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
            }
            hehex += '╚ ⋙ *R - B O T* ⋘ '
            await RBot.sendTextWithMentions(from, hehex)
            break
		case 'simisimi':
			if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
			RBot.reply(from, `Untuk mengaktifkan simi-simi pada Group Chat\n\nPenggunaan\n${prefix}simi on --mengaktifkan\n${prefix}simi off --nonaktifkan\n`, id)
			break
		case 'simi':
			if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
            if (!isGroupAdmins) return RBot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
			if (args.length !== 1) return RBot.reply(from, `Untuk mengaktifkan simi-simi pada Group Chat\n\nPenggunaan\n${prefix}simi on --mengaktifkan\n${prefix}simi off --nonaktifkan\n`, id)
			if (args[0] == 'on') {
				simi.push(chatId)
				fs.writeFileSync('./settings/simi.json', JSON.stringify(simi))
                RBot.reply(from, 'Mengaktifkan bot simi-simi!', id)
			} else if (args[0] == 'off') {
				let inxx = simi.indexOf(chatId)
				simi.splice(inxx, 1)
				fs.writeFileSync('./settings/simi.json', JSON.stringify(simi))
				RBot.reply(from, 'Menonaktifkan bot simi-simi!', id)
			} else {
				RBot.reply(from, `Untuk mengaktifkan simi-simi pada Group Chat\n\nPenggunaan\n${prefix}simi on --mengaktifkan\n${prefix}simi off --nonaktifkan\n`, id)
			}
			break
		case 'katakasar':
			if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
			RBot.reply(from, `Untuk mengaktifkan Fitur Kata Kasar pada Group Chat\n\nApasih kegunaan Fitur Ini? Apabila seseorang mengucapkan kata kasar akan mendapatkan denda\n\nPenggunaan\n${prefix}kasar on --mengaktifkan\n${prefix}kasar off --nonaktifkan\n\n${prefix}reset --reset jumlah denda`, id)
			break
		case 'kasar':
			if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
            if (!isGroupAdmins) return RBot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
			if (args.length !== 1) return RBot.reply(from, `Untuk mengaktifkan Fitur Kata Kasar pada Group Chat\n\nApasih kegunaan Fitur Ini? Apabila seseorang mengucapkan kata kasar akan mendapatkan denda\n\nPenggunaan\n${prefix}kasar on --mengaktifkan\n${prefix}kasar off --nonaktifkan\n\n${prefix}reset --reset jumlah denda`, id)
			if (args[0] == 'on') {
				ngegas.push(chatId)
				fs.writeFileSync('./data/kasar.json', JSON.stringify(ngegas))
				RBot.reply(from, 'Fitur Anti Kasar sudah di Aktifkan', id)
			} else if (args[0] == 'off') {
				let nixx = ngegas.indexOf(chatId)
				ngegas.splice(nixx, 1)
				fs.writeFileSync('./data/kasar.json', JSON.stringify(ngegas))
				RBot.reply(from, 'Fitur Anti Kasar sudah di non-Aktifkan', id)
			} else {
				RBot.reply(from, `Untuk mengaktifkan Fitur Kata Kasar pada Group Chat\n\napasih itu? fitur apabila seseorang mengucapkan kata kasar akan mendapatkan denda\n\nPenggunaan\n${prefix}kasar on --mengaktifkan\n${prefix}kasar off --nonaktifkan\n\n${prefix}reset --reset jumlah denda`, id)
			}
			break
		case 'reset':
			if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
            if (!isGroupAdmins) return RBot.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
			const reset = db.get('group').find({ id: groupId }).assign({ members: []}).write()
            if(reset){
				await RBot.sendText(from, "Klasemen telah direset.")
            }
			break

        //Owner Group
        case 'kickall': //mengeluarkan semua member
        if (!isGroupMsg) return RBot.reply(from, 'Perintah ini hanya dapat dilakukan dalam grup!', id)
        let isOwner = chat.groupMetadata.owner == pengirim
        if (!isOwner) return RBot.reply(from, 'Maaf, perintah ini hanya dapat dipakai oleh owner grup!', id)
        if (!isBotGroupAdmins) return RBot.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
            const allMem = await RBot.getGroupMembers(groupId)
            for (let i = 0; i < allMem.length; i++) {
                if (groupAdmins.includes(allMem[i].id)) {

                } else {
                    await RBot.removeParticipant(groupId, allMem[i].id)
                }
            }
            RBot.reply(from, 'Success kick all member', id)
        break

        //Owner Bot
        case 'ban':
            if (!isOwnerBot) return RBot.reply(from, '[✘] Perintah untuk R-Dev', id)
            if (args.length == 0) return RBot.reply(from, `Format : ban @tag +1 (GROUP), ban numTarget (Personal)`, id)
            if (args[0] == 'add') {
                banned.push(args[1]+'@c.us')
                fs.writeFileSync('./data/banned.json', JSON.stringify(banned))
                RBot.reply(from, '✅ Success banned target!')
            } else
            if (args[0] == 'del') {
                let xnxx = banned.indexOf(args[1]+'@c.us')
                banned.splice(xnxx,1)
                fs.writeFileSync('./data/banned.json', JSON.stringify(banned))
                RBot.reply(from, '✅ Success unbanned target!')
            } else {
             for (let i = 0; i < mentionedJidList.length; i++) {
                banned.push(mentionedJidList[i])
                fs.writeFileSync('./data/banned.json', JSON.stringify(banned))
                RBot.reply(from, '✅ Success ban target!', id)
                }
            }
            break
        case 'bc': //untuk broadcast atau promosi
            if (!isOwnerBot) return RBot.reply(from, '[✘] Perintah untuk R-Dev!', id)
            if (args.length == 0) return RBot.reply(from, `Untuk broadcast ke semua chat ketik:\n${prefix}bc [isi chat]`)
            let msg = body.slice(4)
            const chatz = await RBot.getAllChatIds()
            for (let idk of chatz) {
                var cvk = await RBot.getChatById(idk)
                if (!cvk.isReadOnly) RBot.sendText(idk, `[ *R - BOT* ]\n\n${msg}`)
                if (cvk.isReadOnly) RBot.sendText(idk, `〘 *R - DEV 〙\n\n${msg}`)
            }
            RBot.reply(from, '✅ Broadcast Success!', id)
            break
        case 'leaveall': //mengeluarkan bot dari semua group serta menghapus chatnya
            if (!isOwnerBot) return RBot.reply(from, '[✘] Perintah untuk R-Dev', id)
            const allChatz = await RBot.getAllChatIds()
            const allGroupz = await RBot.getAllGroups()
            for (let gclist of allGroupz) {
                await RBot.sendText(gclist.contact.id, `Maaf bot sedang pembersihan, total chat aktif : ${allChatz.length}`)
                await RBot.leaveGroup(gclist.contact.id)
                await RBot.deleteChat(gclist.contact.id)
            }
            RBot.reply(from, '✅ Leave all group, Success!', id)
            break
        case 'clearall': //menghapus seluruh pesan diakun bot
            if (!isOwnerBot) return RBot.reply(from, '[✘] Perintah untuk R-Dev', id)
            const allChatx = await RBot.getAllChats()
            for (let dchat of allChatx) {
                await RBot.deleteChat(dchat.id)
            }
            RBot.reply(from, '✅ Clear all chat, Success!', id)
            break
        // ! Convert
        // ANCHOR
        case 'cvsell' :
            const datacv = arg
            if(args.length > 0){
                RBot.sendText(from,library.text(command, datacv))
            }else{
                RBot.sendText(from, `Kirim dengan format contoh #cvsell dana | 0898863484 | 1000000 | dana | 034834234234 | Rizqy`)
            }
            break
        default:
            break
        }

		// Simi-simi function
		if ((!isCmd && isGroupMsg && isSimi) && message.type === 'chat') {
			axios.get(`https://arugaz.herokuapp.com/api/simisimi?kata=${encodeURIComponent(message.body)}&apikey=${apiSimi}`)
			.then((res) => {
				if (res.data.status == 403) return RBot.sendText(ownerNumber, `${res.data.result}\n\n${res.data.pesan}`)
				RBot.reply(from, `Simi berkata: ${res.data.result}`, id)
			})
			.catch((err) => {
				RBot.reply(from, `${err}`, id)
			})
		}

		// Kata kasar function
		if(!isCmd && isGroupMsg && isNgegas) {
            const find = db.get('group').find({ id: groupId }).value()
            if(find && find.id === groupId){
                const cekuser = db.get('group').filter({id: groupId}).map('members').value()[0]
                const isIn = inArray(pengirim, cekuser)
                if(cekuser && isIn !== false){
                    if(isKasar){
                        const denda = db.get('group').filter({id: groupId}).map('members['+isIn+']').find({ id: pengirim }).update('denda', n => n + 5000).write()
                        if(denda){
                            await RBot.reply(from, "Jangan badword bodoh\nDenda +5.000\nTotal : Rp"+formatin(denda.denda), id)
                        }
                    }
                } else {
                    const cekMember = db.get('group').filter({id: groupId}).map('members').value()[0]
                    if(cekMember.length === 0){
                        if(isKasar){
                            db.get('group').find({ id: groupId }).set('members', [{id: pengirim, denda: 5000}]).write()
                        } else {
                            db.get('group').find({ id: groupId }).set('members', [{id: pengirim, denda: 0}]).write()
                        }
                    } else {
                        const cekuser = db.get('group').filter({id: groupId}).map('members').value()[0]
                        if(isKasar){
                            cekuser.push({id: pengirim, denda: 5000})
                            await RBot.reply(from, "Jangan badword bodoh\nDenda +5.000", id)
                        } else {
                            cekuser.push({id: pengirim, denda: 0})
                        }
                        db.get('group').find({ id: groupId }).set('members', cekuser).write()
                    }
                }
            } else {
                if(isKasar){
                    db.get('group').push({ id: groupId, members: [{id: pengirim, denda: 5000}] }).write()
                    await RBot.reply(from, "Jangan badword bodoh\nDenda +5.000\nTotal : Rp5.000", id)
                } else {
                    db.get('group').push({ id: groupId, members: [{id: pengirim, denda: 0}] }).write()
                }
            }
        }
    } catch (err) {
        console.log(color('[EROR]', 'red'), err)
    }
}
