const express = require('express');
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, createAudioPlayer } = require('@discordjs/voice');
const app = express();

const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ DISCORD_TOKEN is required');
    process.exit(1);
}

const client = new Client({
    checkUpdate: false
});

let voiceConnection = null;
let audioPlayer = createAudioPlayer();

app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', bot: client.user ? 'connected' : 'disconnected' });
});

// User info
app.get('/api/user', (req, res) => {
    if (!client.user) {
        return res.status(503).json({ error: 'Bot not ready' });
    }
    res.json({
        id: client.user.id,
        username: client.user.username,
        discriminator: client.user.discriminator,
        avatar: client.user.displayAvatarURL({ format: 'png', size: 256 })
    });
});

// Guilds list
app.get('/api/guilds', (req, res) => {
    const guilds = client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL({ format: 'png', size: 128 }),
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

// Join voice
app.post('/api/voice/join', async (req, res) => {
    const { guildId, channelId } = req.body;
    
    try {
        const guild = client.guilds.cache.get(guildId);
        const channel = guild?.channels.cache.get(channelId);
        
        if (!channel || channel.type !== 'GUILD_VOICE') {
            return res.status(400).json({ error: 'Invalid voice channel' });
        }
        
        if (voiceConnection) {
            voiceConnection.destroy();
        }
        
        voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });
        
        voiceConnection.subscribe(audioPlayer);
        
        res.json({ success: true, message: `✅ Connected to ${channel.name}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Leave voice
app.post('/api/voice/leave', (req, res) => {
    if (voiceConnection) {
        voiceConnection.destroy();
        voiceConnection = null;
        res.json({ success: true, message: '✅ Left voice channel' });
    } else {
        res.json({ success: true, message: '⚠️ Not in a voice channel' });
    }
});

// Voice status
app.get('/api/voice/status', (req, res) => {
    res.json({ connected: voiceConnection !== null });
});

// Send message
app.post('/api/message/send', async (req, res) => {
    const { channelId, message } = req.body;
    
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }
        
        await channel.send(message);
        res.json({ success: true, message: '✅ Message sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update status
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
        res.json({ success: true, message: '✅ Status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(token).catch(err => {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dashboard running on port ${PORT}`);
});
