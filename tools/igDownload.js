const axios = require("axios");
const link = 'rizqy.pan'
const command = 1
const command2 = 1

let fullCommand = 'rizqy.pan 1 1'
let split = fullCommand.split(' ')
let user = split[0]
let hl_select = split[1]
let selected = split[2]
console.log(user, hl_select,selected);

axios.get(`http://arugaz.my.id/api/media/highlightig?user=${user}`)
    .then(res => {
        console.log(res.data.result[hl_select - 1].medias[selected-1].media_url[0].src)
    })
    .catch(err => {
        console.log(err)
    })