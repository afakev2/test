let currentGuildId = null;
let refreshInterval = null;

// تحميل المعلومات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ الصفحة تحمست بنجاح');
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
        console.log('🔄 جاري تحميل معلومات المستخدم...');
        const response = await fetch('/api/user');
        console.log('📥 استجابة API:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const user = await response.json();
        console.log('👤 معلومات المستخدم:', user);
        
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
        console.error('❌ خطأ في تحميل معلومات المستخدم:', error);
        showError('فشل تحميل معلومات المستخدم: ' + error.message);
        
        // عرض بيانات تجريبية للاختبار
        const userInfo = document.getElementById('userInfo');
        userInfo.innerHTML = `
            <div style="color: red;">
                <strong>خطأ في الاتصال</strong>
                <br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// تحميل الخوادم
async function loadGuilds() {
    try {
        console.log('🔄 جاري تحميل الخوادم...');
        const response = await fetch('/api/guilds');
        console.log('📥 استجابة الخوادم:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const guilds = await response.json();
        console.log('🌐 عدد الخوادم:', guilds.length);
        
        const guildsList = document.getElementById('guildsList');
        
        if (guilds.length === 0) {
            guildsList.innerHTML = '<div class="loading">لا توجد خوادم متاحة</div>';
            return;
        }
        
        guildsList.innerHTML = '';
        
        guilds.forEach(guild => {
            const guildElement = document.createElement('div');
            guildElement.className = 'guild-item';
            guildElement.dataset.guildId = guild.id;
            
            // معالجة الأيقونة
            let iconHtml = guild.name.charAt(0);
            if (guild.icon) {
                iconHtml = `<img src="${guild.icon}" alt="${guild.name}" style="width: 50px; height: 50px; border-radius: 50%;">`;
            }
            
            guildElement.innerHTML = `
                <div class="guild-icon">
                    ${iconHtml}
                </div>
                <div class="guild-info">
                    <h3>${guild.name}</h3>
                    <p>${guild.memberCount || 0} عضو • ${guild.channels?.length || 0} قناة</p>
                </div>
            `;
            
            guildElement.addEventListener('click', () => selectGuild(guild));
            guildsList.appendChild(guildElement);
        });
        
        // تحديث قائمة الخوادم في المنسدلات
        updateGuildSelect(guilds);
        updateMessageChannels(guilds);
    } catch (error) {
        console.error('❌ خطأ في تحميل الخوادم:', error);
        const guildsList = document.getElementById('guildsList');
        guildsList.innerHTML = `<div class="loading" style="color: red;">خطأ: ${error.message}</div>`;
    }
}

// تحديث قائمة الخوادم في المنسدلة
function updateGuildSelect(guilds) {
    const guildSelect = document.getElementById('guildSelect');
    if (!guildSelect) return;
    
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
            const voiceChannels = guild.channels?.filter(ch => ch.type === 'voice') || [];
            updateChannelSelect(voiceChannels);
        }
    });
}

// تحديث قائمة القنوات الصوتية
function updateChannelSelect(channels) {
    const channelSelect = document.getElementById('channelSelect');
    if (!channelSelect) return;
    
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
    if (!messageChannelSelect) return;
    
    messageChannelSelect.innerHTML = '<option value="">اختر القناة النصية</option>';
    
    // تجميع كل القنوات النصية من كل الخوادم
    guilds.forEach(guild => {
        const textChannels = guild.channels?.filter(ch => ch.type === 'text') || [];
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
    console.log('تم اختيار الخادم:', guild.name);
    
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
    const guildSelect = document.getElementById('guildSelect');
    if (guildSelect) guildSelect.value = guild.id;
    
    const voiceChannels = guild.channels?.filter(ch => ch.type === 'voice') || [];
    updateChannelSelect(voiceChannels);
}

// التحقق من حالة الصوت
async function checkVoiceStatus() {
    try {
        const response = await fetch('/api/voice/status');
        if (!response.ok) return;
        
        const status = await response.json();
        
        const voiceStatus = document.getElementById('voiceStatus');
        if (!voiceStatus) return;
        
        if (status.connected) {
            voiceStatus.className = 'voice-status connected';
            voiceStatus.innerHTML = '✅ متصل بقناة صوتية';
        } else {
            voiceStatus.className = 'voice-status';
            voiceStatus.innerHTML = '🔇 غير متصل';
        }
    } catch (error) {
        console.error('فشل التحقق من حالة الصوت:', error);
    }
}

// تحديث حالة الاتصال
function updateConnectionStatus(connected) {
    const statusBar = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    
    if (!statusBar || !statusText) return;
    
    if (connected) {
        statusBar.classList.add('connected');
        statusText.textContent = 'متصل';
    } else {
        statusBar.classList.remove('connected');
        statusText.textContent = 'غير متصل';
    }
}

// أزرار التحكم - نضيفها بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // زر دخول القناة الصوتية
    const joinVoiceBtn = document.getElementById('joinVoiceBtn');
    if (joinVoiceBtn) {
        joinVoiceBtn.addEventListener('click', async () => {
            const guildId = document.getElementById('guildSelect')?.value;
            const channelId = document.getElementById('channelSelect')?.value;
            
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
                    alert('❌ ' + result.error);
                } else {
                    alert('✅ ' + result.message);
                    checkVoiceStatus();
                }
            } catch (error) {
                alert('❌ فشل الاتصال بالقناة الصوتية');
            }
        });
    }
    
    // زر مغادرة القناة الصوتية
    const leaveVoiceBtn = document.getElementById('leaveVoiceBtn');
    if (leaveVoiceBtn) {
        leaveVoiceBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/voice/leave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();
                alert(result.message);
                checkVoiceStatus();
            } catch (error) {
                alert('❌ فشل مغادرة القناة الصوتية');
            }
        });
    }
    
    // زر تحديث الحالة
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', async () => {
            const status = document.getElementById('statusSelect')?.value || 'online';
            const activityType = document.getElementById('activityTypeSelect')?.value || '0';
            const activity = document.getElementById('activityText')?.value || '';
            
            try {
                const response = await fetch('/api/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status, activity, activityType })
                });
                
                const result = await response.json();
                alert(result.message || result.error || 'تم تحديث الحالة');
            } catch (error) {
                alert('❌ فشل تحديث الحالة');
            }
        });
    }
    
    // زر إرسال رسالة
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', async () => {
            const channelId = document.getElementById('messageChannelSelect')?.value;
            const message = document.getElementById('messageText')?.value;
            
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
                    alert('❌ ' + result.error);
                } else {
                    alert('✅ تم إرسال الرسالة');
                    document.getElementById('messageText').value = '';
                }
            } catch (error) {
                alert('❌ فشل إرسال الرسالة');
            }
        });
    }
});

function showError(message) {
    console.error('خطأ:', message);
    // يمكن إضافة إشعارات للمستخدم هنا
}
