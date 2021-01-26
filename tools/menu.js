const fs = require('fs-extra')

const {botName,
    numberWA,
    ownerNumber,
    memberLimit,
    groupLimit,
    prefix,
    waFeed,
    waProblem,
    cacheMessage,
    botVersion} = require('../setting/data/bot-setting.json')


exports.textTnC = () => {
    return`
    Syarat dan ketentuan penggunaan ${botName}:

    - Dilarang melakukan spam pada ${botName}, terutama menggunakan fitur download.
    - Dilarang telepon ke nomor ${botName}, langsung *BLOCK OTOMATIS*.
    - Jangan lupa donasi agar ${botName} tetap berjalan (*${prefix}donasi*).
    - Semua privasi pengguna akan tetap aman, karena ${botName} ini sepenuhnya dijalankan pada sistem.

    Bila terjadi kerusakan atau masalah pada ${botName} bisa hubungi : ${waProblem}`
}



exports.textMenu = (pushname) => {
    return `
    Hai ${pushname} 🙌!
Selamat menggunakan *${botName}* v${botVersion} dari R-Dev 🥳
Donasi jika RDP mati

Kirim perintah dibawah ini untuk menggunakan bot ini :

Sticker creator :
    ➵ *${prefix}sticker*
    ➵ *${prefix}stickergif*

Downloader :
    ➵ *${prefix}tiktok*

Muslim : (Thanks Ican Bachors)
    ➵ *${prefix}jsolat*
    ➵ *${prefix}daerah*
    ➵ *${prefix}daftarsurah*
    ➵ *${prefix}surah*
    ➵ *${prefix}infosurah*
    ➵ *${prefix}tafsir*

Group Menu :
    ➵ *${prefix}tagall*

Tentang Bot:
    ➵ *${prefix}tnc*
    ➵ *${prefix}donasi*
    ➵ *${prefix}ownerbot*
    ➵ *${prefix}changelog*

Jangan lupa react dan donasi ya sob,
    ➵ *${prefix}donasi*

Open jasa pembuatan Bot WA : ${numberWA}
JASA = [*NOT FREE*]

    Terimakasih `
}


exports.textAdmin = () => {
    return `
    [ *Hanya untuk Admin Grup* ]

    ➵ *${prefix}add*
    ➵ *${prefix}kick* @tagUser
    ➵ *${prefix}promote* @tagUser
    ➵ *${prefix}demote* @tagUser
    ➵ *${prefix}tagall*
    ➵ *${prefix}del*


    Menu buat bos R-Dev
    ➵ *${prefix}kickall*
    `
}


exports.textDonasi = () => {
    return `
    Terimakasih telah menggunakan bot ini, jika RDP mati maka bot tidak dapat digunakan, support developer untuk biaya RDP :(

Direct Donasi :
OVO, Dana, Gopay, Link Aja \t: 08985665498

Donasi yang masuk akan digunakan untuk pengembangan dan pengoperasian R-Bot.
    Terimakasih  -  *Rizqy as DEV*`
}

exports.textChangeLog = () => {
    return `
    Update ${botName} V.${botVersion}
    [NEW] Add tiktok downloader bypass watermark

    *~ R-DEV*
    `
}
