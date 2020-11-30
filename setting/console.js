const chalk = require('chalk')

// !Simple
exports.bot = (string) => {
    return chalk.yellow(`[BOT]\t`+`${string}`)
}
exports.dev = (string) => {
    return chalk.magenta(`[DEV]\t`+`${string}`)
}
exports.exe = (string) => {
    return chalk.blueBright(`[EXEC]\t`+`${string}`)
}
exports.warn = (string) => {
    return chalk.bgRedBright.whiteBright(`[WARN]\t`+`${string}`)
}
exports.group = (string) => {
    return chalk.green(`[GROUP]\t`+`${string}`)
}
exports.spam = () => {
    return chalk.red(`[SPAM]\t`)
}

//! Personal
exports.exeChat = (date,command,string,name) => {
    return console.log(chalk.blueBright(`[EXEC]\t`),chalk.yellowBright(date),chalk.blueBright(command),chalk.white(string),chalk.cyan(name))
}
exports.warnChat = (date,command,string,name) => {
    return console.log(chalk.bgRedBright.whiteBright(`[WARN]\t`),chalk.yellowBright(date),chalk.bgRedBright.whiteBright(command),chalk.white(string),chalk.cyan(name))
}
exports.spamChat = (date,command,string,name) => {
    return console.log(chalk.red(`[SPAM]\t`),chalk.yellowBright(date),chalk.red(command),chalk.white(string),chalk.red(name))
}

// !Group
exports.exeGroup = (date,command,string,name,string2,grupName) => {
    return console.log(chalk.blueBright(`[EXEC]\t`),chalk.yellowBright(date),chalk.blueBright(command),chalk.white(string),chalk.cyan(name),chalk.white(string2),chalk.cyan(grupName))
}
exports.warnGroup = (date,command,string,name,string2,grupName) => {
    return console.log(chalk.bgRedBright.whiteBright(`[WARN]\t`),chalk.yellowBright(date),chalk.red(command),chalk.white(string),chalk.bgRedBright.whiteBright(name),chalk.white(string2),chalk.cyan(grupName))
}
exports.spamGroup = (date,command,string,name,string2,grupName) => {
    return console.log(chalk.red(`[SPAM]\t`),chalk.yellowBright(date),chalk.red(command),chalk.white(string),chalk.cyan(name),chalk.white(string2),chalk.cyan(grupName))
}
exports.badWord = (date,command,string,name,string2,grupName) =>{
    return console.log(chalk.green(`[BADW]\t`),chalk.yellowBright(date),chalk.green(command),chalk.white(string),chalk.cyan(name),chalk.white(string2),chalk.cyan(grupName))
}

//! For Banned Person
exports.banPerson = (date,command,string,name) => {
    return console.log(chalk.bgGreen.black(`[BAN]\t${date} ${command} ${string} ${name}`))
}


//!Processing Console
exports.msg = (string) => {
    return chalk.cyan(`${string}`)
}
exports.time = (string) => {
    return chalk.yellow(`${string}`)
}

//! Bot Non / Activate 
exports.botAct = (string, groupName) => {
    return console.log( chalk.whiteBright(`[BOT]\t`+`${string}`), chalk.cyan(groupName))
}
exports.botNonAct = (string, groupName) => {
    return console.log( chalk.red(`[BOT]\t`+`${string}`), chalk.cyan(groupName))
}
exports.nonRegist = (name, groupName,groupId) => {
    return console.log(chalk.red(`[BOT]\t`,chalk.whiteBright(`Group : ${groupName}, Name : ${name} Not Regist, ${groupId}`)))
}


