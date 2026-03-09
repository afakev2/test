const express = require('express');
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, createAudioPlayer, getVoiceConnection } = require('@discordjs/voice');
const app = express();

// Force older Node.js compatibility
process.env.NODE_OPTIONS = '--no-warnings';

// Patch global objects if missing
if (typeof global.ReadableStream === 'undefined') {
    global.ReadableStream = class ReadableStream {};
}
if (typeof global.File === 'undefined') {
    global.File = class File {};
}

// التحقق من وجود التوكن
const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ يجب تعيين DISCORD_TOKEN في المتغيرات البيئية');
    process.exit(1);
}

// إنشاء عميل السيلف بوت مع إعدادات متقدمة
const client = new Client({
    checkUpdate: false,
    ws: {
        properties: {
            $browser: "Discord iOS",
            $os: "iOS",
            $device: "iPhone"
        }
    }
});

// تخزين حالة الاتصال الصوتي والمستخدمين
let voiceConnection = null;
let audioPlayer = createAudioPlayer();
let currentVoiceChannel = null;
let currentGuild = null;
let voiceUsers = new Map(); // تخزين المستخدمين في القناة الصوتية
let afkMode = false;
let messageCache = new Map(); // كاش للرسائل

// إعداد Express
app.use(express.json());
app.use(express.static('public'));

// ============ MIDDLEWARE ============
const checkBotReady = (req, res, next) => {
    if (!client || !client.user) {
        return res.status(503).json({ error: 'البوت ليس جاهزاً بعد' });
    }
    next();
};

// ============ API ENDPOINTS ============

// جلب معلومات المستخدم
app.get('/api/user', checkBotReady, (req, res) => {
    try {
        res.json({
            id: client.user.id,
            username: client.user.username,
            discriminator: client.user.discriminator,
            avatar: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 }),
            banner: client.user.bannerURL({ format: 'png', dynamic: true, size: 512 }),
            status: client.user.presence?.status || 'offline',
            activities: client.user.presence?.activities || [],
            createdAt: client.user.createdTimestamp,
            bot: client.user.bot || false
        });
    } catch (error) {
        res.status(500).json({ error: 'خطأ في جلب معلومات المستخدم' });
    }
});

// جلب قائمة الخوادم
app.get('/api/guilds', checkBotReady, (req, res) => {
    try {
        const guilds = client.guilds.cache.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL({ format: 'png', dynamic: true, size: 256 }),
            banner: guild.bannerURL({ format: 'png', size: 512 }),
            memberCount: guild.memberCount,
            ownerId: guild.ownerId,
            createdAt: guild.createdTimestamp,
            description: guild.description,
            channels: guild.channels.cache
                .filter(ch => ch.type === 'GUILD_VOICE' || ch.type === 'GUILD_TEXT' || ch.type === 'GUILD_CATEGORY')
                .map(ch => ({
                    id: ch.id,
                    name: ch.name,
                    type: ch.type === 'GUILD_VOICE' ? 'voice' : 
                          ch.type === 'GUILD_TEXT' ? 'text' : 'category',
                    parentId: ch.parentId,
                    position: ch.position,
                    nsfw: ch.nsfw || false,
                    bitrate: ch.bitrate || null,
                    userLimit: ch.userLimit || null
                }))
        }));
        
        res.json(guilds);
    } catch (error) {
        console.error('خطأ في جلب الخوادم:', error);
        res.status(500).json({ error: 'فشل جلب الخوادم' });
    }
});

// جلب قناة محددة
app.get('/api/channel/:channelId', checkBotReady, async (req, res) => {
    const { channelId } = req.params;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }
        
        res.json({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            guildId: channel.guildId,
            position: channel.position,
            nsfw: channel.nsfw || false,
            bitrate: channel.bitrate || null,
            userLimit: channel.userLimit || null,
            topic: channel.topic || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ VOICE CHANNEL CONTROLS ============

// الدخول إلى قناة صوتية
app.post('/api/voice/join', checkBotReady, async (req, res) => {
    const { guildId, channelId, selfMute = false, selfDeaf = false } = req.body;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }
        
        const channel = guild.channels.cache.get(channelId);
        if (!channel || channel.type !== 'GUILD_VOICE') {
            return res.status(400).json({ error: 'القناة غير موجودة أو ليست قناة صوتية' });
        }
        
        // إذا كان متصل بقناة أخرى، افصل أولاً
        if (voiceConnection) {
            try {
                voiceConnection.destroy();
            } catch (e) {}
            voiceConnection = null;
        }
        
        // الاتصال بالقناة الصوتية
        voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: selfDeaf,
            selfMute: selfMute
        });
        
        currentVoiceChannel = channel.id;
        currentGuild = guild.id;
        
        // تشغيل الصوت
        if (voiceConnection) {
            voiceConnection.subscribe(audioPlayer);
            
            // مراقبة المستخدمين في القناة
            voiceConnection.receiver.speaking.on('start', (userId) => {
                console.log(`User ${userId} started speaking`);
            });
        }
        
        // تحديث قائمة المستخدمين في القناة
        await updateVoiceUsers(channel);
        
        res.json({ 
            success: true, 
            message: `✅ تم الاتصال بـ ${channel.name}`,
            channel: channel.name,
            guild: guild.name,
            users: Array.from(voiceUsers.values())
        });
        
    } catch (error) {
        console.error('خطأ في الاتصال الصوتي:', error);
        res.status(500).json({ error: 'فشل الاتصال بالقناة الصوتية: ' + error.message });
    }
});

// مغادرة القناة الصوتية
app.post('/api/voice/leave', checkBotReady, (req, res) => {
    try {
        if (voiceConnection) {
            voiceConnection.destroy();
            voiceConnection = null;
            currentVoiceChannel = null;
            currentGuild = null;
            voiceUsers.clear();
            res.json({ success: true, message: '✅ تم مغادرة القناة الصوتية' });
        } else {
            res.json({ success: true, message: '⚠️ لست متصلاً بأي قناة صوتية' });
        }
    } catch (error) {
        res.status(500).json({ error: 'فشل مغادرة القناة الصوتية' });
    }
});

// كتم/إلغاء كتم المستخدم
app.post('/api/voice/mute', checkBotReady, async (req, res) => {
    const { userId, mute, type = 'mic' } = req.body; // type: 'mic' or 'deaf'
    
    try {
        if (!voiceConnection) {
            return res.status(400).json({ error: 'لست متصلاً بقناة صوتية' });
        }
        
        const guild = client.guilds.cache.get(currentGuild);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }
        
        const member = await guild.members.fetch(userId);
        if (!member) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }
        
        if (type === 'mic') {
            await member.voice.setMute(mute, 'تم الكتم عبر لوحة التحكم');
        } else if (type === 'deaf') {
            await member.voice.setDeaf(mute, 'تم كتم السماعة عبر لوحة التحكم');
        }
        
        res.json({ 
            success: true, 
            message: mute ? '✅ تم الكتم' : '✅ تم إلغاء الكتم' 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// فصل مستخدم من القناة الصوتية
app.post('/api/voice/disconnect', checkBotReady, async (req, res) => {
    const { userId } = req.body;
    
    try {
        if (!voiceConnection) {
            return res.status(400).json({ error: 'لست متصلاً بقناة صوتية' });
        }
        
        const guild = client.guilds.cache.get(currentGuild);
        const member = await guild.members.fetch(userId);
        
        if (member) {
            await member.voice.disconnect('تم الفصل عبر لوحة التحكم');
            res.json({ success: true, message: '✅ تم فصل المستخدم' });
        } else {
            res.status(404).json({ error: 'المستخدم غير موجود' });
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// نقل مستخدم إلى قناة أخرى
app.post('/api/voice/move', checkBotReady, async (req, res) => {
    const { userId, newChannelId } = req.body;
    
    try {
        const guild = client.guilds.cache.get(currentGuild);
        const member = await guild.members.fetch(userId);
        const newChannel = guild.channels.cache.get(newChannelId);
        
        if (member && newChannel) {
            await member.voice.setChannel(newChannel);
            res.json({ success: true, message: '✅ تم نقل المستخدم' });
        } else {
            res.status(404).json({ error: 'المستخدم أو القناة غير موجودة' });
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// الحصول على حالة الصوت
app.get('/api/voice/status', checkBotReady, (req, res) => {
    res.json({
        connected: voiceConnection !== null,
        guildId: currentGuild,
        channelId: currentVoiceChannel,
        users: Array.from(voiceUsers.values()),
        afkMode: afkMode
    });
});

// تحديث قائمة المستخدمين في القناة الصوتية
async function updateVoiceUsers(channel) {
    try {
        const members = channel.members;
        voiceUsers.clear();
        
        members.forEach(member => {
            voiceUsers.set(member.id, {
                id: member.id,
                username: member.user.username,
                discriminator: member.user.discriminator,
                avatar: member.user.displayAvatarURL({ dynamic: true }),
                muted: member.voice.mute || false,
                deaf: member.voice.deaf || false,
                selfMute: member.voice.selfMute || false,
                selfDeaf: member.voice.selfDeaf || false,
                streaming: member.voice.streaming || false,
                camera: member.voice.selfVideo || false
            });
        });
    } catch (error) {
        console.error('خطأ في تحديث قائمة المستخدمين:', error);
    }
}

// ============ MESSAGE CONTROLS ============

// جلب رسائل القناة
app.get('/api/messages/:channelId', checkBotReady, async (req, res) => {
    const { channelId } = req.params;
    const { limit = 50, before } = req.query;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }
        
        if (channel.type !== 'GUILD_TEXT') {
            return res.status(400).json({ error: 'القناة ليست قناة نصية' });
        }
        
        const options = { limit: parseInt(limit) };
        if (before) options.before = before;
        
        const messages = await channel.messages.fetch(options);
        
        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            author: {
                id: msg.author.id,
                username: msg.author.username,
                discriminator: msg.author.discriminator,
                avatar: msg.author.displayAvatarURL({ dynamic: true, size: 128 }),
                bot: msg.author.bot,
                color: msg.member?.displayHexColor || null
            },
            content: msg.content,
            cleanContent: msg.cleanContent,
            timestamp: msg.createdTimestamp,
            editedTimestamp: msg.editedTimestamp,
            attachments: msg.attachments.map(att => ({
                url: att.url,
                name: att.name,
                size: att.size,
                contentType: att.contentType
            })),
            embeds: msg.embeds,
            mentions: {
                users: msg.mentions.users.map(u => u.id),
                roles: msg.mentions.roles.map(r => r.id),
                channels: msg.mentions.channels.map(c => c.id),
                everyone: msg.mentions.everyone
            },
            reactions: msg.reactions.cache.map(r => ({
                emoji: r.emoji.toString(),
                count: r.count,
                me: r.me
            })),
            pinned: msg.pinned,
            type: msg.type,
            reference: msg.reference ? {
                messageId: msg.reference.messageId,
                channelId: msg.reference.channelId,
                guildId: msg.reference.guildId
            } : null
        }));
        
        // تخزين في الكاش
        messageCache.set(channelId, formattedMessages);
        
        res.json(formattedMessages);
        
    } catch (error) {
        console.error('خطأ في جلب الرسائل:', error);
        res.status(500).json({ error: error.message });
    }
});

// إرسال رسالة
app.post('/api/message/send', checkBotReady, async (req, res) => {
    const { channelId, message, replyTo } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }
        
        let sentMessage;
        if (replyTo) {
            const replyMessage = await channel.messages.fetch(replyTo);
            sentMessage = await replyMessage.reply(message);
        } else {
            sentMessage = await channel.send(message);
        }
        
        res.json({ 
            success: true, 
            message: '✅ تم إرسال الرسالة',
            messageId: sentMessage.id,
            timestamp: sentMessage.createdTimestamp
        });
        
    } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error);
        res.status(500).json({ error: error.message });
    }
});

// حذف رسالة
app.post('/api/message/delete', checkBotReady, async (req, res) => {
    const { channelId, messageId } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }
        
        const message = await channel.messages.fetch(messageId);
        await message.delete();
        
        res.json({ success: true, message: '✅ تم حذف الرسالة' });
        
    } catch (error) {
        console.error('خطأ في حذف الرسالة:', error);
        res.status(500).json({ error: error.message });
    }
});

// تعديل رسالة
app.post('/api/message/edit', checkBotReady, async (req, res) => {
    const { channelId, messageId, newContent } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }
        
        const message = await channel.messages.fetch(messageId);
        await message.edit(newContent);
        
        res.json({ success: true, message: '✅ تم تعديل الرسالة' });
        
    } catch (error) {
        console.error('خطأ في تعديل الرسالة:', error);
        res.status(500).json({ error: error.message });
    }
});

// تثبيت رسالة
app.post('/api/message/pin', checkBotReady, async (req, res) => {
    const { channelId, messageId } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }
        
        const message = await channel.messages.fetch(messageId);
        await message.pin();
        
        res.json({ success: true, message: '✅ تم تثبيت الرسالة' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إلغاء تثبيت رسالة
app.post('/api/message/unpin', checkBotReady, async (req, res) => {
    const { channelId, messageId } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }
        
        const message = await channel.messages.fetch(messageId);
        await message.unpin();
        
        res.json({ success: true, message: '✅ تم إلغاء تثبيت الرسالة' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إضافة رد فعل
app.post('/api/message/react', checkBotReady, async (req, res) => {
    const { channelId, messageId, emoji } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }
        
        const message = await channel.messages.fetch(messageId);
        await message.react(emoji);
        
        res.json({ success: true, message: '✅ تم إضافة الرد' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إزالة رد فعل
app.post('/api/message/unreact', checkBotReady, async (req, res) => {
    const { channelId, messageId, emoji } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }
        
        const message = await channel.messages.fetch(messageId);
        const userReaction = message.reactions.cache.find(r => r.emoji.toString() === emoji);
        
        if (userReaction) {
            await userReaction.users.remove(client.user.id);
        }
        
        res.json({ success: true, message: '✅ تم إزالة الرد' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// نسخ رسالة
app.post('/api/message/copy', checkBotReady, async (req, res) => {
    const { channelId, messageId, targetChannelId } = req.body;
    
    try {
        const sourceChannel = client.channels.cache.get(channelId);
        const targetChannel = client.channels.cache.get(targetChannelId || channelId);
        
        if (!sourceChannel || !targetChannel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }
        
        const message = await sourceChannel.messages.fetch(messageId);
        await targetChannel.send({
            content: message.content,
            embeds: message.embeds
        });
        
        res.json({ success: true, message: '✅ تم نسخ الرسالة' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ STATUS CONTROLS ============

// تحديث الحالة
app.post('/api/status', checkBotReady, async (req, res) => {
    const { status, activity, activityType, afk } = req.body;
    
    try {
        if (afk !== undefined) {
            afkMode = afk;
        }
        
        const presenceData = {
            status: status || (afkMode ? 'idle' : 'online')
        };
        
        if (activity) {
            presenceData.activities = [{
                name: activity,
                type: parseInt(activityType) || 0,
                url: activityType === '1' ? 'https://twitch.tv/stream' : undefined
            }];
        }
        
        await client.user.setPresence(presenceData);
        
        res.json({ 
            success: true, 
            message: '✅ تم تحديث الحالة',
            afk: afkMode
        });
        
    } catch (error) {
        console.error('خطأ في تحديث الحالة:', error);
        res.status(500).json({ error: error.message });
    }
});

// الحصول على حالة AFK
app.get('/api/afk/status', checkBotReady, (req, res) => {
    res.json({ afk: afkMode });
});

// ============ MEMBER CONTROLS ============

// جلب معلومات عضو
app.get('/api/member/:guildId/:userId', checkBotReady, async (req, res) => {
    const { guildId, userId } = req.params;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }
        
        const member = await guild.members.fetch(userId);
        
        res.json({
            id: member.id,
            username: member.user.username,
            discriminator: member.user.discriminator,
            avatar: member.user.displayAvatarURL({ dynamic: true }),
            nickname: member.nickname,
            roles: member.roles.cache.map(r => ({
                id: r.id,
                name: r.name,
                color: r.hexColor,
                position: r.position
            })),
            joinedAt: member.joinedTimestamp,
            createdAt: member.user.createdTimestamp,
            premiumSince: member.premiumSinceTimestamp,
            voice: member.voice.channelId ? {
                channelId: member.voice.channelId,
                mute: member.voice.mute,
                deaf: member.voice.deaf,
                selfMute: member.voice.selfMute,
                selfDeaf: member.voice.selfDeaf,
                streaming: member.voice.streaming
            } : null
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        bot: client && client.user ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// ============ BOT EVENTS ============

client.on('ready', async () => {
    console.log('✅ ================================');
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log('✅ ================================');
    console.log(`👤 المستخدم: ${client.user.tag}`);
    console.log(`🆔 المعرف: ${client.user.id}`);
    console.log(`🌐 عدد الخوادم: ${client.guilds.cache.size}`);
    console.log(`👥 عدد الأصدقاء: ${client.users.cache.size}`);
    console.log('✅ ================================');
    
    // تعيين الحالة الافتراضية
    await client.user.setPresence({
        status: 'online',
        activities: [{
            name: 'Discord SelfBot',
            type: 0
        }]
    });
});

client.on('error', (error) => {
    console.error('❌ خطأ في البوت:', error);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    // تحديث قائمة المستخدمين عند تغيير الحالة الصوتية
    if (newState.channelId === currentVoiceChannel) {
        updateVoiceUsers(newState.channel);
    } else if (oldState.channelId === currentVoiceChannel) {
        updateVoiceUsers(oldState.channel);
    }
});

client.on('messageCreate', (message) => {
    // تحديث الكاش عند وصول رسالة جديدة
    if (messageCache.has(message.channelId)) {
        const cached = messageCache.get(message.channelId);
        // إضافة الرسالة الجديدة للكاش
    }
});

client.on('messageDelete', (message) => {
    // تحديث الكاش عند حذف رسالة
    if (messageCache.has(message.channelId)) {
        // إزالة الرسالة من الكاش
    }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    // تحديث الكاش عند تعديل رسالة
    if (messageCache.has(newMessage.channelId)) {
        // تحديث الرسالة في الكاش
    }
});

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (error) => {
    console.error('❌ خطأ غير معالج:', error);
});

// تسجيل الدخول
console.log('🔄 جاري تسجيل الدخول...');
client.login(token).catch(err => {
    console.error('❌ فشل تسجيل الدخول:', err.message);
    console.error('❌ تأكد من صحة التوكن');
    process.exit(1);
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 لوحة التحكم تعمل على المنفذ ${PORT}`);
    console.log(`📱 الرابط: http://localhost:${PORT}`);
});
