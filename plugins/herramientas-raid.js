import fs from 'fs';
import path from 'path';
import Jimp from 'jimp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cooldown = {}; // Objeto para almacenar los cooldowns de los grupos
const COOLDOWN_TIME = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

const handler = async (m, { conn, participants, usedPrefix, command }) => {
    const chatId = m.chat;

    // Verificar si el comando está en cooldown para el grupo
    if (cooldown[chatId] && (Date.now() - cooldown[chatId]) < COOLDOWN_TIME) {
        const tiempoRestante = Math.ceil((COOLDOWN_TIME - (Date.now() - cooldown[chatId])) / (60 * 60 * 1000));
        return m.reply(`Este comando está en cooldown. Por favor, espera ${tiempoRestante} hora(s) más para usarlo de nuevo.`);
    }

    // Establecer el cooldown para el grupo
    cooldown[chatId] = Date.now();

    // Cambiar el nombre del grupo
    const nuevoNombre = "Este grupo fue raideado por Abyss Bot";
    await conn.groupUpdateSubject(chatId, nuevoNombre);

    // Cambiar la descripción del grupo
    const nuevaDescripcion = "Este grupo fue raideado, Abyss Bot no se hace responsable del mal uso de sus comandos, recomendamos tener un staff bueno para evitar problemas, por favor, no hablar al privado al bot, las quejas se hacen al que ejecuto el comando";
    await conn.groupUpdateDescription(chatId, nuevaDescripcion);

    // Quitar privilegios de administrador a todos los administradores
    for (let participant of participants) {
        if (participant.admin && participant.id !== conn.user.jid) {
            await conn.groupParticipantsUpdate(chatId, [participant.id], 'demote');
        }
    }

    // Configurar el grupo para que solo los administradores puedan hablar
    await conn.groupSettingUpdate(chatId, 'announcement');

    // Cambiar la foto del grupo con una imagen de la carpeta ./media/
    const imagePath = path.join(__dirname, 'media', 'abyss3.png'); // Ruta correcta para el archivo de imagen
    if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);

        // Procesar y redimensionar la imagen
        async function processImage(imageBuffer) {
            const image = await Jimp.read(imageBuffer);
            const resizedImage = image.getHeight() > image.getWidth()
                ? image.resize(Jimp.AUTO, 720)
                : image.resize(720, Jimp.AUTO);
            return await resizedImage.getBufferAsync(Jimp.MIME_PNG); // Usa PNG en lugar de JPEG
        }

        const img = await processImage(imageBuffer);
        try {
            await conn.query({
                tag: 'iq',
                attrs: {
                    to: chatId,
                    type: 'set',
                    xmlns: 'w:profile:picture',
                },
                content: [{
                    tag: 'picture',
                    attrs: { type: 'image' },
                    content: img
                }]
            });
            m.reply('📸 *Foto de grupo actualizada con éxito.*');
        } catch (error) {
            console.error('Error al cambiar la foto del grupo:', error);
            m.reply('❎ *Error al cambiar la foto del grupo. Intenta de nuevo.*');
        }
    } else {
        console.error(`Imagen no encontrada en la ruta: ${imagePath}`);
        m.reply('❎ *Imagen no encontrada en la ruta especificada.*');
    }

    // Enviar el mensaje notificando que el grupo fue raideado 5 veces seguidas
    const mensajeRaid = "Este grupo fue raideado de bromi. ".repeat(40); // Ajusta la cantidad de repeticiones según lo necesites
    for (let i = 0; i < 5; i++) {
        await conn.reply(chatId, mensajeRaid, null, { mentions: conn.parseMention(mensajeRaid) });
    }
}

handler.command = /^(raid)$/i;
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
