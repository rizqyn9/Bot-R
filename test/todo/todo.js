
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const todo = new FileSync('todo-data.json')
const db_todo = low(todo)
const data = require('./todo-data.json')

const Func_todo = require('./function')



db_todo.defaults({group:[],personal:[]})
    .write()


const inArray = (needle, haystack) => {
    let length = haystack.length;
    for(let i = 0; i < length; i++) {
        if(haystack[i].listid == needle) return i;
    }
    return false;
}


//! Group Mode
const groupMode = true

// Implementation
const groupid = "GrupID-2"
const groupid2 = "GrupID-2"

const isiList1 = "baris 1"
const isiList2 = "baris 2"
const isiList3 = "baris 3"

const command = "list"
const arg1 = "new"
const arg2 = "Example 2"

const find = db_todo.get('group').find({id:groupid}).value()

if(groupMode && command == "list"){
    console.log("ok");
    const cek_data = db_todo.get('group').find({id: groupid}).value()
    console.log(cek_data);
    if(cek_data && cek_data.id === groupid){
        console.log("sukses");
        if(arg1 === "new"){
            console.log("buat baru");
            const cek_list = db_todo.get('group').filter({id:groupid}).map('list').value()[0]
            const inArray_cek_list = inArray(arg2,cek_list)
            if(cek_list && inArray_cek_list !== false){
                console.log("Data sudah terdaftar ganti judul");
            }else{
                console.log("Data akan didaftarkan")
                db_todo.get('group').find({id:groupid}).set('isiList', [])

            }

        }

    }

}




// // ! Add new List
// if(find && find.id === groupid && command == "new"){
//     console.log("making data");
//     const findList = db_todo.get('group').filter({id:groupid}).map('list').value()[0]
//     const isIn = inArray(listID, findList)
//     // ! Check new list
//     if(findList && isIn == false){
//         console.log("Grup terdaftar");
//     }else{
//         db_todo.get('group')
//             .push({id:groupid, list : []})
//             .write()
//     }

//     // if(findList && isIn !== false){
//     //     return console.log("k");
//     // }
// }
// console.log("Done");

