const { fetchJson } = require('../utils/fetcher')
const {botName} = require('../setting/data/bot-setting.json')

/**
 * Get Resi Information
 *
 * @param {string} ekspedisi - nama ekpedisi
 * @param {string} resi - no / kode resi
 */
module.exports = cekResi = (ekspedisi, resi) => new Promise((resolve, reject) => {
    fetchJson(`https://api.terhambar.com/resi?resi=${resi}&kurir=${ekspedisi}`)
        .then((result) => {
            if (result.status.code != 200 && result.status.description != 'OK') return resolve(result.status.description)
            // eslint-disable-next-line camelcase
            const { result: { summary, details, delivery_status, manifest } } = result
            const manifestText = manifest.map(x => `⏰ ${x.manifest_date} ${x.manifest_time}\n └ ${x.manifest_description}`)
            const resultText = `
*${botNname} x Cek Resi*
*Data Ekspedisi*
├ ${summary.courier_name}
├ Resi: ${summary.waybill_number}
├ Layanan: ${summary.service_code}
└ Tanggal Kirim: ${details.waybill_date}  ${details.waybill_time}

*Status Pengiriman*
└ ${delivery_status.status}

*Data Pengirim*
├ Nama: ${details.shippper_name}
└ Alamat: ${details.shipper_address1} ${details.shipper_city}

*Data Penerima*
├ Nama: ${details.receiver_name}
└ Alamat: ${details.receiver_address1} ${details.receiver_city}

*POD Detail*\n
${manifestText.join('\n')}`
            resolve(resultText)
        }).catch((err) => {
            console.error(err)
            reject(err)
        })
})
