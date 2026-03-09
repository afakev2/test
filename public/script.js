let currentGuildId = null;

// تحميل المعلومات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadGuilds();
    checkVoiceStatus();
    
    // تحديث دوري كل 30 ثانية
    setInterval(() => {
        checkVoiceStatus();
    }, 30000);
});

// تحميل معلومات المستخدم
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user');
        const user = await response.json();
        
        if (user.error) {
            showError(user.error);
            return;
        }
        
        const userInfo = document.getElementById('userInfo');
        userInfo.innerHTML = `
            <img src="${user.avatar}" class="user-avatar" alt="Avatar">
            <div>
                <strong>${user.username}#${user.discriminator}</strong>
                <br>
                <small>${user.id}</small>
            </div>
        `;
        
        updateConnectionStatus(true);
    } catch (error) {
        showError('فشل تحميل معلومات المستخدم');
    }
}

// تحميل الخوادم
async function loadGuilds() {
    try {
        const response = await fetch('/api/guilds');
        const guilds = await response.json();
        
        const guildsList = document.getElementById('guildsList');
        guildsList.innerHTML = '';
        
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
    } catch (error) {
        showError('فشل تحميل الخوادم');
    }
}

// تحديث قائمة الخوادم في المنسدلة
function updateGuildSelect(guilds) {
    const guildSelect = document.getElementById('guildSelect');
    guildSelect.innerHTML = '<option value="">اختر السيرفر</option>';
    
    guilds.forEach(guild => {
        const option = document.createElement('option');
        option.value = guild.id;
        option.textContent = guild.name;
        guildSelect.appendChild(option);
    });
    
    guildSelect.addEventListener('change', (e) => {
        const guild = guilds.find(g => g.id === e.target.value);
        if (guild) {
            updateChannelSelect(guild.channels.filter(ch => ch.type === 'voice'));
        }
    });
    
    // تحديث قائمة القنوات للرسائل
    updateMessageChannels(guilds);
}

// تحديث قائمة القنوات الصوتية
function updateChannelSelect(channels) {
    const channelSelect = document.getElementById('channelSelect');
    channelSelect.innerHTML = '<option value="">اختر القناة الصوتية</option>';
    
    channels.forEach(channel => {
        const option = document.createElement('option');
        option.value = channel.id;
        option.textContent = channel.name;
        channelSelect.appendChild(option);
    });
}

// تحديث قائمة القنوات النصية للرسائل
function updateMessageChannels(guilds) {
    const messageChannelSelect = document.getElementById('messageChannelSelect');
    messageChannelSelect.innerHTML = '<option value="">اختر القناة النصية</option>';
    
    // تجميع كل القنوات النصية من كل الخوادم
    guilds.forEach(guild => {
        const textChannels = guild.channels.filter(ch => ch.type === 'text');
        textChannels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = `${guild.name} - #${channel.name}`;
            messageChannelSelect.appendChild(option);
        });
    });
}

// تحديد خادم من القائمة الجانبية
function selectGuild(guild) {
    currentGuildId = guild.id;
    
    // إزالة الكلاس النشط من كل العناصر
    document.querySelectorAll('.guild-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // إضافة الكلاس النشط للعنصر المحدد
    const selectedElement = document.querySelector(`[data-guild-id="${guild.id}"]`);
    if (selectedElement) {
        selectedElement.classList.add('active');
    }
    
    // تحديث المنسدلات
    document.getElementById('guildSelect').value = guild.id;
    updateChannelSelect(guild.channels.filter(ch => ch.type === 'voice'));
}

// التحقق من حالة الصوت
async function checkVoiceStatus() {
    try {
        const response = await fetch('/api/voice/status');
        const status = await response.json();
        
        const voiceStatus = document.getElementById('voiceStatus');
        if (status.connected) {
            voiceStatus.className = 'voice-status connected';
            voiceStatus.innerHTML = '✅ متصل بقناة صوتية';
        } else {
            voiceStatus.className = 'voice-status';
            voiceStatus.innerHTML = '🔇 غير متصل';
        }
    } catch (error) {
        console.error('فشل التحقق من حالة الصوت');
    }
}

// تحديث حالة الاتصال
function updateConnectionStatus(connected) {
    const statusBar = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    
    if (connected) {
        statusBar.classList.add('connected');
        statusText.textContent = 'متصل';
    } else {
        statusBar.classList.remove('connected');
        statusText.textContent = 'غير متصل';
    }
}

// أزرار التحكم
document.getElementById('joinVoiceBtn').addEventListener('click', async () => {
    const guildId = document.getElementById('guildSelect').value;
    const channelId = document.getElementById('channelSelect').value;
    
    if (!guildId || !channelId) {
        alert('الرجاء اختيار الخادم والقناة الصوتية');
        return;
    }
    
    try {
        const response = await fetch('/api/voice/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId, channelId })
        });
        
        const result = await response.json();
        if (result.error) {
            alert(result.error);
        } else {
            alert(result.message);
            checkVoiceStatus();
        }
    } catch (error) {
        alert('فشل الاتصال بالقناة الصوتية');
    }
});

document.getElementById('leaveVoiceBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/voice/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        alert(result.message);
        checkVoiceStatus();
    } catch (error) {
        alert('فشل مغادرة القناة الصوتية');
    }
});

document.getElementById('updateStatusBtn').addEventListener('click', async () => {
    const status = document.getElementById('statusSelect').value;
    const activityType = document.getElementById('activityTypeSelect').value;
    const activity = document.getElementById('activityText').value;
    
    try {
        const response = await fetch('/api/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, activity, activityType })
        });
        
        const result = await response.json();
        alert(result.message || result.error || 'تم تحديث الحالة');
    } catch (error) {
        alert('فشل تحديث الحالة');
    }
});

document.getElementById('sendMessageBtn').addEventListener('click', async () => {
    const channelId = document.getElementById('messageChannelSelect').value;
    const message = document.getElementById('messageText').value;
    
    if (!channelId || !message) {
        alert('الرجاء اختيار القناة وكتابة الرسالة');
        return;
    }
    
    try {
        const response = await fetch('/api/message/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelId, message })
        });
        
        const result = await response.json();
        if (result.error) {
            alert(result.error);
        } else {
            alert('✅ تم إرسال الرسالة');
            document.getElementById('messageText').value = '';
        }
    } catch (error) {
        alert('فشل إرسال الرسالة');
    }
});

function showError(message) {
    console.error(message);
    // يمكن إضافة إشعارات للمستخدم هنا
}
