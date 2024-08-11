import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`✳️ Por favor, ingrese el texto que desea traducir.`);

  m.react('🗣️');

  try {
    // Enviar solicitud a la API de SimSimi
    let res = await fetch('https://api.simsimi.vn/v1/simtalk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `text=${encodeURIComponent(text)}&key=`
    });

    let json = await res.json();
    let responseMessage = json.message.replace(/simsimi|Simsimi|sim simi/g, `${botName}`);

    m.reply(responseMessage);
  } catch {
    m.reply(`❎ Intenta de nuevo más tarde. La API de SimSimi está caída.`);
  }
};

handler.help = ['bot'];
handler.tags = ['fun'];
handler.command = ['bot', 'simi'];

export default handler;
