const { create, Client } = require("@open-wa/wa-automate");
const figlet = require("figlet");
const gradient = require("gradient-string");
const style = require("./setting/console");
const options = require("./setting/options");
const { color, messageLog } = require("./utils");
const HandleMsg = require("./event/msgHandler"); 
const { cacheMessage, groupLimit, botName,memberLimit} = require("./setting/data/bot-setting.json"); //! Bot Setting
const {infoFeedback,infoProblem} = require("./event/msg-Temp") //! Massage Template
const fs = require('fs-extra') //! ACCESS TO FILE SYSTEM
const groupList = JSON.parse(fs.readFileSync('./data/group-list.json')) //! groupList : REGIST

const start = (RBot = new Client()) => {
  console.log(
    gradient.instagram(
      figlet.textSync("RIZQY\nSTUDIO", {
        font: "Epic",
        horizontalLayout: "default",
      })
    )
  );
  console.log(style.dev("Made by R-Dev Studio"));
  console.log(style.bot("Have a nice day Rizqy :)"));
  console.log(style.bot("I'm ready for my Jobs"));

  //!Mempertahankan sesi agar tetap nyala
  RBot.onStateChanged((state) => {
    console.log(style.warn(state));
    if (state === "CONFLICT" || state === "UNLAUNCHED")
      RBot.forceRefocus();
  });

  //! Invited RBot in Group
  RBot.onAddedToGroup(async (chat) => {
    const groups = await RBot.getAllGroups();
    const groupName = chat.contact.name //! Get Group ID

    //! Group Limit Setting
    if (groups.length > groupLimit) {
      await RBot
        .sendText(
          chat.id,
          `Maaf, saat ini ${botName} mencapai batas maksimum.\nMaksimal grup : ${groupLimit} ` + infoProblem
        )
        .then(() => {
          RBot.leaveGroup(chat.id);
          RBot.deleteChat(chat.id);
        });
    } else {
      //! Minimum Member Setting
      if (chat.groupMetadata.participants.length < memberLimit) {
        await RBot
          .sendText(
            chat.id,
            `Maaf, ${botName} hanya bisa masuk grup yang mempunyai anggota lebih dari ${memberLimit} anggota` + infoProblem
          )
          .then(() => {
            RBot.leaveGroup(chat.id);
            RBot.deleteChat(chat.id);
          });
      } else {
        await RBot.simulateTyping(chat.id, true).then(async () => {
          await RBot.sendText(
            chat.id,
            `Hai member ${groupName},  perkenalkan aku *${botName}*\nUntuk mengaktifkan ${botName} silahkan Admin Grup ketik\n\n\t#daftar <nama_grup>|<nama_perwakilan>\n\nGrup akan di Acc 1x24jam.`
          );
          style.bot(`Invited to ${groupName}`)
        });
      }
    }
  });


  //! Group Event (Members Kicked / Invited)
  RBot.onGlobalParicipantsChanged(async (event) => {
    const host = (await RBot.getHostNumber()) + "@c.us";
    //! Bot NOT REGIST == Turn OFF command
    const groupName = event.chat //! Get Group ID
    let check = groupList.includes(groupName)
    if (!check){
      return null
    }

    //! Invited or New Member
    if (event.action === "add" && event.who !== host) {
      await RBot.sendTextWithMentions(
        event.chat,
        `Hai ${event.who.replace(
          "@c.us",
          ""
        )}, Selamat datang digrup.\n Semoga nyaman 🥰 \n*-${botName}*`
      );
    }
    //! Kicked Member
    if (event.action === "remove" && event.who !== host) {
      await RBot.sendTextWithMentions(
        event.chat,
        `Jangan rindu @${event.who.replace("@c.us", "")}, Semoga tenang`
      );
    }
  });

  RBot.onIncomingCall(async (callData) => {
    //! DONT CALL ME :(
    await RBot
      .sendText(
        callData.peerJid,
        `Dilarang Keras Menelepon hukuman block.` + infoProblem
      )
      .then(async () => {
        //! Blocked this number
        await RBot.contactBlock(callData.peerJid);
      });
  });

  //! Message Handler
  RBot.onMessage(async (message) => {
    RBot
      //! DELETING MESSAGE CACHE
      .getAmountOfLoadedMessages() 
      .then((msg) => {
        if (msg >= cacheMessage) {
          console.log(
            style.bot(`Loaded Message reach ${msg}, deleting message cache...`),
          );
          RBot.cutMsgCache();
        }
      });
    HandleMsg(RBot, message);
  });

  // Message log for analytic
  RBot.onAnyMessage((anal) => {
    messageLog(anal.fromMe, anal.type);
  });
};

//! Stat Session
create(options(true, start))
  .then((RBot) => start(RBot))
  .catch((err) => new Error(err));
