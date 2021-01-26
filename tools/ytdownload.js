const axios = require('axios');
const link = 'https://www.youtube.com/watch?v=IXVmc4WITck&t=352s'

// Msg Handler
const linkmp4 = link.replace('https://youtu.be/','').replace('https://www.youtube.com/watch?v=','')
console.log(linkmp4);

console.log(axios.get(`http://arugaz.my.id/api/media/ytvideo?url=${linkmp4}`)
    .then(res => {console.log(res)})
    .catch(err => {
        console.log(err)
    }))


// rugaapi.ytmp4(`https://youtu.be/${linkmp4}`)
// .then(async(res) => {
//     if (res.error) return aruga.sendFileFromUrl(from, `${res.url}`, '', `${res.error}`)
//     await aruga.sendFileFromUrl(from, `${res.result.thumb}`, '', `Lagu ditemukan\n\nJudul: ${res.result.title}\nDesc: ${res.result.desc}\nSabar lagi dikirim`, id)
//     await aruga.sendFileFromUrl(from, `${res.result.url}`, '', '', id)
//     .catch(() => {
//         aruga.reply(from, `URL Ini ${args[0]} Sudah pernah di Download sebelumnya. URL akan di Reset setelah 1 Jam/60 Menit`, id)
//     })
// })
// ytmp4(link).then(res=> {
//     console.log(res)

// const ytmp4 = async (url) => new Promise((resolve, reject) => {
//     axios.get(`http://arugaz.my.id/api/media/ytvideo?url=${link}`)
//     .then((res) => {
//         if (res.data.error) resolve({status: 'error', link: eroryt, judul: res.data.error})
// 		// if (Number(res.data.filesize.split(' MB')[0]) >= 10.00) resolve({status: 'filesize', link: fileyt, judul: '[❗] Terjadi kesalahan mungkin file audionya terlalu besar'})
//         resolve({status: 'success', link: res.data.result, size: res.data.filesize, thumb: res.data.thumb, judul: res.data.title})
//     })
//     .catch((err) =>{
//         reject(err)
//     })
// })

