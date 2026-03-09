// index.js
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');

// إنشاء عميل جديد خاص بالسيلف بوت
const client = new Client();

// ثوابت الإعدادات (يفضل وضعها في ملف منفصل مثل config.js)
const CONFIG = {
    TOKEN: 'YOUR_DISCORD_USER_TOKEN', // ضع توكن حسابك الشخصي هنا
    GUILD_ID: 'YOUR_SERVER_ID', // ID السيرفر الذي تريد الدخول منه للصوت
    VOICE_CHANNEL_ID: 'YOUR_VOICE_CHANNEL_ID' // ID القناة الصوتية التي تريد الدخول إليها
};

// حدث التشغيل عند تسجيل الدخول بنجاح
client.on('ready', async () => {
    console.log(`✅ تم تسجيل الدخول كـ ${client.user.tag}`);

    // جلب معلومات السيرفر والقناة الصوتية
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    const voiceChannel = guild.channels.cache.get(CONFIG.VOICE_CHANNEL_ID);

    if (!voiceChannel) {
        return console.error('❌ لم يتم العثور على القناة الصوتية. تأكد من الـ ID.');
    }

    console.log(`⌛ محاولة الاتصال بالقناة الصوتية: ${voiceChannel.name}...`);

    try {
        // استخدام الدالة الخاصة بالمكتبة للاتصال بالقناة الصوتية
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false, // يجعل الحساب غير "مكتوم" حتى يتمكن من سماع نفسه إذا لزم الأمر
            selfMute: false  // يجعل الحساب غير "كتم المايك"
        });

        console.log(`🔊 تم الاتصال بنجاح بالقناة الصوتية: ${voiceChannel.name}`);
        // هنا يمكنك إضافة أوامر أخرى أو تفعيل استقبال البث الصوتي إذا أردت.
        // connection.receiver...  يمكن استخدامه لاستقبال الصوت من الآخرين.

    } catch (error) {
        console.error('❌ فشل الاتصال بالقناة الصوتية:', error);
    }
});

// حدث لأي خطأ عام
client.on('error', console.error);

// تسجيل الدخول باستخدام التوكن
client.login(CONFIG.TOKEN);
