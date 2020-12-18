const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const db_group = new FileSync('parent.json')  //! GROUP DATA CACHE
const db = low(db_group)
db.defaults({ group: []}).write()

const inArray = (needle, haystack) => {
    let length = haystack.length;
    for(let i = 0; i < length; i++) {
        if(haystack[i].id == needle) return i;
    }
    return false;
}

const isCmd = false;
const isGroupMsg =true
const isNgegas =true
const isKasar = true

const groupId = 3412;
const pengirim = 1231233


if(!isCmd && isGroupMsg && isNgegas) {
    const find = db.get('group').find({ id: groupId }).value()
    if(find && find.id === groupId){
        const cekuser = db.get('group').filter({id: groupId}).map('members').value()[0]
        const isIn = inArray(pengirim, cekuser)
        if(cekuser && isIn !== false){
            if(isKasar){
                const denda = db.get('group').filter({id: groupId}).map('members['+isIn+']').find({ id: pengirim }).update('denda', n => n + 5000).write()
                if(denda){
                    console.log("badword bodoh");
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
                    console.log(('badwordbodoh'));
                } else {
                    cekuser.push({id: pengirim, denda: 0})
                }
                db.get('group').find({ id: groupId }).set('members', cekuser).write()
            }
        }
    } else {
        if(isKasar){
            db.get('group').push({ id: groupId, members: [{id: pengirim, denda: 5000}] }).write()
            console.log("badword bodoh");
        } else {
            db.get('group').push({ id: groupId, members: [{id: pengirim, denda: 0}] }).write()
        }
    }
}