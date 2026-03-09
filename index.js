const express = require('express');
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, createAudioPlayer } = require('@discordjs/voice');
const app = express();

// التحقق من وجود التوكن
const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ يجب تعيين DISCORD_TOKEN في المتغيرات البيئية');
    process.exit(1);
}

// إنشاء عميل السيلف بوت مع إعدادات مبسطة
const client = new Client({
    checkUpdate: false,
    ws: {
        properties: {
            $browser: "Discord iOS"
        }
    }
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
    try {
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
    } catch (error) {
        console.error('خطأ في جلب الخوادم:', error);
        res.status(500).json({ error: 'فشل جلب الخوادم' });
    }
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
    try {
        if (voiceConnection) {
            voiceConnection.destroy();
            voiceConnection = null;
            currentVoiceChannel = null;
            currentGuild = null;
            res.json({ success: true, message: '✅ تم مغادرة القناة الصوتية' });
        } else {
            res.json({ success: true, message: '⚠️ لست متصلاً بأي قناة صوتية' });
        }
    } catch (error) {
        res.status(500).json({ error: 'فشل مغادرة القناة الصوتية' });
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
        await client.user.setPresence({
            status: status || 'online',
            activities: activity ? [{
                name: activity,
                type: parseInt(activityType) || 0
            }] : []
        });
        
        res.json({ success: true, message: '✅ تم تحديث الحالة' });
    } catch (error) {
        console.error('خطأ في تحديث الحالة:', error);
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
        console.error('خطأ في إرسال الرسالة:', error);
        res.status(500).json({ error: 'فشل إرسال الرسالة' });
    }
});

// فحص الصحة
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        bot: client.user ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});

// ============ تشغيل البوت ============

client.on('ready', async () => {
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log(`👤 المستخدم: ${client.user.tag}`);
    console.log(`🆔 المعرف: ${client.user.id}`);
    console.log(`🌐 عدد الخوادم: ${client.guilds.cache.size}`);
});

client.on('error', (error) => {
    console.error('❌ خطأ في البوت:', error);
});

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (error) => {
    console.error('❌ خطأ غير معالج:', error);
});

// تسجيل الدخول
console.log('🔄 جاري تسجيل الدخول...');
client.login(token).catch(err => {
    console.error('❌ فشل تسجيل الدخول:', err.message);
    process.exit(1);
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 لوحة التحكم تعمل على المنفذ ${PORT}`);
});
