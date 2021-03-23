const axios = require("axios");


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
