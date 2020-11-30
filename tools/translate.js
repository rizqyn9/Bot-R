const { default: translate } = require('google-translate-open-api')
const style = require('../setting/console')

/**
 * Translate Text
 * @param  {String} text
 * @param  {String} lang
 */

module.exports = doing = (text, lang) => new Promise((resolve, reject) => {
    console.log(style.msg( `Menerjemahkan teks ke ${lang}`))
    translate(text, { tld: 'cn', to: lang })
        .then((text) => resolve(text.data[0]))
        .catch((err) => reject(err))
})
