const command = 'rizqy 1 2'

let splited = command.split(' ')
let user = splited[0]
let hl = splited[1]
let hl_select = splited[2]

if(user && hl && hl_select){
    console.log("success");
}else{
    console.log("Wrong Format");
}
// console.log(splited);
// console.log(user);
// console.log(hl);
// console.log(hl_select);
