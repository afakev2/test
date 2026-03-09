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

// تخزين الحالات المختلفة
let voiceConnection = null;
let audioPlayer = createAudioPlayer();
let currentVoiceChannel = null;
let currentGuild = null;
let voiceUsers = new Map();
let afkMode = false;
let messageCache = new Map();
let typingTimeouts = new Map();
let userNotes = new Map();
let pinnedMessages = new Map();
let channelWebhooks = new Map();
let serverEmojis = new Map();
let serverStickers = new Map();
let serverRoles = new Map();
let serverInvites = new Map();
let serverBans = new Map();
let serverAuditLogs = new Map();
let serverTemplates = new Map();
let serverIntegrations = new Map();
let serverWidgets = new Map();
let serverVanityUrl = new Map();
let serverPremiumSubscriptions = new Map();
let serverScheduledEvents = new Map();
let serverThreads = new Map();
let serverStageInstances = new Map();

// إعداد Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// ============ MIDDLEWARE ============
const checkBotReady = (req, res, next) => {
    if (!client || !client.user) {
        return res.status(503).json({ error: 'البوت ليس جاهزاً بعد' });
    }
    next();
};

const checkVoiceConnection = (req, res, next) => {
    if (!voiceConnection) {
        return res.status(400).json({ error: 'لست متصلاً بقناة صوتية' });
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
            globalName: client.user.globalName,
            avatar: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 }),
            banner: client.user.bannerURL({ format: 'png', dynamic: true, size: 4096 }),
            accentColor: client.user.accentColor,
            status: client.user.presence?.status || 'offline',
            activities: client.user.presence?.activities || [],
            clientStatus: client.user.presence?.clientStatus || {},
            createdAt: client.user.createdTimestamp,
            bot: client.user.bot || false,
            system: client.user.system || false,
            flags: client.user.flags?.toArray() || [],
            premium: client.user.premium || false,
            mfaEnabled: client.user.mfaEnabled || false,
            verified: client.user.verified || false,
            email: client.user.email || null,
            phone: client.user.phone || null
        });
    } catch (error) {
        res.status(500).json({ error: 'خطأ في جلب معلومات المستخدم' });
    }
});

// جلب قائمة الخوادم مع جميع التفاصيل
app.get('/api/guilds', checkBotReady, async (req, res) => {
    try {
        const guilds = await Promise.all(client.guilds.cache.map(async guild => {
            // جلب جميع القنوات
            const channels = guild.channels.cache.map(ch => ({
                id: ch.id,
                name: ch.name,
                type: ch.type,
                parentId: ch.parentId,
                position: ch.position,
                nsfw: ch.nsfw || false,
                bitrate: ch.bitrate || null,
                userLimit: ch.userLimit || null,
                rateLimitPerUser: ch.rateLimitPerUser || 0,
                topic: ch.topic || null,
                lastMessageId: ch.lastMessageId,
                lastPinTimestamp: ch.lastPinTimestamp,
                messages: [],
                threadMetadata: ch.threadMetadata || null,
                memberCount: ch.memberCount || null,
                messageCount: ch.messageCount || null
            }));

            // جلب جميع الرتب
            const roles = guild.roles.cache.map(role => ({
                id: role.id,
                name: role.name,
                color: role.hexColor,
                position: role.position,
                permissions: role.permissions.toArray(),
                mentionable: role.mentionable,
                hoist: role.hoist,
                managed: role.managed,
                icon: role.iconURL(),
                unicodeEmoji: role.unicodeEmoji,
                tags: role.tags || null
            }));

            // جلب جميع الأعضاء
            const members = await guild.members.fetch();
            const membersList = members.map(member => ({
                id: member.id,
                username: member.user.username,
                discriminator: member.user.discriminator,
                globalName: member.user.globalName,
                avatar: member.user.displayAvatarURL({ dynamic: true }),
                banner: member.user.bannerURL({ dynamic: true }),
                accentColor: member.user.accentColor,
                nickname: member.nickname,
                roles: member.roles.cache.map(r => r.id),
                joinedAt: member.joinedTimestamp,
                premiumSince: member.premiumSinceTimestamp,
                communicationDisabledUntil: member.communicationDisabledUntilTimestamp,
                pending: member.pending || false,
                voice: member.voice.channelId ? {
                    channelId: member.voice.channelId,
                    mute: member.voice.mute,
                    deaf: member.voice.deaf,
                    selfMute: member.voice.selfMute,
                    selfDeaf: member.voice.selfDeaf,
                    streaming: member.voice.streaming,
                    selfVideo: member.voice.selfVideo,
                    suppress: member.voice.suppress,
                    requestToSpeak: member.voice.requestToSpeakTimestamp
                } : null,
                presence: member.presence ? {
                    status: member.presence.status,
                    activities: member.presence.activities,
                    clientStatus: member.presence.clientStatus
                } : null
            }));

            // جلب الإيموجي
            const emojis = guild.emojis.cache.map(emoji => ({
                id: emoji.id,
                name: emoji.name,
                animated: emoji.animated,
                url: emoji.url,
                available: emoji.available,
                managed: emoji.managed,
                requireColons: emoji.requireColons,
                roles: emoji.roles.cache.map(r => r.id)
            }));

            // جلب الستيكرات
            const stickers = guild.stickers.cache.map(sticker => ({
                id: sticker.id,
                name: sticker.name,
                description: sticker.description,
                tags: sticker.tags,
                type: sticker.type,
                format: sticker.format,
                url: sticker.url,
                available: sticker.available
            }));

            // جلب الدعوات
            const invites = await guild.invites.fetch().catch(() => []);
            const invitesList = invites.map(invite => ({
                code: invite.code,
                channel: invite.channel?.id,
                inviter: invite.inviter?.id,
                uses: invite.uses,
                maxUses: invite.maxUses,
                maxAge: invite.maxAge,
                temporary: invite.temporary,
                createdAt: invite.createdTimestamp,
                expiresAt: invite.expiresTimestamp
            }));

            // جلب المحظورين
            const bans = await guild.bans.fetch().catch(() => []);
            const bansList = bans.map(ban => ({
                user: ban.user.id,
                reason: ban.reason
            }));

            // جلب الأحداث المجدولة
            const events = guild.scheduledEvents.cache.map(event => ({
                id: event.id,
                name: event.name,
                description: event.description,
                scheduledStart: event.scheduledStartTimestamp,
                scheduledEnd: event.scheduledEndTimestamp,
                privacyLevel: event.privacyLevel,
                status: event.status,
                entityType: event.entityType,
                entityId: event.entityId,
                channelId: event.channelId,
                creator: event.creator?.id,
                userCount: event.userCount,
                image: event.coverImageURL()
            }));

            // جلب الثريدز
            const threads = guild.channels.cache
                .filter(ch => ch.isThread())
                .map(thread => ({
                    id: thread.id,
                    name: thread.name,
                    type: thread.type,
                    parentId: thread.parentId,
                    ownerId: thread.ownerId,
                    messageCount: thread.messageCount,
                    memberCount: thread.memberCount,
                    archiveTimestamp: thread.archiveTimestamp,
                    autoArchiveDuration: thread.autoArchiveDuration,
                    locked: thread.locked || false,
                    invitable: thread.invitable || false,
                    createdAt: thread.createdTimestamp
                }));

            return {
                id: guild.id,
                name: guild.name,
                icon: guild.iconURL({ format: 'png', dynamic: true, size: 4096 }),
                banner: guild.bannerURL({ format: 'png', size: 4096 }),
                splash: guild.splashURL({ format: 'png', size: 4096 }),
                discoverySplash: guild.discoverySplashURL({ format: 'png' }),
                description: guild.description,
                memberCount: guild.memberCount,
                ownerId: guild.ownerId,
                createdAt: guild.createdTimestamp,
                joinedAt: guild.joinedTimestamp,
                large: guild.large,
                features: guild.features,
                premiumTier: guild.premiumTier,
                premiumSubscriptionCount: guild.premiumSubscriptionCount,
                verificationLevel: guild.verificationLevel,
                explicitContentFilter: guild.explicitContentFilter,
                defaultMessageNotifications: guild.defaultMessageNotifications,
                mfaLevel: guild.mfaLevel,
                nsfwLevel: guild.nsfwLevel,
                systemChannelId: guild.systemChannelId,
                systemChannelFlags: guild.systemChannelFlags?.toArray() || [],
                rulesChannelId: guild.rulesChannelId,
                publicUpdatesChannelId: guild.publicUpdatesChannelId,
                safetyAlertsChannelId: guild.safetyAlertsChannelId,
                vanityURLCode: guild.vanityURLCode,
                vanityURLUses: guild.vanityURLUses,
                widgetEnabled: guild.widgetEnabled,
                widgetChannelId: guild.widgetChannelId,
                maxMembers: guild.maximumMembers,
                maxPresences: guild.maxPresences,
                maxVideoChannelUsers: guild.maxVideoChannelUsers,
                approximateMemberCount: guild.approximateMemberCount,
                approximatePresenceCount: guild.approximatePresenceCount,
                channels,
                roles,
                members: membersList,
                emojis,
                stickers,
                invites: invitesList,
                bans: bansList,
                events,
                threads
            };
        }));

        res.json(guilds);
    } catch (error) {
        console.error('خطأ في جلب الخوادم:', error);
        res.status(500).json({ error: 'فشل جلب الخوادم' });
    }
});

// جلب رسائل القناة مع جميع التفاصيل
app.get('/api/channel/:channelId/messages', checkBotReady, async (req, res) => {
    const { channelId } = req.params;
    const { limit = 50, before, after, around } = req.query;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }

        const options = { limit: parseInt(limit) };
        if (before) options.before = before;
        if (after) options.after = after;
        if (around) options.around = around;

        const messages = await channel.messages.fetch(options);
        
        const formattedMessages = await Promise.all(messages.map(async msg => {
            // جلب الردود على الرسالة
            let replies = [];
            if (msg.reference) {
                try {
                    const repliedMsg = await msg.channel.messages.fetch(msg.reference.messageId);
                    replies.push({
                        id: repliedMsg.id,
                        content: repliedMsg.content,
                        author: repliedMsg.author.id
                    });
                } catch (e) {}
            }

            // جلب من قام بالتفاعل
            const reactions = msg.reactions.cache.map(r => ({
                emoji: r.emoji.toString(),
                count: r.count,
                users: r.users.cache.map(u => u.id)
            }));

            return {
                id: msg.id,
                type: msg.type,
                content: msg.content,
                cleanContent: msg.cleanContent,
                author: {
                    id: msg.author.id,
                    username: msg.author.username,
                    discriminator: msg.author.discriminator,
                    globalName: msg.author.globalName,
                    avatar: msg.author.displayAvatarURL({ dynamic: true, size: 256 }),
                    bot: msg.author.bot,
                    system: msg.author.system,
                    flags: msg.author.flags?.toArray()
                },
                member: msg.member ? {
                    nickname: msg.member.nickname,
                    roles: msg.member.roles.cache.map(r => r.id),
                    joinedAt: msg.member.joinedTimestamp,
                    premiumSince: msg.member.premiumSinceTimestamp,
                    avatar: msg.member.avatarURL(),
                    communicationDisabledUntil: msg.member.communicationDisabledUntilTimestamp
                } : null,
                timestamp: msg.createdTimestamp,
                editedTimestamp: msg.editedTimestamp,
                attachments: msg.attachments.map(att => ({
                    id: att.id,
                    url: att.url,
                    proxyURL: att.proxyURL,
                    name: att.name,
                    size: att.size,
                    contentType: att.contentType,
                    height: att.height,
                    width: att.width,
                    ephemeral: att.ephemeral
                })),
                embeds: msg.embeds,
                stickers: msg.stickers.map(s => ({
                    id: s.id,
                    name: s.name,
                    format: s.format,
                    url: s.url
                })),
                components: msg.components,
                mentions: {
                    users: msg.mentions.users.map(u => u.id),
                    roles: msg.mentions.roles.map(r => r.id),
                    channels: msg.mentions.channels.map(c => c.id),
                    everyone: msg.mentions.everyone,
                    crosspostedChannels: msg.mentions.crosspostedChannels
                },
                reactions,
                replies,
                pinned: msg.pinned,
                tts: msg.tts,
                flags: msg.flags?.toArray(),
                reference: msg.reference ? {
                    messageId: msg.reference.messageId,
                    channelId: msg.reference.channelId,
                    guildId: msg.reference.guildId
                } : null,
                interaction: msg.interaction ? {
                    id: msg.interaction.id,
                    type: msg.interaction.type,
                    name: msg.interaction.name,
                    user: msg.interaction.user.id
                } : null,
                thread: msg.hasThread ? {
                    id: msg.thread.id,
                    name: msg.thread.name,
                    memberCount: msg.thread.memberCount,
                    messageCount: msg.thread.messageCount
                } : null,
                position: msg.position,
                roleSubscriptionData: msg.roleSubscriptionData,
                webhookId: msg.webhookId,
                applicationId: msg.applicationId,
                nonce: msg.nonce
            };
        }));

        // تخزين في الكاش
        messageCache.set(channelId, formattedMessages);

        res.json(formattedMessages.reverse()); // ترتيب تصاعدي
        
    } catch (error) {
        console.error('خطأ في جلب الرسائل:', error);
        res.status(500).json({ error: error.message });
    }
});

// الدخول إلى قناة صوتية عن طريق الضغط
app.post('/api/voice/join/:channelId', checkBotReady, async (req, res) => {
    const { channelId } = req.params;
    const { selfMute = false, selfDeaf = false } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel || channel.type !== 'GUILD_VOICE') {
            return res.status(400).json({ error: 'القناة غير موجودة أو ليست قناة صوتية' });
        }

        const guild = channel.guild;

        if (voiceConnection) {
            try {
                voiceConnection.destroy();
            } catch (e) {}
            voiceConnection = null;
        }

        voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: selfDeaf,
            selfMute: selfMute
        });

        currentVoiceChannel = channel.id;
        currentGuild = guild.id;

        voiceConnection.subscribe(audioPlayer);

        // تحديث قائمة المستخدمين
        await updateVoiceUsers(channel);

        res.json({ 
            success: true, 
            message: `✅ تم الاتصال بـ ${channel.name}`,
            channel: {
                id: channel.id,
                name: channel.name,
                guildId: guild.id,
                guildName: guild.name
            },
            users: Array.from(voiceUsers.values())
        });

    } catch (error) {
        console.error('خطأ في الاتصال الصوتي:', error);
        res.status(500).json({ error: error.message });
    }
});

// الحصول على مستخدمي القناة الصوتية
app.get('/api/voice/users', checkBotReady, checkVoiceConnection, (req, res) => {
    res.json(Array.from(voiceUsers.values()));
});

// تحديث قائمة المستخدمين في القناة الصوتية
async function updateVoiceUsers(channel) {
    try {
        if (!channel || !channel.members) {
            voiceUsers.clear();
            return;
        }

        voiceUsers.clear();
        
        channel.members.forEach(member => {
            voiceUsers.set(member.id, {
                id: member.id,
                username: member.user.username,
                discriminator: member.user.discriminator,
                globalName: member.user.globalName,
                avatar: member.user.displayAvatarURL({ dynamic: true, size: 256 }),
                banner: member.user.bannerURL({ dynamic: true }),
                accentColor: member.user.accentColor,
                nickname: member.nickname,
                roles: member.roles.cache.map(r => ({
                    id: r.id,
                    name: r.name,
                    color: r.hexColor,
                    position: r.position
                })),
                voice: {
                    mute: member.voice.mute || false,
                    deaf: member.voice.deaf || false,
                    selfMute: member.voice.selfMute || false,
                    selfDeaf: member.voice.selfDeaf || false,
                    streaming: member.voice.streaming || false,
                    selfVideo: member.voice.selfVideo || false,
                    suppress: member.voice.suppress || false,
                    requestToSpeak: member.voice.requestToSpeakTimestamp || null
                },
                premium: member.premiumSince ? true : false,
                joinedAt: member.joinedTimestamp,
                permissions: member.permissions.toArray()
            });
        });
    } catch (error) {
        console.error('خطأ في تحديث قائمة المستخدمين:', error);
        voiceUsers.clear();
    }
}

// إرسال رسالة
app.post('/api/message/send', checkBotReady, async (req, res) => {
    const { channelId, content, replyTo, mentions, tts, stickers, embeds, components, files } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }

        const messageOptions = {
            content,
            tts: tts || false,
            allowedMentions: mentions || { parse: ['users', 'roles'] },
            stickers: stickers || [],
            embeds: embeds || [],
            components: components || [],
            files: files || []
        };

        let sentMessage;
        if (replyTo) {
            const replyMessage = await channel.messages.fetch(replyTo);
            sentMessage = await replyMessage.reply(messageOptions);
        } else {
            sentMessage = await channel.send(messageOptions);
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

// بدء الكتابة
app.post('/api/channel/:channelId/typing', checkBotReady, async (req, res) => {
    const { channelId } = req.params;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }

        await channel.sendTyping();
        res.json({ success: true, message: '✅ جاري الكتابة...' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب الأعضاء المتصلين
app.get('/api/guild/:guildId/members', checkBotReady, async (req, res) => {
    const { guildId } = req.params;
    const { limit = 1000, after, query } = req.query;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }

        let members;
        if (query) {
            members = await guild.members.search({ query, limit: parseInt(limit) });
        } else {
            members = await guild.members.fetch({ limit: parseInt(limit), after });
        }

        const membersList = members.map(member => ({
            id: member.id,
            username: member.user.username,
            discriminator: member.user.discriminator,
            globalName: member.user.globalName,
            avatar: member.user.displayAvatarURL({ dynamic: true }),
            banner: member.user.bannerURL({ dynamic: true }),
            accentColor: member.user.accentColor,
            nickname: member.nickname,
            roles: member.roles.cache.map(r => r.id),
            joinedAt: member.joinedTimestamp,
            premiumSince: member.premiumSinceTimestamp,
            communicationDisabledUntil: member.communicationDisabledUntilTimestamp,
            pending: member.pending,
            voice: member.voice.channelId ? {
                channelId: member.voice.channelId,
                mute: member.voice.mute,
                deaf: member.voice.deaf,
                selfMute: member.voice.selfMute,
                selfDeaf: member.voice.selfDeaf,
                streaming: member.voice.streaming
            } : null,
            presence: member.presence ? {
                status: member.presence.status,
                activities: member.presence.activities,
                clientStatus: member.presence.clientStatus
            } : null
        }));

        res.json(membersList);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب الرتب
app.get('/api/guild/:guildId/roles', checkBotReady, (req, res) => {
    const { guildId } = req.params;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }

        const roles = guild.roles.cache.map(role => ({
            id: role.id,
            name: role.name,
            color: role.hexColor,
            position: role.position,
            permissions: role.permissions.toArray(),
            mentionable: role.mentionable,
            hoist: role.hoist,
            managed: role.managed,
            icon: role.iconURL(),
            unicodeEmoji: role.unicodeEmoji,
            tags: role.tags,
            members: role.members.map(m => m.id),
            createdAt: role.createdTimestamp
        }));

        res.json(roles);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب الإيموجي
app.get('/api/guild/:guildId/emojis', checkBotReady, (req, res) => {
    const { guildId } = req.params;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }

        const emojis = guild.emojis.cache.map(emoji => ({
            id: emoji.id,
            name: emoji.name,
            animated: emoji.animated,
            url: emoji.url,
            available: emoji.available,
            managed: emoji.managed,
            requireColons: emoji.requireColons,
            roles: emoji.roles.cache.map(r => r.id)
        }));

        res.json(emojis);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب الستيكرات
app.get('/api/guild/:guildId/stickers', checkBotReady, (req, res) => {
    const { guildId } = req.params;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }

        const stickers = guild.stickers.cache.map(sticker => ({
            id: sticker.id,
            name: sticker.name,
            description: sticker.description,
            tags: sticker.tags,
            type: sticker.type,
            format: sticker.format,
            url: sticker.url,
            available: sticker.available
        }));

        res.json(stickers);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب الدعوات
app.get('/api/guild/:guildId/invites', checkBotReady, async (req, res) => {
    const { guildId } = req.params;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }

        const invites = await guild.invites.fetch();
        const invitesList = invites.map(invite => ({
            code: invite.code,
            channel: {
                id: invite.channel?.id,
                name: invite.channel?.name
            },
            inviter: invite.inviter ? {
                id: invite.inviter.id,
                username: invite.inviter.username
            } : null,
            uses: invite.uses,
            maxUses: invite.maxUses,
            maxAge: invite.maxAge,
            temporary: invite.temporary,
            createdAt: invite.createdTimestamp,
            expiresAt: invite.expiresTimestamp,
            targetUser: invite.targetUser ? {
                id: invite.targetUser.id,
                username: invite.targetUser.username
            } : null,
            targetType: invite.targetType
        }));

        res.json(invitesList);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إنشاء دعوة
app.post('/api/channel/:channelId/invite', checkBotReady, async (req, res) => {
    const { channelId } = req.params;
    const { maxAge = 86400, maxUses = 0, temporary = false, unique = false } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }

        const invite = await channel.createInvite({
            maxAge,
            maxUses,
            temporary,
            unique,
            reason: 'تم إنشاء دعوة عبر لوحة التحكم'
        });

        res.json({
            code: invite.code,
            url: `https://discord.gg/${invite.code}`,
            expiresAt: invite.expiresTimestamp
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب المحظورين
app.get('/api/guild/:guildId/bans', checkBotReady, async (req, res) => {
    const { guildId } = req.params;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }

        const bans = await guild.bans.fetch();
        const bansList = bans.map(ban => ({
            user: {
                id: ban.user.id,
                username: ban.user.username,
                discriminator: ban.user.discriminator
            },
            reason: ban.reason
        }));

        res.json(bansList);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// حظر مستخدم
app.post('/api/guild/:guildId/ban', checkBotReady, async (req, res) => {
    const { guildId } = req.params;
    const { userId, reason, deleteMessageDays = 0 } = req.body;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }

        await guild.members.ban(userId, { 
            reason, 
            deleteMessageDays 
        });

        res.json({ success: true, message: '✅ تم حظر المستخدم' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// فك حظر مستخدم
app.post('/api/guild/:guildId/unban', checkBotReady, async (req, res) => {
    const { guildId } = req.params;
    const { userId } = req.body;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }

        await guild.members.unban(userId, 'تم فك الحظر عبر لوحة التحكم');
        res.json({ success: true, message: '✅ تم فك حظر المستخدم' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب سجل التدقيق
app.get('/api/guild/:guildId/audit-logs', checkBotReady, async (req, res) => {
    const { guildId } = req.params;
    const { limit = 50, actionType, userId } = req.query;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }

        const options = { limit: parseInt(limit) };
        if (actionType) options.type = parseInt(actionType);
        if (userId) options.userId = userId;

        const logs = await guild.fetchAuditLogs(options);
        
        const entries = logs.entries.map(entry => ({
            id: entry.id,
            action: entry.action,
            target: entry.target?.id,
            executor: entry.executor?.id,
            reason: entry.reason,
            createdAt: entry.createdTimestamp,
            changes: entry.changes
        }));

        res.json(entries);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب الأحداث المجدولة
app.get('/api/guild/:guildId/events', checkBotReady, (req, res) => {
    const { guildId } = req.params;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }

        const events = guild.scheduledEvents.cache.map(event => ({
            id: event.id,
            name: event.name,
            description: event.description,
            scheduledStart: event.scheduledStartTimestamp,
            scheduledEnd: event.scheduledEndTimestamp,
            privacyLevel: event.privacyLevel,
            status: event.status,
            entityType: event.entityType,
            entityId: event.entityId,
            channelId: event.channelId,
            creator: event.creator?.id,
            userCount: event.userCount,
            image: event.coverImageURL(),
            location: event.entityMetadata?.location
        }));

        res.json(events);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إنشاء حدث مجدول
app.post('/api/guild/:guildId/event', checkBotReady, async (req, res) => {
    const { guildId } = req.params;
    const { name, description, scheduledStart, scheduledEnd, privacyLevel, entityType, channelId, entityMetadata } = req.body;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'الخادم غير موجود' });
        }

        const event = await guild.scheduledEvents.create({
            name,
            description,
            scheduledStartTime: scheduledStart,
            scheduledEndTime: scheduledEnd,
            privacyLevel,
            entityType,
            channel: channelId,
            entityMetadata,
            reason: 'تم إنشاء حدث عبر لوحة التحكم'
        });

        res.json({
            success: true,
            message: '✅ تم إنشاء الحدث',
            eventId: event.id
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب الثريدز
app.get('/api/channel/:channelId/threads', checkBotReady, async (req, res) => {
    const { channelId } = req.params;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }

        const activeThreads = await channel.threads.fetchActive();
        const archivedThreads = await channel.threads.fetchArchived();

        const threads = [
            ...activeThreads.threads.map(thread => ({
                id: thread.id,
                name: thread.name,
                type: thread.type,
                ownerId: thread.ownerId,
                messageCount: thread.messageCount,
                memberCount: thread.memberCount,
                archiveTimestamp: thread.archiveTimestamp,
                autoArchiveDuration: thread.autoArchiveDuration,
                locked: thread.locked,
                createdAt: thread.createdTimestamp,
                archived: false
            })),
            ...archivedThreads.threads.map(thread => ({
                id: thread.id,
                name: thread.name,
                type: thread.type,
                ownerId: thread.ownerId,
                messageCount: thread.messageCount,
                memberCount: thread.memberCount,
                archiveTimestamp: thread.archiveTimestamp,
                autoArchiveDuration: thread.autoArchiveDuration,
                locked: thread.locked,
                createdAt: thread.createdTimestamp,
                archived: true
            }))
        ];

        res.json(threads);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إنشاء ثريد
app.post('/api/channel/:channelId/thread', checkBotReady, async (req, res) => {
    const { channelId } = req.params;
    const { name, autoArchiveDuration, type, messageId } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'القناة غير موجودة' });
        }

        let thread;
        if (messageId) {
            const message = await channel.messages.fetch(messageId);
            thread = await message.startThread({
                name,
                autoArchiveDuration
            });
        } else {
            thread = await channel.threads.create({
                name,
                autoArchiveDuration,
                type
            });
        }

        res.json({
            success: true,
            message: '✅ تم إنشاء الثريد',
            threadId: thread.id
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// جلب مرحلة الصوت
app.get('/api/channel/:channelId/stage', checkBotReady, async (req, res) => {
    const { channelId } = req.params;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel || channel.type !== 'GUILD_STAGE_VOICE') {
            return res.status(400).json({ error: 'القناة ليست مرحلة صوتية' });
        }

        const instance = channel.stageInstance;
        if (!instance) {
            return res.json({ active: false });
        }

        res.json({
            active: true,
            topic: instance.topic,
            privacyLevel: instance.privacyLevel,
            discoverableDisabled: instance.discoverableDisabled,
            speakers: instance.members?.filter(m => !m.voice.suppress).map(m => m.id) || []
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// إنشاء مرحلة صوتية
app.post('/api/channel/:channelId/stage', checkBotReady, async (req, res) => {
    const { channelId } = req.params;
    const { topic, privacyLevel } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel || channel.type !== 'GUILD_STAGE_VOICE') {
            return res.status(400).json({ error: 'القناة ليست مرحلة صوتية' });
        }

        const instance = await channel.createStageInstance({
            topic,
            privacyLevel
        });

        res.json({
            success: true,
            message: '✅ تم إنشاء المرحلة الصوتية',
            topic: instance.topic
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// تحديث الحالة
app.post('/api/status', checkBotReady, async (req, res) => {
    const { status, activity, activityType, afk, customStatus } = req.body;
    
    try {
        if (afk !== undefined) {
            afkMode = afk;
        }

        const activities = [];
        
        if (activity) {
            activities.push({
                name: activity,
                type: parseInt(activityType) || 0,
                url: activityType === '1' ? 'https://twitch.tv/stream' : undefined
            });
        }

        if (customStatus) {
            activities.push({
                type: 4, // Custom Status
                state: customStatus,
                name: 'Custom Status'
            });
        }

        await client.user.setPresence({
            status: status || (afkMode ? 'idle' : 'online'),
            activities
        });

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

// فحص الصحة
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
    console.log(`📊 عدد القنوات: ${client.channels.cache.size}`);
    console.log('✅ ================================');
});

client.on('error', (error) => {
    console.error('❌ خطأ في البوت:', error);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        // تحديث قائمة المستخدمين إذا كان التغيير في القناة الحالية
        if (currentVoiceChannel) {
            if (newState.channelId === currentVoiceChannel) {
                await updateVoiceUsers(newState.channel);
            } else if (oldState.channelId === currentVoiceChannel) {
                const channel = client.channels.cache.get(currentVoiceChannel);
                if (channel) {
                    await updateVoiceUsers(channel);
                } else {
                    voiceUsers.clear();
                }
            }
        }
    } catch (error) {
        console.error('خطأ في تحديث حالة الصوت:', error);
    }
});

client.on('messageCreate', (message) => {
    // تحديث الكاش عند وصول رسالة جديدة
    if (messageCache.has(message.channelId)) {
        const cached = messageCache.get(message.channelId);
        // يمكن إضافة الرسالة الجديدة للكاش هنا
    }
});

client.on('messageDelete', (message) => {
    if (messageCache.has(message.channelId)) {
        // تحديث الكاش عند حذف رسالة
    }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    if (messageCache.has(newMessage.channelId)) {
        // تحديث الكاش عند تعديل رسالة
    }
});

client.on('guildMemberAdd', (member) => {
    console.log(`👤 عضو جديد انضم: ${member.user.tag} إلى ${member.guild.name}`);
});

client.on('guildMemberRemove', (member) => {
    console.log(`👤 عضو غادر: ${member.user.tag} من ${member.guild.name}`);
});

client.on('guildCreate', (guild) => {
    console.log(`✅ تم إضافة البوت إلى خادم جديد: ${guild.name}`);
});

client.on('guildDelete', (guild) => {
    console.log(`❌ تم إزالة البوت من خادم: ${guild.name}`);
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
