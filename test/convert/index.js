const library = require('./library')

//   jdi misalkan buyer mau beli pulsa :
// 1. pulsa tf 19k, kan itu admin Rp 1.850,
// jdi 19.000+1850 = 20850 dikali 0,85 = 17.725,5 (jdi buyer send ke w Rp 17.726
// 2. pulsa tf 100k, kan itu admin Rp 2.000
// jdi 100.000+2.000=102.000 dikali 0,85 = 86.700, jdi buyer tf ke w cuman 86.700




// ! #cvbuy
// * #cvbuy Operator1 | Nomor Pengirim | Pulsa | Convert To ? | No yang dibutuhkan | Name
const command = "cvsell"
const text = 'dana | 0898863484 | 1000000 | dana | 034834234234 | Rizqy'

library.text(command, text)

