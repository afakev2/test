<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discord SelfBot - لوحة تحكم متكاملة</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Rubik', sans-serif;
        }

        :root {
            --bg-primary: #1a1b2f;
            --bg-secondary: #23243a;
            --bg-tertiary: #2c2e45;
            --accent: #5865f2;
            --accent-hover: #4752c4;
            --text-primary: #ffffff;
            --text-secondary: #b5b9d4;
            --text-muted: #7d7f9a;
            --green: #23a55a;
            --red: #f23f42;
            --yellow: #f0b232;
            --border: #2c2e45;
        }

        body {
            background: var(--bg-primary);
            color: var(--text-primary);
            height: 100vh;
            overflow: hidden;
        }

        /* تخطيط مثل ديسكورد */
        .app {
            display: flex;
            height: 100vh;
            overflow: hidden;
        }

        /* شريط الخوادم الجانبي */
        .guilds-bar {
            width: 72px;
            background: var(--bg-tertiary);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px 0;
            overflow-y: auto;
            scrollbar-width: none;
        }

        .guilds-bar::-webkit-scrollbar {
            display: none;
        }

        .guild-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--bg-secondary);
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 18px;
            color: var(--text-primary);
            border: 2px solid transparent;
            overflow: hidden;
        }

        .guild-icon:hover {
            border-radius: 16px;
            background: var(--accent);
        }

        .guild-icon.active {
            border-radius: 16px;
            border-color: var(--accent);
        }

        .guild-icon.active::before {
            content: '';
            position: absolute;
            right: -8px;
            width: 4px;
            height: 20px;
            background: white;
            border-radius: 4px;
        }

        .guild-icon img {
            width: 100%;
            height: 100%;
            border-radius: inherit;
            object-fit: cover;
        }

        .guild-separator {
            width: 32px;
            height: 2px;
            background: var(--text-muted);
            margin: 8px 0;
        }

        /* شريط القنوات */
        .channels-bar {
            width: 240px;
            background: var(--bg-secondary);
            display: flex;
            flex-direction: column;
        }

        .channels-header {
            padding: 20px 16px;
            border-bottom: 1px solid var(--border);
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
        }

        .channels-header:hover {
            background: var(--bg-tertiary);
        }

        .channels-list {
            flex: 1;
            overflow-y: auto;
            padding: 16px 8px;
        }

        .channel-category {
            margin-bottom: 16px;
        }

        .category-header {
            padding: 8px 8px;
            color: var(--text-muted);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
        }

        .category-header:hover {
            color: var(--text-primary);
        }

        .channel-item {
            padding: 6px 8px;
            margin: 2px 0;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 14px;
        }

        .channel-item:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }

        .channel-item.active {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }

        .channel-item i {
            font-size: 20px;
            color: var(--text-muted);
        }

        .channel-item.voice i {
            color: var(--green);
        }

        /* منطقة الدردشة الرئيسية */
        .chat-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--bg-primary);
        }

        .chat-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .message {
            display: flex;
            gap: 16px;
            animation: fadeIn 0.3s;
            padding: 4px 0;
        }

        .message:hover {
            background: var(--bg-secondary);
        }

        .message-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            overflow: hidden;
        }

        .message-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .message-content {
            flex: 1;
        }

        .message-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
        }

        .message-author {
            font-weight: 600;
            color: var(--text-primary);
        }

        .message-timestamp {
            font-size: 12px;
            color: var(--text-muted);
        }

        .message-text {
            color: var(--text-secondary);
            font-size: 14px;
            line-height: 1.4;
            white-space: pre-wrap;
            word-break: break-word;
        }

        .message-actions {
            opacity: 0;
            display: flex;
            gap: 8px;
            margin-top: 4px;
        }

        .message:hover .message-actions {
            opacity: 1;
        }

        .message-action {
            padding: 4px 8px;
            background: var(--bg-tertiary);
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            color: var(--text-secondary);
        }

        .message-action:hover {
            background: var(--accent);
            color: white;
        }

        /* منطقة كتابة الرسائل */
        .chat-input-area {
            padding: 20px;
            border-top: 1px solid var(--border);
        }

        .chat-input-wrapper {
            background: var(--bg-tertiary);
            border-radius: 8px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .chat-input {
            flex: 1;
            background: none;
            border: none;
            color: var(--text-primary);
            font-size: 14px;
            outline: none;
        }

        .chat-input::placeholder {
            color: var(--text-muted);
        }

        .chat-input-actions {
            display: flex;
            gap: 12px;
            color: var(--text-muted);
        }

        .chat-input-actions i {
            cursor: pointer;
            font-size: 18px;
        }

        .chat-input-actions i:hover {
            color: var(--accent);
        }

        /* الشريط الجانبي الأيمن */
        .right-sidebar {
            width: 300px;
            background: var(--bg-secondary);
            display: flex;
            flex-direction: column;
            border-right: 1px solid var(--border);
            overflow-y: auto;
        }

        .user-panel {
            padding: 16px;
            background: var(--bg-tertiary);
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid var(--border);
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent);
            position: relative;
            overflow: hidden;
        }

        .user-avatar img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }

        .user-status {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid var(--bg-tertiary);
        }

        .user-status.online { background: var(--green); }
        .user-status.idle { background: var(--yellow); }
        .user-status.dnd { background: var(--red); }

        .user-info {
            flex: 1;
        }

        .user-name {
            font-weight: 600;
            font-size: 14px;
        }

        .user-tag {
            font-size: 12px;
            color: var(--text-muted);
        }

        /* أقسام التحكم */
        .control-section {
            padding: 16px;
            border-bottom: 1px solid var(--border);
        }

        .section-title {
            color: var(--text-muted);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .voice-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .voice-control-item {
            background: var(--bg-tertiary);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .voice-control-info {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .voice-control-info i {
            color: var(--green);
        }

        /* مفاتيح التشغيل */
        .switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--text-muted);
            transition: .3s;
            border-radius: 20px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: var(--green);
        }

        input:checked + .slider:before {
            transform: translateX(20px);
        }

        /* قائمة المستخدمين في الصوت */
        .voice-users {
            margin-top: 12px;
        }

        .voice-user {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px;
            border-radius: 4px;
            font-size: 13px;
        }

        .voice-user:hover {
            background: var(--bg-tertiary);
        }

        .voice-user-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            overflow: hidden;
        }

        .voice-user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .voice-user-name {
            flex: 1;
        }

        .voice-user-icons {
            display: flex;
            gap: 4px;
            color: var(--text-muted);
        }

        .voice-user-icons i.speaking {
            color: var(--green);
        }

        /* التحميل */
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 30px;
            color: var(--text-muted);
        }

        .loading i {
            animation: spin 1s linear infinite;
        }

        /* رسالة الخطأ */
        .error-message {
            color: var(--red);
            text-align: center;
            padding: 20px;
        }

        /* لا توجد رسائل */
        .no-messages {
            color: var(--text-muted);
            text-align: center;
            padding: 40px;
            font-style: italic;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* إشعارات */
        .notification {
            position: fixed;
            top: 20px;
            left: 20px;
            background: var(--bg-tertiary);
            border-right: 4px solid var(--accent);
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s;
        }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="app">
        <!-- شريط الخوادم -->
        <div class="guilds-bar" id="guildsBar">
            <div class="guild-icon" onclick="window.location.reload()">
                <i class="fas fa-home"></i>
            </div>
            <div class="guild-separator"></div>
            <div class="loading" id="guildsLoading">
                <i class="fas fa-spinner"></i>
            </div>
        </div>

        <!-- شريط القنوات -->
        <div class="channels-bar" id="channelsBar" style="display: none;">
            <div class="channels-header" id="channelsHeader">
                <span id="selectedGuildName">اختر سيرفر</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="channels-list" id="channelsList">
                <div class="loading">
                    <i class="fas fa-spinner"></i> جاري تحميل القنوات...
                </div>
            </div>
        </div>

        <!-- منطقة الدردشة -->
        <div class="chat-area" id="chatArea" style="display: none;">
            <div class="chat-header" id="chatHeader">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-hashtag" style="color: var(--text-muted);"></i>
                    <span id="currentChannelName">الرسائل</span>
                </div>
                <div style="display: flex; gap: 16px; color: var(--text-muted);">
                    <i class="fas fa-phone-alt" style="cursor: pointer;" title="بدء مكالمة" onclick="startVoiceCall()"></i>
                    <i class="fas fa-user-plus" style="cursor: pointer;" title="دعوة"></i>
                    <i class="fas fa-search" style="cursor: pointer;" title="بحث"></i>
                    <i class="fas fa-inbox" style="cursor: pointer;" title="الوارد"></i>
                </div>
            </div>

            <div class="chat-messages" id="chatMessages">
                <div class="loading">
                    <i class="fas fa-spinner"></i> جاري تحميل الرسائل...
                </div>
            </div>

            <div class="chat-input-area">
                <div class="chat-input-wrapper">
                    <input type="text" class="chat-input" id="messageInput" placeholder="اكتب رسالة...">
                    <div class="chat-input-actions">
                        <i class="fas fa-paperclip" title="إرفاق ملف" onclick="attachFile()"></i>
                        <i class="fas fa-smile" title="إضافة إيموجي" onclick="openEmojiPicker()"></i>
                        <i class="fas fa-paper-plane" id="sendMessageBtn" title="إرسال"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- الشريط الجانبي الأيمن -->
        <div class="right-sidebar" id="rightSidebar" style="display: none;">
            <!-- لوحة المستخدم -->
            <div class="user-panel" id="userPanel">
                <div class="user-avatar" id="userAvatar">
                    <img src="https://cdn.discordapp.com/embed/avatars/0.png" alt="Avatar">
                    <div class="user-status online" id="userStatus"></div>
                </div>
                <div class="user-info">
                    <div class="user-name" id="userName">جاري التحميل...</div>
                    <div class="user-tag" id="userTag">#0000</div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <i class="fas fa-microphone" style="cursor: pointer;" title="كتم الميكروفون" id="micToggle" onclick="toggleMic()"></i>
                    <i class="fas fa-headphones" style="cursor: pointer;" title="كتم السماعة" id="deafToggle" onclick="toggleDeaf()"></i>
                    <i class="fas fa-cog" style="cursor: pointer;" title="الإعدادات" onclick="openSettings()"></i>
                </div>
            </div>

            <!-- المتصلون في الصوت -->
            <div class="control-section" id="voiceSection" style="display: none;">
                <div class="section-title">
                    <span>المتصلون في الصوت</span>
                    <i class="fas fa-volume-up"></i>
                </div>
                <div class="voice-users" id="voiceUsers">
                    <!-- المستخدمين سيظهرون هنا -->
                </div>
            </div>

            <!-- التحكم في الصوت -->
            <div class="control-section">
                <div class="section-title">
                    <span>التحكم الصوتي</span>
                    <i class="fas fa-sliders-h"></i>
                </div>
                
                <select class="server-select" id="voiceChannelSelect" style="width: 100%; padding: 8px; background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text-primary); border-radius: 4px; margin-bottom: 8px;">
                    <option value="">اختر قناة صوتية</option>
                </select>
                
                <div style="display: flex; gap: 8px;">
                    <button class="btn" style="flex: 1; padding: 8px; background: var(--green); color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="joinVoiceChannel()">
                        <i class="fas fa-sign-in-alt"></i> دخول
                    </button>
                    <button class="btn" style="flex: 1; padding: 8px; background: var(--red); color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="leaveVoiceChannel()">
                        <i class="fas fa-sign-out-alt"></i> خروج
                    </button>
                </div>
            </div>

            <!-- إحصائيات سريعة -->
            <div class="control-section">
                <div class="section-title">
                    <span>إحصائيات</span>
                    <i class="fas fa-chart-line"></i>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div style="background: var(--bg-tertiary); padding: 8px; border-radius: 4px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">السيرفرات</div>
                        <div style="font-weight: 700;" id="statGuilds">0</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 8px; border-radius: 4px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">القنوات</div>
                        <div style="font-weight: 700;" id="statChannels">0</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 8px; border-radius: 4px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">الأعضاء</div>
                        <div style="font-weight: 700;" id="statMembers">0</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 8px; border-radius: 4px; text-align: center;">
                        <div style="font-size: 12px; color: var(--text-muted);">الرسائل</div>
                        <div style="font-weight: 700;" id="statMessages">0</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- مكان الإشعارات -->
    <div id="notificationContainer"></div>

    <script>
        // متغيرات عامة
        let guildsData = [];
        let currentGuildId = null;
        let currentChannelId = null;
        let messages = [];
        let voiceUsers = [];
        let isMicMuted = false;
        let isDeafMuted = false;
        let refreshInterval = null;

        // ============ التهيئة ============
        document.addEventListener('DOMContentLoaded', () => {
            loadUserInfo();
            loadGuilds();
            startAutoRefresh();
        });

        // ============ تحديث تلقائي ============
        function startAutoRefresh() {
            if (refreshInterval) clearInterval(refreshInterval);
            refreshInterval = setInterval(() => {
                if (currentChannelId) {
                    loadMessages(currentChannelId);
                }
                if (currentGuildId) {
                    loadVoiceUsers();
                }
            }, 10000);
        }

        // ============ الإشعارات ============
        function showNotification(message, type = 'success') {
            const container = document.getElementById('notificationContainer');
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.style.borderRightColor = type === 'success' ? 'var(--green)' : 'var(--red)';
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" 
                       style="color: ${type === 'success' ? 'var(--green)' : 'var(--red)'};"></i>
                    <span>${message}</span>
                </div>
            `;
            
            container.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // ============ تحميل معلومات المستخدم ============
        async function loadUserInfo() {
            try {
                const response = await fetch('/api/user');
                const user = await response.json();
                
                if (user.error) {
                    showNotification(user.error, 'error');
                    return;
                }
                
                document.getElementById('userName').textContent = user.username;
                document.getElementById('userTag').textContent = '#' + user.discriminator;
                
                const avatarImg = document.querySelector('#userAvatar img');
                avatarImg.src = user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
                
                const statusDot = document.querySelector('#userStatus');
                statusDot.className = `user-status ${user.status || 'online'}`;
                
            } catch (error) {
                console.error('خطأ في تحميل معلومات المستخدم:', error);
                showNotification('فشل تحميل معلومات المستخدم', 'error');
            }
        }

        // ============ تحميل الخوادم ============
        async function loadGuilds() {
            try {
                const response = await fetch('/api/guilds');
                guildsData = await response.json();
                
                document.getElementById('statGuilds').textContent = guildsData.length;
                
                let totalMembers = 0;
                let totalChannels = 0;
                guildsData.forEach(g => {
                    totalMembers += g.memberCount || 0;
                    totalChannels += g.channels?.length || 0;
                });
                document.getElementById('statMembers').textContent = totalMembers.toLocaleString();
                document.getElementById('statChannels').textContent = totalChannels;
                
                // عرض الخوادم
                displayGuilds(guildsData);
                
            } catch (error) {
                console.error('خطأ في تحميل الخوادم:', error);
                showNotification('فشل تحميل الخوادم', 'error');
            }
        }

        // ============ عرض الخوادم ============
        function displayGuilds(guilds) {
            const guildsBar = document.getElementById('guildsBar');
            const loading = document.getElementById('guildsLoading');
            if (loading) loading.remove();
            
            guilds.forEach(guild => {
                const guildIcon = document.createElement('div');
                guildIcon.className = 'guild-icon';
                guildIcon.setAttribute('data-guild-id', guild.id);
                guildIcon.setAttribute('title', guild.name);
                
                if (guild.icon) {
                    guildIcon.innerHTML = `<img src="${guild.icon}" alt="${guild.name}">`;
                } else {
                    guildIcon.textContent = guild.name.charAt(0).toUpperCase();
                }
                
                guildIcon.onclick = () => selectGuild(guild.id);
                guildsBar.appendChild(guildIcon);
            });
        }

        // ============ اختيار خادم ============
        function selectGuild(guildId) {
            currentGuildId = guildId;
            
            // تحديث الشكل
            document.querySelectorAll('.guild-icon').forEach(icon => {
                icon.classList.remove('active');
                if (icon.getAttribute('data-guild-id') === guildId) {
                    icon.classList.add('active');
                }
            });
            
            // إظهار الأقسام
            document.getElementById('channelsBar').style.display = 'flex';
            document.getElementById('chatArea').style.display = 'flex';
            document.getElementById('rightSidebar').style.display = 'flex';
            
            // عرض القنوات
            displayChannels(guildId);
            
            // تحديث قائمة القنوات الصوتية
            updateVoiceChannelsSelect(guildId);
        }

        // ============ عرض القنوات ============
        function displayChannels(guildId) {
            const guild = guildsData.find(g => g.id === guildId);
            if (!guild) return;
            
            document.getElementById('selectedGuildName').textContent = guild.name;
            
            const channelsList = document.getElementById('channelsList');
            channelsList.innerHTML = '';
            
            // تقسيم القنوات
            const categories = new Map();
            const textChannels = [];
            const voiceChannels = [];
            
            guild.channels.forEach(ch => {
                if (ch.type === 'category') {
                    categories.set(ch.id, ch);
                } else if (ch.type === 'text') {
                    textChannels.push(ch);
                } else if (ch.type === 'voice') {
                    voiceChannels.push(ch);
                }
            });
            
            // عرض القنوات النصية
            if (textChannels.length > 0) {
                const textCategory = document.createElement('div');
                textCategory.className = 'channel-category';
                textCategory.innerHTML = `
                    <div class="category-header">
                        <span>قنوات نصية</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                `;
                
                textChannels.sort((a, b) => a.position - b.position).forEach(ch => {
                    const channelItem = document.createElement('div');
                    channelItem.className = 'channel-item';
                    channelItem.setAttribute('data-channel-id', ch.id);
                    channelItem.setAttribute('data-channel-type', 'text');
                    channelItem.innerHTML = `
                        <i class="fas fa-hashtag"></i>
                        <span>${ch.name}</span>
                    `;
                    channelItem.onclick = () => selectChannel(ch.id, ch.name);
                    textCategory.appendChild(channelItem);
                });
                
                channelsList.appendChild(textCategory);
            }
            
            // عرض القنوات الصوتية
            if (voiceChannels.length > 0) {
                const voiceCategory = document.createElement('div');
                voiceCategory.className = 'channel-category';
                voiceCategory.innerHTML = `
                    <div class="category-header">
                        <span>قنوات صوتية</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                `;
                
                voiceChannels.sort((a, b) => a.position - b.position).forEach(ch => {
                    const channelItem = document.createElement('div');
                    channelItem.className = 'channel-item voice';
                    channelItem.setAttribute('data-channel-id', ch.id);
                    channelItem.setAttribute('data-channel-type', 'voice');
                    channelItem.innerHTML = `
                        <i class="fas fa-volume-up"></i>
                        <span>${ch.name}</span>
                    `;
                    channelItem.onclick = () => {
                        if (confirm(`هل تريد الاتصال بالقناة الصوتية ${ch.name}؟`)) {
                            joinVoiceChannelById(ch.id);
                        }
                    };
                    voiceCategory.appendChild(channelItem);
                });
                
                channelsList.appendChild(voiceCategory);
            }
        }

        // ============ تحديث قائمة القنوات الصوتية ============
        function updateVoiceChannelsSelect(guildId) {
            const guild = guildsData.find(g => g.id === guildId);
            if (!guild) return;
            
            const select = document.getElementById('voiceChannelSelect');
            select.innerHTML = '<option value="">اختر قناة صوتية</option>';
            
            guild.channels.filter(ch => ch.type === 'voice').forEach(ch => {
                const option = document.createElement('option');
                option.value = ch.id;
                option.textContent = ch.name;
                select.appendChild(option);
            });
        }

        // ============ اختيار قناة ============
        function selectChannel(channelId, channelName) {
            currentChannelId = channelId;
            document.getElementById('currentChannelName').textContent = channelName;
            
            // تحديث الشكل
            document.querySelectorAll('.channel-item').forEach(item => {
                item.classList.remove('active');
            });
            event.currentTarget.classList.add('active');
            
            // تحميل الرسائل
            loadMessages(channelId);
        }

        // ============ تحميل الرسائل ============
        async function loadMessages(channelId) {
            try {
                const chatMessages = document.getElementById('chatMessages');
                chatMessages.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> جاري تحميل الرسائل...</div>';
                
                const response = await fetch(`/api/channel/${channelId}/messages?limit=50`);
                
                if (!response.ok) {
                    throw new Error('فشل تحميل الرسائل');
                }
                
                messages = await response.json();
                
                document.getElementById('statMessages').textContent = messages.length;
                
                if (messages.length === 0) {
                    chatMessages.innerHTML = '<div class="no-messages">لا توجد رسائل في هذه القناة</div>';
                    return;
                }
                
                displayMessages(messages);
                
            } catch (error) {
                console.error('خطأ في تحميل الرسائل:', error);
                document.getElementById('chatMessages').innerHTML = '<div class="error-message">فشل تحميل الرسائل</div>';
                showNotification('فشل تحميل الرسائل', 'error');
            }
        }

        // ============ عرض الرسائل ============
        function displayMessages(messages) {
            const container = document.getElementById('chatMessages');
            container.innerHTML = '';
            
            messages.reverse().forEach(msg => {
                const messageEl = document.createElement('div');
                messageEl.className = 'message';
                messageEl.setAttribute('data-message-id', msg.id);
                
                const timestamp = new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                let avatarHtml = msg.author.avatar ? 
                    `<img src="${msg.author.avatar}" alt="${msg.author.username}">` : 
                    msg.author.username.charAt(0).toUpperCase();
                
                messageEl.innerHTML = `
                    <div class="message-avatar">${avatarHtml}</div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-author" style="color: ${msg.author.color || 'var(--text-primary)'}">${msg.author.username}</span>
                            <span class="message-timestamp">${timestamp}</span>
                        </div>
                        <div class="message-text">${formatMessageContent(msg.content)}</div>
                        <div class="message-actions">
                            <span class="message-action" onclick="replyToMessage('${msg.id}')"><i class="fas fa-reply"></i></span>
                            <span class="message-action" onclick="editMessage('${msg.id}')"><i class="fas fa-edit"></i></span>
                            <span class="message-action" onclick="deleteMessage('${msg.id}')"><i class="fas fa-trash"></i></span>
                            <span class="message-action" onclick="copyMessage('${msg.id}')"><i class="fas fa-copy"></i></span>
                        </div>
                    </div>
                `;
                
                container.appendChild(messageEl);
            });
            
            // التمرير للأسفل
            container.scrollTop = container.scrollHeight;
        }

        // ============ تنسيق محتوى الرسالة ============
        function formatMessageContent(content) {
            if (!content) return '';
            
            // تحويل الروابط إلى روابط قابلة للنقر
            content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: var(--accent);">$1</a>');
            
            // تحويل الإشارات
            content = content.replace(/@(everyone|here)/g, '<span style="background: var(--accent); padding: 2px 4px; border-radius: 3px;">@$1</span>');
            
            return content;
        }

        // ============ إرسال رسالة ============
        document.getElementById('sendMessageBtn').onclick = async () => {
            const input = document.getElementById('messageInput');
            const content = input.value.trim();
            
            if (!content || !currentChannelId) {
                showNotification('اختر قناة واكتب رسالة أولاً', 'error');
                return;
            }
            
            try {
                const response = await fetch('/api/message/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        channelId: currentChannelId,
                        content: content
                    })
                });
                
                const result = await response.json();
                
                if (result.error) {
                    showNotification(result.error, 'error');
                } else {
                    showNotification('✅ تم إرسال الرسالة');
                    input.value = '';
                    loadMessages(currentChannelId);
                }
                
            } catch (error) {
                showNotification('فشل إرسال الرسالة', 'error');
            }
        };

        // إرسال بالضغط على Enter
        document.getElementById('messageInput').onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('sendMessageBtn').click();
            }
        };

        // ============ حذف رسالة ============
        window.deleteMessage = async (messageId) => {
            if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
            
            try {
                const response = await fetch('/api/message/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        channelId: currentChannelId,
                        messageId: messageId
                    })
                });
                
                const result = await response.json();
                
                if (result.error) {
                    showNotification(result.error, 'error');
                } else {
                    showNotification('✅ تم حذف الرسالة');
                    loadMessages(currentChannelId);
                }
                
            } catch (error) {
                showNotification('فشل حذف الرسالة', 'error');
            }
        };

        // ============ نسخ رسالة ============
        window.copyMessage = (messageId) => {
            const msg = messages.find(m => m.id === messageId);
            if (msg) {
                navigator.clipboard.writeText(msg.content);
                showNotification('✅ تم نسخ الرسالة');
            }
        };

        // ============ الرد على رسالة ============
        window.replyToMessage = (messageId) => {
            const msg = messages.find(m => m.id === messageId);
            if (msg) {
                document.getElementById('messageInput').placeholder = `الرد على ${msg.author.username}...`;
                document.getElementById('messageInput').focus();
            }
        };

        // ============ تعديل رسالة ============
        window.editMessage = async (messageId) => {
            const msg = messages.find(m => m.id === messageId);
            if (!msg) return;
            
            const newContent = prompt('تعديل الرسالة:', msg.content);
            if (!newContent || newContent === msg.content) return;
            
            try {
                const response = await fetch('/api/message/edit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        channelId: currentChannelId,
                        messageId: messageId,
                        newContent: newContent
                    })
                });
                
                const result = await response.json();
                
                if (result.error) {
                    showNotification(result.error, 'error');
                } else {
                    showNotification('✅ تم تعديل الرسالة');
                    loadMessages(currentChannelId);
                }
                
            } catch (error) {
                showNotification('فشل تعديل الرسالة', 'error');
            }
        };

        // ============ الدخول إلى قناة صوتية ============
        window.joinVoiceChannel = async () => {
            const channelId = document.getElementById('voiceChannelSelect').value;
            if (!channelId) {
                showNotification('اختر قناة صوتية أولاً', 'error');
                return;
            }
            
            await joinVoiceChannelById(channelId);
        };

        window.joinVoiceChannelById = async (channelId) => {
            try {
                const response = await fetch(`/api/voice/join/${channelId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        selfMute: isMicMuted,
                        selfDeaf: isDeafMuted
                    })
                });
                
                const result = await response.json();
                
                if (result.error) {
                    showNotification(result.error, 'error');
                } else {
                    showNotification(`✅ ${result.message}`);
                    document.getElementById('voiceSection').style.display = 'block';
                    loadVoiceUsers();
                }
                
            } catch (error) {
                showNotification('فشل الاتصال بالقناة الصوتية', 'error');
            }
        };

        // ============ مغادرة القناة الصوتية ============
        window.leaveVoiceChannel = async () => {
            try {
                const response = await fetch('/api/voice/leave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();
                showNotification(result.message);
                document.getElementById('voiceSection').style.display = 'none';
                document.getElementById('voiceUsers').innerHTML = '';
                
            } catch (error) {
                showNotification('فشل مغادرة القناة الصوتية', 'error');
            }
        };

        // ============ تحميل المستخدمين في الصوت ============
        async function loadVoiceUsers() {
            try {
                const response = await fetch('/api/voice/users');
                const users = await response.json();
                
                const container = document.getElementById('voiceUsers');
                container.innerHTML = '';
                
                users.forEach(user => {
                    const userEl = document.createElement('div');
                    userEl.className = 'voice-user';
                    
                    let statusIcons = '';
                    if (user.voice.selfMute || user.voice.mute) {
                        statusIcons += '<i class="fas fa-microphone-slash" style="color: var(--red);"></i>';
                    }
                    if (user.voice.selfDeaf || user.voice.deaf) {
                        statusIcons += '<i class="fas fa-volume-mute" style="color: var(--red);"></i>';
                    }
                    if (user.voice.streaming) {
                        statusIcons += '<i class="fas fa-stream" style="color: var(--accent);"></i>';
                    }
                    
                    userEl.innerHTML = `
                        <div class="voice-user-avatar">
                            <img src="${user.avatar}" alt="${user.username}">
                        </div>
                        <div class="voice-user-name">${user.nickname || user.username}</div>
                        <div class="voice-user-icons">${statusIcons}</div>
                    `;
                    
                    container.appendChild(userEl);
                });
                
            } catch (error) {
                console.error('خطأ في تحميل المستخدمين:', error);
            }
        }

        // ============ التحكم في الميكروفون ============
        window.toggleMic = () => {
            isMicMuted = !isMicMuted;
            const micIcon = document.getElementById('micToggle');
            micIcon.style.color = isMicMuted ? 'var(--red)' : '';
            showNotification(isMicMuted ? '🔇 تم كتم الميكروفون' : '🎤 تم إلغاء كتم الميكروفون');
        };

        window.toggleDeaf = () => {
            isDeafMuted = !isDeafMuted;
            const deafIcon = document.getElementById('deafToggle');
            deafIcon.style.color = isDeafMuted ? 'var(--red)' : '';
            showNotification(isDeafMuted ? '🔇 تم كتم السماعة' : '🎧 تم إلغاء كتم السماعة');
        };

        // ============ دوال إضافية ============
        window.startVoiceCall = () => {
            showNotification('ميزة المكالمات قيد التطوير', 'error');
        };

        window.attachFile = () => {
            showNotification('ميزة رفع الملفات قيد التطوير', 'error');
        };

        window.openEmojiPicker = () => {
            showNotification('ميزة الإيموجي قيد التطوير', 'error');
        };

        window.openSettings = () => {
            showNotification('ميزة الإعدادات قيد التطوير', 'error');
        };
    </script>
</body>
</html>
