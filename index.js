const express = require('express');
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const app = express();

// التحقق من وجود التوكن
const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ يجب تعيين DISCORD_TOKEN في المتغيرات البيئية');
    process.exit(1);
}

// إنشاء عميل السيلف بوت
const client = new Client({
    checkUpdate: false,
    ws: { properties: { browser: "Discord iOS" } } // تقليد تطبيق الهاتف
});

// تخزين حالة الاتصال الصوتي
let voiceConnection = null;
let audioPlayer = createAudioPlayer();
let currentVoiceChannel = null;
let currentGuild = null;

// إعداد Express
app.use(express.json());
app.use(express.static('public'));

// ============ API ENDPOINTS ============

// جلب معلومات المستخدم
app.get('/api/user', (req, res) => {
    if (!client.user) {
        return res.status(503).json({ error: 'البوت ليس جاهزاً بعد' });
    }
    
    res.json({
        id: client.user.id,
        username: client.user.username,
        discriminator: client.user.discriminator,
        avatar: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 }),
        status: client.user.presence?.status || 'offline'
    });
});

// جلب قائمة الخوادم
app.get('/api/guilds', (req, res) => {
    const guilds = client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL({ format: 'png', dynamic: true, size: 128 }),
        memberCount: guild.memberCount,
        channels: guild.channels.cache
            .filter(ch => ch.type === 'GUILD_VOICE' || ch.type === 'GUILD_TEXT')
            .map(ch => ({
                id: ch.id,
                name: ch.name,
                type: ch.type === 'GUILD_VOICE' ? 'voice' : 'text'
            }))
    }));
    
    res.json(guilds);
});

// الدخول إلى قناة صوتية
app.post('/api/voice/join', async (req, res) => {
    const { guildId, channelId } = req.body;
    
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
            voiceConnection.destroy();
        }
        
        // الاتصال بالقناة الصوتية
        voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });
        
        currentVoiceChannel = channel.id;
        currentGuild = guild.id;
        
        // تشغيل الصوت
        voiceConnection.subscribe(audioPlayer);
        
        res.json({ 
            success: true, 
            message: `✅ تم الاتصال بـ ${channel.name}`,
            channel: channel.name,
            guild: guild.name
        });
        
    } catch (error) {
        console.error('خطأ في الاتصال الصوتي:', error);
        res.status(500).json({ error: 'فشل الاتصال بالقناة الصوتية' });
    }
});

// مغادرة القناة الصوتية
app.post('/api/voice/leave', (req, res) => {
    if (voiceConnection) {
        voiceConnection.destroy();
        voiceConnection = null;
        currentVoiceChannel = null;
        currentGuild = null;
        res.json({ success: true, message: '✅ تم مغادرة القناة الصوتية' });
    } else {
        res.json({ success: true, message: '⚠️ لست متصلاً بأي قناة صوتية' });
    }
});

// الحصول على حالة الصوت
app.get('/api/voice/status', (req, res) => {
    res.json({
        connected: voiceConnection !== null,
        guildId: currentGuild,
        channelId: currentVoiceChannel
    });
});

// تحديث الحالة
app.post('/api/status', async (req, res) => {
    const { status, activity, activityType } = req.body;
    
    try {
        let discordStatus = status || 'online';
        let presenceData = {};
        
        if (activity) {
            presenceData.activities = [{
                name: activity,
                type: activityType ? parseInt(activityType) : 0 // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching
            }];
        }
        
        await client.user.setPresence({
            status: discordStatus,
            activities: presenceData.activities || []
        });
        
        res.json({ success: true, message: '✅ تم تحديث الحالة' });
    } catch (error) {
        res.status(500).json({ error: 'فشل تحديث الحالة' });
    }
});

// إرسال رسالة
app.post('/api/message/send', async (req, res) => {
    const { channelId, message } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }
        
        await channel.send(message);
        res.json({ success: true, message: '✅ تم إرسال الرسالة' });
    } catch (error) {
        res.status(500).json({ error: 'فشل إرسال الرسالة' });
    }
});

// ============ تشغيل البوت ============

client.on('ready', async () => {
    console.log(`✅ تم تسجيل الدخول كـ ${client.user.tag}`);
    console.log(`🆔 معرف المستخدم: ${client.user.id}`);
    console.log(`🌐 عدد الخوادم: ${client.guilds.cache.size}`);
});

client.on('error', (error) => {
    console.error('❌ خطأ في البوت:', error);
});

// تسجيل الدخول
client.login(token).catch(err => {
    console.error('❌ فشل تسجيل الدخول:', err.message);
    process.exit(1);
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 لوحة التحكم تعمل على المنفذ ${PORT}`);
});
