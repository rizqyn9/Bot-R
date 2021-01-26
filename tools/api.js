const axios = require("axios");

// // IG Highlight
// const ig_highlight = async (user,hl,hl_select) => new Promise((resolve,reject) => {
//     axios.get(`http://arugaz.my.id/api/media/highlightig?user=${user}`)
//     .then(res => {
//         console.log(res)
//     })
//     .catch(err => {
//         console.log(err)
//     })
// })
// // ig_highlight('rizqy.pan',1,1)


// IG  Download

// ! Tiktok Downloader
const tiktok = async (link) => new Promise((resolve, reject) => {
    axios.get(`http://arugaz.my.id/api/media/tiktok?url=${link}`)
    .then(res => {
        resolve(res.data)
    })
    .catch(err => {
        reject(err)
    })
})

module.exports = {
    // ig_highlight,
    // ig_download,
    tiktok
}
