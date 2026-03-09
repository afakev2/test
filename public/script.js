let currentGuildId = null;
let refreshInterval = null;

// تحميل المعلومات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadGuilds();
    checkVoiceStatus();
    
    // تحديث دوري كل 30 ثانية
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        checkVoiceStatus();
    }, 30000);
});

// تحميل معلومات المستخدم
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) throw new Error('فشل الاتصال');
        
        const user = await response.json();
        
        if (user.error) {
            showError(user.error);
            return;
        }
        
        const userInfo = document.getElementById('userInfo');
        userInfo.innerHTML = `
            <img src="${user.avatar}" class="user-avatar" alt="Avatar" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
            <div>
                <strong>${user.username}#${user.discriminator}</strong>
                <br>
                <small>${user.id}</small>
            </div>
        `;
        
        updateConnectionStatus(true);
    } catch (error) {
        console.error('فشل تحميل معلومات المستخدم:', error);
        showError('فشل تحميل معلومات المستخدم');
    }
}

// تحميل الخوادم
async function loadGuilds() {
    try {
        const response = await fetch('/api/guilds');
        if (!response.ok) throw new Error('فشل الاتصال');
        
        const guilds = await response.json();
        
        const guildsList = document.getElementById('guildsList');
        guildsList.innerHTML = '';
        
        if (guilds.length === 0) {
            guildsList.innerHTML = '<div class="loading">لا توجد خوادم</div>';
            return;
        }
        
        guilds.forEach(guild => {
            const guildElement = document.createElement('div');
            guildElement.className = 'guild-item';
            guildElement.dataset.guildId = guild.id;
            guildElement.innerHTML = `
                <div class="guild-icon">
                    ${guild.icon ? `<img src="${guild.icon}" alt="${guild.name}" style="width: 50px; height: 50px; border-radius: 50%;">` : guild.name.charAt(0)}
                </div>
                <div class="guild-info">
                    <h3>${guild.name}</h3>
                    <p>${guild.memberCount} عضو • ${guild.channels.length} قناة</p>
                </div>
            `;
            
            guildElement.addEventListener('click', () => selectGuild(guild));
            guildsList.appendChild(guildElement);
        });
        
        // تحديث قائمة الخوادم في المنسدلات
        updateGuildSelect(guilds);
        updateMessageChannels(guilds);
    } catch (error) {
        console.error('فشل تحميل الخوادم:', error);
        showError('فشل تحميل الخوادم');
    }
}

// باقي الدوال كما هي مع إضافة معالجة أفضل للأخطاء...
