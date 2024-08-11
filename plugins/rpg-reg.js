import { createHash } from 'crypto';
import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment-timezone';
import axios from 'axios';

let handler = async function (m, { conn, text, args, usedPrefix, command }) {
    // Definición de variables
    let fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let bio = await conn.fetchStatus(who).catch(_ => 'undefined');
    let biot = bio.status?.toString() || 'Sin Info';
    const date = moment.tz('America/Bogota').format('DD/MM/YYYY');
    const time = moment.tz('America/Argentina/Buenos_Aires').format('LT');
    let api = await axios.get(`https://deliriusapi-official.vercel.app/tools/country?text=${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}`);
    let userNationalityData = api.data.result;
    let userNationality = userNationalityData ? `${userNationalityData.name} ${userNationalityData.emoji}` : 'Desconocido';
    
    // Definición de datos del usuario localmente (sin usar global.db)
    let user = { // Ejemplo de datos del usuario
        registered: false,
        money: 0,
        limit: 0,
        exp: 0,
        joincount: 0,
        name: '',
        age: 0,
        regTime: 0
    };

    // Eliminar la dependencia de la base de datos global
    // En lugar de usar global.db, usa una base de datos local o simula el comportamiento

    if (command == 'verify' || command == 'reg' || command == 'verificar') {
        // Registro del usuario
        if (user.registered === true) throw `*Ya está registrado 🤨*`;
        if (!Reg.test(text)) throw `*⚠️¿No sabes cómo usar este comando?*`;
        let [_, name, splitter, age] = text.match(Reg);
        if (!name) throw '*¿Y el nombre?*';
        if (!age) throw '*La edad no puede estar vacía*';
        if (name.length >= 45) throw '*Nombre demasiado largo*';
        age = parseInt(age);
        if (age > 100) throw '👴🏻 Estás muy viejo';
        if (age < 5) throw '🚼 ¿Los bebés saben escribir?';
        user.name = name.trim();
        user.age = age;
        user.regTime = +new Date;
        user.registered = true;

        // Recompensas de ejemplo
        user.money += 400;
        user.limit += 2;
        user.exp += 150;
        user.joincount += 2;

        let sn = createHash('md5').update(m.sender).digest('hex');
        await conn.reply(m.chat, `[ ✅ REGISTRO COMPLETADO ] ...`, m, { contextInfo: { externalAdReply: { mediaUrl: null, mediaType: 1, description: null, title: `𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐃𝐎`, body: '', previewType: 0, thumbnail: img.getRandom(), sourceUrl: [nna, nn, md, yt, tiktok].getRandom()}} });
        await m.reply(`${sn}`);
    }

    if (command == 'nserie' || command == 'myns' || command == 'sn') {
        let sn = createHash('md5').update(m.sender).digest('hex');
        conn.fakeReply(m.chat, sn, '0@s.whatsapp.net', `⬇️ Este es tu número de serie ⬇️`, 'status@broadcast');
    }

    if (command == 'unreg') {
        if (!args[0]) throw `✳️ *Ingrese número de serie*`;
        let sn = createHash('md5').update(m.sender).digest('hex');
        if (args[0] !== sn) throw '⚠️ *Número de serie incorrecto*';

        // Eliminar el registro y ajustar datos
        user.registered = false;
        user.money -= 400;
        user.limit -= 2;
        user.exp -= 150;
        user.joincount -= 2;
        m.reply(`✅ Registro eliminado`);
    }
}
handler.help = ['reg', 'verificar', 'myns', 'nserie', 'unreg'];
handler.tags = ['rg'];
handler.command = /^(nserie|unreg|sn|myns|verify|verificar|registrar|reg(ister)?)$/i;
export default handler;
