

exports.text = (command, text) =>{
    const arg = text.toLowerCase().trim().split('|')
    const from = arg[0].split(' ').join('')
    const sender = arg[1].split(' ').join('')
    const nominal = arg[2].split(' ').join('').split('.').join('')
    const sendTo = arg[3].split(' ').join('')
    const numberToSend = arg[4]
    const senderName = arg[5]
    // console.log(from,sender,nominal,sendTo,senderName);


    // ! Library


    const calcAdmin = (from,sendTo) => {
        let admin = 2500
        var rate = 0.8
        if(from === 'xl'){
            if(nominal < 25000) {return {admin : 1500, rate : 0.9}}
            if(nominal < 50000) {return {admin : 2000}}
            if(nominal < 100000) {return {admin : 3500}}
            if(nominal < 200000) {return {admin : 6500}}
            if(nominal < 300000) {return {admin : 10000}}
            if(nominal) {return {admin : 20000}}
        }
        if(from === "dana"){
            if(nominal < 25000) {return {rate : 1}}
            if(nominal < 50000) {return {rate : 0.95}}
            if(nominal < 100000) {return {rate : 0.85}}
            if(nominal < 200000) {return {rate : 0.80}}
            if(nominal < 300000) {return {rate : 0.75}}
            if(nominal) {return {rate : 0.7}}
        }
    }


    const calculated = () => {
        let hasil = 0
        let admin = calcAdmin(from).admin
        // ! If Function dont have rate
        let rate = (calcAdmin(from).rate == undefined) ? 1 : calcAdmin(from).rate
        if(command == "cvbuy"){
            hasil = (nominal + admin) + rate
            return {hasil,rate,admin}
        }
        if(command == "cvsell"){
            hasil = (nominal * rate)
            return {hasil,rate}
        }
        if(command == "cvbuy"){
            hasil = (nominal * admin) + rate
            return hasil
        }

    }
    const result =
    `================================

        [ ${command.toUpperCase()} ] ${from} => ${sendTo}
        Dari   \t\t: ${sender}
        Sebesar \t\t: ${nominal}
        Nama \t\t:${senderName}
        No.Pengiriman\t:${numberToSend}
        Rate     \t\t: ${calculated().rate}
        Biaya Admin \t: ${calculated().admin}
        Total Pembayaran \t: ${calculated().hasil}

================================`;
    return result;
}




