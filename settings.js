/* settings.js v21 - ПРУТКОН ERP */

window.ROLE_PRESETS = ['Администратор', 'Директор', 'Зам директора', 'Менеджер', 'Мастер производства', 'Снабженец'];

window.ROLE_PERMISSIONS = {
    'Администратор': ['all'],
    'Директор': ['all'],
    'Зам директора': ['production', 'equipment', 'orders', 'reports', 'calculator', 'prices', 'catalog'],
    'Менеджер': ['orders', 'prices', 'calculator', 'catalog'],
    'Мастер производства': ['production', 'equipment', 'catalog'],
    'Снабженец': ['equipment', 'catalog', 'prices']
};


window.PROGRAM_VERSIONS = [
    {
        version: '10.2.0',
        codename: 'Stability & Versioning',
        date: '2026-04-06',
        changes: [
            'Единый дизайн таблиц и мастеров на страницах прайсов.',
            'Исправлены статусы stepper в мастерах транспортного модуля.',
            'Добавлена постоянная история версий с хранением в localStorage.',
            'Усилена синхронизация событий между модулями после облачного обновления.'
        ]
    },
    {
        version: '10.0.1',
        codename: 'Constructor Edition',
        date: '2026-04-02',
        changes: [
            'Переход на модульную архитектуру конструктора рабочего стола.',
            'Внедрена панель управления блоками дашборда.'
        ]
    },
    {
        version: '9.6.5',
        codename: 'Audit Registry',
        date: '2026-03-31',
        changes: [
            'Добавлен forensic-журнал действий пользователей.',
            'Реализованы механизмы полного JSON-бэкапа и восстановления.'
        ]
    },
    {
        version: '8.8.4',
        codename: 'Split & Validation',
        date: '2026-04-06',
        changes: [
            'Разделение заготовок и транспортеров.',
            'Улучшенная валидация мастеров.',
            'Исправление импорта и версионности.'
        ]
    },
    {
        version: '8.8.3',
        codename: 'Excel Mapping Upgrade',
        date: '2026-04-02',
        changes: [
            'Импорт из Excel с выбором полей.',
            'Динамические поля в прайсах.',
            'Управление категориями справочников.'
        ]
    },
    {
        version: '8.8.2',
        codename: 'Avanhard UI Refresh',
        date: '2026-04-02',
        changes: [
            'Улучшенный дизайн Avanhard.',
            'Исправление даты системы.',
            'Локализация прав ролей и сортировка истории.'
        ]
    },
    {
        version: '8.8.0',
        codename: 'Access Refactor',
        date: '2026-04-02',
        changes: [
            'Рефакторинг системы доступов.',
            'Журнал системных изменений (Audit Log).',
            'Вкладочный интерфейс настроек.'
        ]
    },
    {
        version: '8.7.0',
        codename: 'Realtime Sync',
        date: '2025-04-03',
        changes: [
            'Синхронизация с облаком в реальном времени.',
            'Заставка при загрузке и отображение ФИО.'
        ]
    }
];



window.settingsChangeLog = [];
window.logID = 0;
window.editingEmployeeIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 Settings.js загружен');
    
    // ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА (НОВЫЙ МОДУЛЬНЫЙ ПОДХОД)
    if (window.settingsUI) window.settingsUI.init();
    
    // Загружаем логи из localStorage
    const savedLogs = localStorage.getItem('prutkon_settings_log');
    if (savedLogs) {
        try {
            window.settingsChangeLog = JSON.parse(savedLogs);
            window.logID = window.settingsChangeLog.length;
            console.log('📝 Загружено ' + window.logID + ' логов');
        } catch(e) {
            console.error('❌ Ошибка загрузки логов:', e);
        }
    }
    
    // Инициализируем UI
    window.initializeEmployees();
    window.renderEmpSettings();
    window.renderVersionHistory();
    window.renderRolePermissions();
    window.populateLogUserFilter();
    window.updateStats();
    window.updateSystemVersionUI();
    if (window.uiLoadBitrixConfig) window.uiLoadBitrixConfig();
    console.log('✅ Settings UI инициализирован');


    
    // СЛУШАТЕЛЬ СОБЫТИЙ СИНХРОНИЗАЦИИ ИЗ ОБЛАКА
    window.addEventListener('employeesSynced', (e) => {
        console.log('🔔 Получено событие employeesSynced, обновляю таблицу...');
        window.initializeEmployees();
        window.renderEmpSettings();
    });
    
    // Также слушаем cloudDataUpdated
    window.addEventListener('cloudDataUpdated', (e) => {
        console.log('🔔 Получено cloudDataUpdated, перезагружаю сотрудников...');
        window.initializeEmployees();
        window.renderEmpSettings();
        window.loadPrinterSettings();
    });
    
    // Слушаем db_updated из core.js
    window.addEventListener('db_updated', () => {
        console.log('🔔 Получено db_updated');
        window.initializeEmployees();
        window.renderEmpSettings();
    });
    
    // Обновляем статус Firebase каждые 2 секунды
    setInterval(() => {
        window.updateFirebaseStatusDisplay();
    }, 2000);
    
    // Первоначальное обновление статуса
    setTimeout(() => {
        window.updateFirebaseStatusDisplay();
        
        // Пробуем загрузить данные из облака при старте
        if (window.fbPull) {
            console.log('📥 Запрашиваю данные из облака при старте...');
            window.showToast('Синхронизация с облаком...', 'info');
            window.fbPull().then(success => {
                if (success) {
                    window.renderEmpSettings();
                    window.showToast('Данные загружены из облака', 'success');
                }
            });
        }
        
        console.log('🔌 Начальная проверка Firebase статуса');
    }, 1500); // Увеличил таймаут чтобы Firebase успела загрузиться
});

// === ИНИЦИАЛИЗАЦИЯ СОТРУДНИКОВ ===
window.initializeEmployees = function() {
    // СНАЧАЛА пробуем загрузить из localStorage
    const savedEmp = localStorage.getItem('prutkon_employees');
    if (savedEmp) {
        try {
            const parsed = JSON.parse(savedEmp);
            if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                window.dbEmployees = parsed;
                console.log('📋 Загружено сотрудников из localStorage:', parsed.length);
                return; // Успешно загружено
            }
        } catch(e) {
            console.error('❌ Ошибка загрузки сотрудников из localStorage:', e);
        }
    }
    
    // Если нет в localStorage - создаем по умолчанию
    if (!window.dbEmployees || window.dbEmployees.length === 0) {
        window.dbEmployees = [
            { 
                id: 1,
                name: 'Никитин И.И.', 
                role: 'Администратор', 
                pwd: '623401', 
                base: 180000, 
                share: 0.10, 
                signature: 'Никитин И.И.',
                status: 'Активен',
                hired: '2025-01-01',
                dept: 'Администрация',
                phone: '+7(999)000-00-00'
            },
            { 
                id: 2,
                name: 'Директор', 
                role: 'Директор', 
                pwd: '623401', 
                base: 150000, 
                share: 0.08, 
                signature: 'Директор',
                status: 'Активен',
                hired: '2025-01-05',
                dept: 'Администрация',
                phone: ''
            },
            { 
                id: 3,
                name: 'Администратор', 
                role: 'Администратор', 
                pwd: '623401', 
                base: 75000, 
                share: 0.02, 
                signature: 'Администратор',
                status: 'Активен',
                hired: '2025-01-10',
                dept: 'IT',
                phone: ''
            }
        ];
        localStorage.setItem('prutkon_employees', JSON.stringify(window.dbEmployees));
        console.log('✅ Создано 3 сотрудников по умолчанию');
    } else {
        console.log('📋 Загружено ' + window.dbEmployees.length + ' сотрудников из localStorage');
    }
};

// === ОБНОВЛЕНИЕ СТАТУСА FIREBASE ===
window.updateFirebaseStatusDisplay = function() {
    const statusEl = document.getElementById('firebase-status');
    const textEl = document.getElementById('firebase-status-text');
    const subtextEl = document.getElementById('firebase-status-subtext');
    
    if (!statusEl || !textEl) return;
    
    const isConnected = window.fbConnected === true;
    const hasCloud = window.fbDB !== undefined;
    
    if (isConnected && hasCloud) {
        statusEl.innerHTML = '<i class="fa-solid fa-cloud-check" style="color:#00ff9d; filter: drop-shadow(0 0 10px #00ff9d);"></i>';
        textEl.innerText = 'Облако подключено';
        textEl.style.color = '#00ff9d';
        if (subtextEl) subtextEl.innerText = 'Синхронизация данных активна';
    } else {
        statusEl.innerHTML = '<i class="fa-solid fa-cloud-slash" style="color:#ff1e27;"></i>';
        textEl.innerText = 'Локальный режим';
        textEl.style.color = '#ff1e27';
        if (subtextEl) subtextEl.innerText = 'Возможны проблемы с сетью или Firebase';
    }
    
    window.updateStats();
};

window.switchTab = function(tabId) {
    console.log('📑 Переключение на вкладку:', tabId);
    
    // Скрываем все панели
    document.querySelectorAll('.tab-pane').forEach(p => {
        p.classList.remove('active');
        p.classList.add('hidden');
    });
    document.querySelectorAll('.tabs-scrollable .btn').forEach(b => b.classList.remove('active'));
    
    // Показываем нужную
    const activePane = document.getElementById('tab-content-' + tabId);
    const activeBtn = document.getElementById('tab-btn-' + tabId);
    
    if (activePane) {
        activePane.classList.remove('hidden');
        activePane.classList.add('active');
    }
    if (activeBtn) activeBtn.classList.add('active');
    
    // Специальная логика для вкладок
    if (tabId === 'changelog') {
        window.renderFullChangeLog();
    }
    if (tabId === 'versions') {
        window.renderVersionHistory();
    }
    if (tabId === 'constructor') {
        window.renderConstructorSettings();
    }
    if (tabId === 'docs') {
        window.loadPrinterSettings();
    }
};

window.loadPrinterSettings = function() {
    const cfg = window.Printer?.config || JSON.parse(localStorage.getItem('prutkon_printer_config')) || {};
    const el = (id, val) => { const e = document.getElementById(id); if(e) e.value = val || ''; };
    
    el('print-company', cfg.companyName);
    el('print-inn', cfg.inn);
    el('print-kpp', cfg.kpp);
    el('print-address', cfg.address);
    el('print-bank', cfg.bankName);
    el('print-bik', cfg.bik);
    el('print-rs', cfg.rs);
    el('print-ks', cfg.ks);
    el('print-terms', cfg.terms);

    // Загружаем текущий шаблон в редактор
    window.onTemplateTypeChange();
};

window.onTemplateTypeChange = function() {
    const type = document.getElementById('tpl-selector').value;
    const cfg = window.Printer?.config || JSON.parse(localStorage.getItem('prutkon_printer_config')) || {};
    const defaults = window.Printer?.defaults || {};
    
    const editor = document.getElementById('tpl-html-editor');
    if (editor) {
        editor.value = (cfg.templates && cfg.templates[type]) || defaults[type] || '<!-- Пустой шаблон -->';
    }
};

window.resetCurrentTemplate = function() {
    const type = document.getElementById('tpl-selector').value;
    const defaults = window.Printer?.defaults || {};
    
    if (confirm(`Сбросить шаблон "${type}" к заводским настройкам?`)) {
        const editor = document.getElementById('tpl-html-editor');
        if (editor) editor.value = defaults[type] || '';
        window.showToast("Шаблон сброшен (не забудьте сохранить)", "warning");
    }
};

window.savePrinterSettings = function() {
    const type = document.getElementById('tpl-selector').value;
    const html = document.getElementById('tpl-html-editor').value;

    const currentCfg = window.Printer?.config || JSON.parse(localStorage.getItem('prutkon_printer_config')) || { templates: {} };
    if (!currentCfg.templates) currentCfg.templates = {};
    
    currentCfg.templates[type] = html;

    const cfg = {
        ...currentCfg,
        companyName: document.getElementById('print-company').value,
        inn: document.getElementById('print-inn').value,
        kpp: document.getElementById('print-kpp').value,
        address: document.getElementById('print-address').value,
        bankName: document.getElementById('print-bank').value,
        bik: document.getElementById('print-bik').value,
        rs: document.getElementById('print-rs').value,
        ks: document.getElementById('print-ks').value,
        terms: document.getElementById('print-terms').value
    };
    
    if (window.Printer?.saveConfig) {
        window.Printer.saveConfig(cfg);
    } else {
        localStorage.setItem('prutkon_printer_config', JSON.stringify(cfg));
        window.showToast("Настройки и шаблоны сохранены", "success");
    }
    
    window.logSystemEvent("Настройки печати", "Обновлен шаблон " + type + " и реквизиты");
};

window.renderConstructorSettings = function() {
    const layout = JSON.parse(localStorage.getItem('prutkon_dash_layout')) || ['WELCOME', 'STATS', 'RECENT_ORDERS', 'QUICK_ACTIONS', 'AUDIT_FEED'];
    document.querySelectorAll('.block-toggle').forEach(t => {
        t.checked = layout.includes(t.dataset.block);
    });
};

window.saveConstructorLayout = function() {
    const layout = [];
    document.querySelectorAll('.block-toggle').forEach(t => {
        if (t.checked) layout.push(t.dataset.block);
    });
    localStorage.setItem('prutkon_dash_layout', JSON.stringify(layout));
    window.logSystemEvent("Конструктор UI", "Пересборка рабочего стола: " + layout.join(', '));
    window.showToast("Раскладка рабочего стола обновлена!", "success");
    setTimeout(() => location.href = 'index.html', 1000);
};

window.renderRolePermissions = function() {
    const container = document.getElementById('role-permissions-list');
    if (!container) return;
    
    const permMap = {
        'production': 'Производство',
        'equipment': 'Оборудование / Закупки',
        'orders': 'Работа с заказами',
        'reports': 'Отчетность',
        'calculator': 'Калькулятор КП',
        'prices': 'Прайс-листы',
        'catalog': 'Справочники',
        'salary': 'ФОТ и ЗП',
        'settings': 'Настройки системы',
        'dashboard': 'Главный дашборд'
    };
    
    container.innerHTML = Object.keys(window.ROLE_PERMISSIONS).map(role => {
        const perms = window.ROLE_PERMISSIONS[role];
        const permLabels = perms.includes('all') ? '<span class="emerald">ПОЛНЫЙ КОНТРОЛЬ (Админ)</span>' : perms.map(p => {
            const lbl = permMap[p] || p;
            return `<span class="badge" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); margin:2px; font-size:0.6rem; color:#aaa;">${lbl}</span>`;
        }).join(' ');
        
        return `
            <div style="padding:15px; background:rgba(255,255,255,0.015); border-radius:10px; border-left:3px solid var(--brand-red); margin-bottom:12px;">
                <div style="font-weight:700; color:#fff; margin-bottom:8px; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">${role}</div>
                <div style="display:flex; flex-wrap:wrap; gap:5px;">${permLabels}</div>
            </div>
        `;
    }).join('');
};


window.populateLogUserFilter = function() {
    const filter = document.getElementById('log-filter-user');
    if (!filter || !window.dbEmployees) return;
    
    // Сохраняем текущее значение
    const curVal = filter.value;
    
    // Формируем список уникальных имен
    const users = [...new Set(window.dbEmployees.map(e => e.name))];
    
    filter.innerHTML = '<option value="all">Все пользователи</option>' + users.map(u => 
        `<option value="${u}">${u}</option>`
    ).join('');
    
    if (users.includes(curVal)) filter.value = curVal;
};

window.renderFullChangeLog = function() {
    const tbody = document.getElementById('full-change-log-tbody');
    if (!tbody) return;
    
    const search = document.getElementById('log-search')?.value.toLowerCase() || '';
    const userFilter = document.getElementById('log-filter-user')?.value || 'all';
    const actionFilter = document.getElementById('log-filter-action')?.value || 'all';
    
    let logs = window.getChangeHistory ? window.getChangeHistory(500) : (window.settingsChangeLog || []);
    
    // Применяем фильтры
    logs = logs.filter(log => {
        const details = (typeof log.data === 'string' ? log.data : (log.message || JSON.stringify(log.data))).toLowerCase();
        const matchesSearch = search === '' || details.includes(search) || (log.user || 'Система').toLowerCase().includes(search);
        const matchesUser = userFilter === 'all' || log.user === userFilter;
        const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase());
        
        return matchesSearch && matchesUser && matchesAction;
    });
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:40px;">Ничего не найдено</td></tr>';
        return;
    }
    
    tbody.innerHTML = logs.map(log => {
        let actionColor = '#fff';
        let actionIcon = 'fa-info-circle';
        let actionName = log.action;
        
        const actionLow = log.action.toLowerCase();
        if (actionLow.includes('add')) { actionColor = '#00ff9d'; actionIcon = 'fa-plus-circle'; actionName = 'Добавление'; }
        else if (actionLow.includes('delete')) { actionColor = '#ff1e27'; actionIcon = 'fa-trash'; actionName = 'Удаление'; }
        else if (actionLow.includes('update')) { actionColor = '#ffb400'; actionIcon = 'fa-edit'; actionName = 'Изменение'; }
        else if (actionLow.includes('login') || actionLow.includes('вход')) { actionColor = '#00b4ff'; actionIcon = 'fa-sign-in-alt'; actionName = 'Вход'; }
        else if (actionLow.includes('запуск')) { actionColor = '#b400ff'; actionIcon = 'fa-power-off'; actionName = 'Запуск'; }
        
        const details = typeof log.data === 'string' ? log.data : (log.message || JSON.stringify(log.data));
        
        return `
            <tr>
                <td style="font-size:0.8rem; color:var(--text-muted); font-family:monospace;">${log.timeReadable || log.timestamp}</td>
                <td style="font-weight:600;">${log.user || 'Система'}</td>
                <td style="color:${actionColor}"><i class="fa-solid ${actionIcon}"></i> ${actionName}</td>
                <td style="font-size:0.85rem; color:#ccc; max-width:450px; white-space:normal; overflow:hidden; text-overflow:ellipsis;">${details}</td>
            </tr>
        `;
    }).join('');
};


window.updateStats = function() {
    const empCount = document.getElementById('stat-emp-count');
    const empCountV2 = document.getElementById('stat-emp-count-v2');
    const logCount = document.getElementById('stat-log-count');
    const lastBackup = document.getElementById('stat-last-backup');
    
    const count = window.dbEmployees ? window.dbEmployees.length : 0;
    if (empCount) empCount.innerText = count;
    if (empCountV2) empCountV2.innerText = count;
    
    if (logCount) logCount.innerText = (window.settingsChangeLog ? window.settingsChangeLog.length : 0);
    
    if (lastBackup) {
        const last = localStorage.getItem('prutkon_last_save');
        lastBackup.innerText = last ? new Date(last).toLocaleString('ru-RU') : '---';
    }
};

window.updateSystemVersionUI = function() {
    const vInput = document.getElementById('sys-version-input');
    if (vInput) vInput.value = `v${window.DB_VERSION || '10.2.0'} Авангард`;
    
    const vSpan = document.getElementById('db-version-display');
    if (vSpan) vSpan.innerText = window.DB_VERSION || '10.2.0';
};

window.exportLogs = function() {
    const logs = window.getChangeHistory ? window.getChangeHistory(1000) : [];
    let csv = 'Дата;Пользователь;Действие;Детали\n';
    
    logs.forEach(log => {
        const details = (typeof log.data === 'string' ? log.data : (log.message || JSON.stringify(log.data))).replace(/;/g, ',');
        csv += `${log.timeReadable || log.timestamp};${log.user || 'Система'};${log.action};${details}\n`;
    });
    
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prutkon_logs_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    window.showToast('Журнал экспортирован в CSV', 'success');
};


// === ТАБЛИЦА СОТРУДНИКОВ ===
window.renderEmpSettings = function() {
    const tbody = document.getElementById('settings-emp-tbody');
    if (!tbody) {
        console.error('❌ Таблица #settings-emp-tbody не найдена!');
        return;
    }

    console.log('🔄 Рендеринг таблицы сотрудников...');
    // НЕ вызываем initializeEmployees() здесь - данные уже должны быть загружены
    // Если данных нет - пробуем загрузить из localStorage
    if (!window.dbEmployees || window.dbEmployees.length === 0) {
        const saved = localStorage.getItem('prutkon_employees');
        if (saved) {
            try {
                window.dbEmployees = JSON.parse(saved);
                console.log('📋 Восстановлено из localStorage:', window.dbEmployees.length);
            } catch(e) {}
        }
    }
    
    tbody.innerHTML = '';
    
    if (!window.dbEmployees || window.dbEmployees.length === 0) {
        console.warn('⚠️ Нет сотрудников для отображения');
        return;
    }
    
    window.dbEmployees.forEach((emp, index) => {
        const tr = document.createElement('tr');
        tr.style.cssText = 'cursor: pointer; transition: all 0.2s ease;';
        tr.onmouseover = () => tr.style.opacity = '0.8';
        tr.onmouseout = () => tr.style.opacity = '1';
        
        tr.innerHTML = `
            <td style="font-weight:500; color:#fff;">${emp.name}</td>
            <td><span style="background:rgba(255,30,39,0.15); color:var(--brand-red); padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:700; text-transform:uppercase;">${emp.role}</span></td>
            <td><span class="badge ${emp.status === 'Активен' ? 'badge-success' : 'badge-danger'}">${emp.status}</span></td>
            <td style="text-align:right;">
                <button class="action-btn" title="Редактировать" onclick="window.openEmployeeCard(${index}); return false;" style="margin-right:5px;"><i class="fa-solid fa-user-pen"></i></button>
                <button class="action-btn" title="Удалить" onclick="window.delEmp(${index}); return false;"><i class="fa-solid fa-trash-can" style="color:#ff1e27;"></i></button>
            </td>
        `;

        
        // Клик на строку = открыть карточку
        tr.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                console.log('👆 Клик на сотрудника:', emp.name);
                window.openEmployeeCard(index);
            }
        });
        
        tbody.appendChild(tr);
    });
    
    console.log('✅ Таблица отрендерена');
};

// === ОТКРЫТЬ КАРТОЧКУ СОТРУДНИКА ===
window.openEmployeeCard = function(index) {
    console.log('🔓 Открываю карточку сотрудника #' + index);
    
    if (!window.dbEmployees[index]) {
        console.error('❌ Сотрудник #' + index + ' не найден');
        return;
    }
    
    window.editingEmployeeIndex = index;
    const emp = window.dbEmployees[index];
    
    // Создаём или получаем модальное окно
    let modal = document.getElementById('emp-card-modal');
    if (!modal) {
        console.log('📦 Создаю новое модальное окно');
        modal = document.createElement('div');
        modal.id = 'emp-card-modal';
        document.body.appendChild(modal);
    }
    
    let roleOptions = window.ROLE_PRESETS.map(r => 
        `<option value="${r}" ${emp.role === r ? 'selected' : ''}>${r}</option>`
    ).join('');
    
    const html = `
        <div class="panel glass-panel" style="width: 500px; max-height: 85vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="color: var(--brand-red); margin: 0;"><i class="fa-solid fa-user-circle"></i> Карточка сотрудника</h3>
                <button onclick="window.closeEmployeeCard()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#888;">✕</button>
            </div>
            
            <div class="form-group">
                <label>Полное имя</label>
                <input type="text" id="emp-name" class="form-control" value="${emp.name}" style="height:40px;">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label>Роль доступа</label>
                    <select id="emp-role" class="form-control" style="height:40px;">
                        ${roleOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Статус</label>
                    <select id="emp-status" class="form-control" style="height:40px;">
                        <option value="Активен" ${emp.status === 'Активен' ? 'selected' : ''}>Активен</option>
                        <option value="Отпуск" ${emp.status === 'Отпуск' ? 'selected' : ''}>Отпуск</option>
                        <option value="Уволен" ${emp.status === 'Уволен' ? 'selected' : ''}>Уволен</option>
                    </select>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label>Оклад (руб.)</label>
                    <input type="number" id="emp-base" class="form-control" value="${emp.base}" style="height:40px;">
                </div>
                <div class="form-group">
                    <label>% ФОТ</label>
                    <input type="number" id="emp-share" class="form-control" value="${((emp.share || 0) * 100).toFixed(0)}" style="height:40px;" placeholder="%">
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label>Пароль (623401 по умолч.)</label>
                    <input type="password" id="emp-pwd" class="form-control" value="${emp.pwd}" style="height:40px;">
                </div>
                <div class="form-group">
                    <label>Подпись</label>
                    <input type="text" id="emp-signature" class="form-control" value="${emp.signature || ''}" style="height:40px;">
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label>Дата приёма</label>
                    <input type="date" id="emp-hired" class="form-control" value="${emp.hired}" style="height:40px;">
                </div>
                <div class="form-group">
                    <label>Отдел</label>
                    <input type="text" id="emp-dept" class="form-control" value="${emp.dept || ''}" style="height:40px;">
                </div>
            </div>
            
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" id="emp-phone" class="form-control" value="${emp.phone || ''}" style="height:40px;">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 25px;">
                <button class="btn btn-secondary" onclick="window.closeEmployeeCard()" style="cursor:pointer;"><i class="fa-solid fa-xmark"></i> Отмена</button>
                <button class="btn btn-primary" onclick="window.saveEmployeeCard()" style="cursor:pointer;"><i class="fa-solid fa-check"></i> Сохранить</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = html;
    modal.className = 'modal active';
    
    // Закрытие при клике вне окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            console.log('👆 Закрытие карточки (клик вне окна)');
            window.closeEmployeeCard();
        }
    });
    
    console.log('✅ Карточка открыта для', emp.name);
};

window.closeEmployeeCard = function() {
    console.log('🔒 Закрываю карточку');
    const modal = document.getElementById('emp-card-modal');
    if (modal) {
        modal.className = 'modal';
    }
    window.editingEmployeeIndex = null;
};

window.saveEmployeeCard = function() {
    if (window.editingEmployeeIndex === null) {
        console.error('❌ Нет открытой карточки');
        return;
    }
    
    const idx = window.editingEmployeeIndex;
    const emp = window.dbEmployees[idx];
    const oldData = JSON.parse(JSON.stringify(emp));
    
    console.log('💾 Сохраняю карточку для', emp.name);
    
    emp.name = document.getElementById('emp-name').value;
    emp.role = document.getElementById('emp-role').value;
    emp.status = document.getElementById('emp-status').value;
    emp.base = parseInt(document.getElementById('emp-base').value) || 0;
    emp.share = parseFloat(document.getElementById('emp-share').value) / 100 || 0;
    emp.pwd = document.getElementById('emp-pwd').value;
    emp.signature = document.getElementById('emp-signature').value;
    emp.hired = document.getElementById('emp-hired').value;
    emp.dept = document.getElementById('emp-dept').value;
    emp.phone = document.getElementById('emp-phone').value;
    
    // Логируем изменения
    const changes = {};
    for (let key in oldData) {
        if (oldData[key] !== emp[key]) {
            changes[key] = { old: oldData[key], new: emp[key] };
        }
    }
    
    window.logChange('emp_card_update', {
        index: idx,
        name: emp.name,
        changes: changes
    });
    
    window.closeEmployeeCard();
    window.renderEmpSettings();
    window.saveAllSettings();
    
    console.log('✅ Карточка сохранена');
    window.showToast('Карточка сотрудника сохранена', 'success');
};

// === ДОБАВИТЬ СОТРУДНИКА ===
window.addEmployee = function() {
    console.log('➕ Добавляю нового сотрудника');
    
    if(!window.dbEmployees) window.dbEmployees = [];
    const newEmp = { 
        id: Math.max(...(window.dbEmployees.map(e => e.id || 0)), 0) + 1,
        name: 'Новый сотрудник', 
        role: 'Менеджер', 
        pwd: '623401', 
        base: 50000, 
        share: 0, 
        signature: '',
        status: 'Активен',
        hired: new Date().toISOString().split('T')[0],
        dept: 'Производство',
        phone: ''
    };
    window.dbEmployees.push(newEmp);
    
    window.logChange('emp_add', {
        name: newEmp.name,
        role: newEmp.role,
        id: newEmp.id
    });
    
    window.renderEmpSettings();
    window.saveAllSettings();
};

// === УДАЛИТЬ СОТРУДНИКА ===
window.delEmp = function(idx) {
    if(!window.dbEmployees) return;
    if(confirm('🗑️ Удалить сотрудника ' + window.dbEmployees[idx].name + '?')) {
        const empName = window.dbEmployees[idx].name;
        const empRole = window.dbEmployees[idx].role;
        window.dbEmployees.splice(idx, 1);
        
        console.log('🗑️ Удалён сотрудник:', empName);
        
        window.logChange('emp_delete', {
            name: empName,
            role: empRole
        });
        
        window.renderEmpSettings();
        window.saveAllSettings();
    }
};

// === ЛОГИРОВАНИЕ ===
window.logChange = function(action, data) {
    window.logID++;
    const logEntry = {
        id: window.logID,
        action: action,
        data: data,
        timestamp: new Date().toISOString(),
        timeReadable: new Date().toLocaleString('ru-RU'),
        user: window.currentUser || 'System'
    };
    window.settingsChangeLog.push(logEntry);
    localStorage.setItem('prutkon_settings_log', JSON.stringify(window.settingsChangeLog));
    
    console.log('📝 [#' + window.logID + '] ' + action + ':', data);
    
    // Также пишем в системный лог
    if (window.logSystemEvent) {
        const msg = typeof data === 'string' ? data : JSON.stringify(data);
        window.logSystemEvent(action, msg);
    }
    
    // Моментальная синхронизация с Firebase при любом изменении через logChange
    if (window.fbPush) {
        window.fbPush();
        console.log('🔁 fbPush triggered by logChange');
    }
};

// === ИСТОРИЯ ВЕРСИЙ ===
window.renderVersionHistory = function() {
    const versionContainer = document.getElementById('version-history-list');
    if (!versionContainer) {
        console.warn('⚠️ #version-history-list не найден');
        return;
    }

    // Core history is primary source. If missing, use fallback list.
    if (window.ensureVersionHistory) window.ensureVersionHistory();
    const source = Array.isArray(window.dbVersionHistory) && window.dbVersionHistory.length
        ? window.dbVersionHistory
        : window.PROGRAM_VERSIONS;

    const normalized = source.map(v => ({
        version: v.version || '0.0.0',
        codename: v.codename || 'Release',
        date: v.date || new Date().toLocaleDateString('ru-RU'),
        changes: Array.isArray(v.changes)
            ? v.changes
            : String(v.changes || '')
                .split(/[,;]\s+/)
                .filter(Boolean)
    }));

    const statsCurrent = document.getElementById('versions-current');
    const statsCount = document.getElementById('versions-count');
    const statsLast = document.getElementById('versions-last-date');
    if (statsCurrent) statsCurrent.innerText = `v${window.DB_VERSION || normalized[0]?.version || '---'}`;
    if (statsCount) statsCount.innerText = String(normalized.length);
    if (statsLast) statsLast.innerText = normalized[0]?.date || '---';

    versionContainer.innerHTML = normalized.map((v, idx) => `
        <article class="version-card ${idx === 0 ? 'is-current' : ''}">
            <div class="version-card-head">
                <div>
                    <div class="version-badge">${idx === 0 ? 'ТЕКУЩАЯ' : 'РЕЛИЗ'}</div>
                    <h4 class="version-title">v${v.version} - ${v.codename}</h4>
                </div>
                <div class="version-date"><i class="fa-regular fa-calendar"></i> ${v.date}</div>
            </div>
            <ul class="version-list">
                ${(v.changes.length ? v.changes : ['Изменения не указаны.']).map(item => `<li>${item}</li>`).join('')}
            </ul>
        </article>
    `).join('');

    console.log('✅ История версий отрендерена');
};

// === СОХРАНЕНИЕ ===
window.saveAllSettings = function() {
    console.log('💾 Сохранение всех настроек...');
    
    // Сохраняем локально
    localStorage.setItem('prutkon_employees', JSON.stringify(window.dbEmployees));
    localStorage.setItem('prutkon_settings_log', JSON.stringify(window.settingsChangeLog));
    localStorage.setItem('prutkon_last_save', new Date().toISOString());
    
    window.logChange('settings_save', {
        employees: window.dbEmployees.length,
        timestamp: new Date().toLocaleTimeString('ru-RU')
    });
    
    // Форсируем синхронизацию через глобальную fbPush
    if (window.fbPush) {
        const pushResult = window.fbPush();
        if (pushResult === false) {
            window.showToast('Сохранено локально (Firebase недоступна)', 'warning');
        } else {
            window.showToast('✅ Все изменения сохранены и синхронизированы!', 'success');
        }
        console.log('🔁 Выполнена fbPush синхронизация');
    } else {
        window.showToast('✅ Изменения сохранены локально', 'success');
    }
    
    // Обновляем экран входа
    if (window.updateLoginSelect) {
        window.updateLoginSelect();
    }
    
    console.log('✅ Сохранение завершено');
};

// === РЕЗЕРВНАЯ КОПИЯ ===
window.backupData = function() {
    const backup = {
        employees: window.dbEmployees,
        logs: window.settingsChangeLog,
        version: '8.7.0',
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prutkon_backup_' + new Date().toISOString().slice(0,19).replace(/[:\-]/g, '') + '.json';
    link.click();
    URL.revokeObjectURL(url);
    window.showToast('Резервная копия создана', 'success');
};
// === BITRIX24 INTEGRATION UI ===
window.uiLoadBitrixConfig = function() {
    console.log('🛰 Загрузка конфигурации Bitrix24...');
    const cfg = window.bitrixConfig || {};
    
    if (document.getElementById('bitrix-webhook-url')) {
        document.getElementById('bitrix-webhook-url').value = cfg.webhookUrl || '';
    }
    
    // Загружаем маппинг полей
    if (cfg.mapping && cfg.mapping.fields) {
        if (document.getElementById('bitrix-field-brand')) document.getElementById('bitrix-field-brand').value = cfg.mapping.fields.brand || '';
        if (document.getElementById('bitrix-field-model')) document.getElementById('bitrix-field-model').value = cfg.mapping.fields.model || '';
    }

    // Если есть вебхук, пробуем подтянуть список воронок
    if (cfg.webhookUrl) {
        window.syncBitrixData(true);
    }
};

window.syncBitrixData = async function(isInitial = false) {
    const statusMsg = document.getElementById('bitrix-status-msg');
    if (statusMsg) statusMsg.innerHTML = '<span class="blue"><i class="fa-solid fa-spinner fa-spin"></i> Синхронизация с Битрикс24...</span>';

    try {
        const categories = await window.getBitrixCategories();
        const pipelineSelect = document.getElementById('bitrix-pipeline-id');
        
        if (pipelineSelect && categories.length > 0) {
            pipelineSelect.innerHTML = categories.map(c => `<option value="${c.ID}">${c.NAME}</option>`).join('');
            pipelineSelect.value = window.bitrixConfig.mapping.deal_category || 0;
            
            // При изменении воронки - обновляем стадии
            pipelineSelect.onchange = () => window.loadBitrixStages(pipelineSelect.value);
            
            // Загружаем стадии для текущей воронки
            await window.loadBitrixStages(pipelineSelect.value);
        }

        if (statusMsg) statusMsg.innerHTML = '<span class="emerald"><i class="fa-solid fa-check"></i> Данные синхронизированы</span>';
        if (!isInitial) window.showToast('Данные Битрикс24 обновлены', 'success');
    } catch (e) {
        if (statusMsg) statusMsg.innerHTML = '<span class="brand-red"><i class="fa-solid fa-triangle-exclamation"></i> Ошибка синхронизации</span>';
    }
};

window.loadBitrixStages = async function(categoryId) {
    const stages = await window.getBitrixStages(categoryId);
    const stageSelect = document.getElementById('bitrix-stage-id');
    if (stageSelect) {
        stageSelect.innerHTML = stages.map(s => `<option value="${s.STATUS_ID}">${s.NAME}</option>`).join('');
        stageSelect.value = window.bitrixConfig.mapping.stage_production || '';
    }
};

window.uiSaveBitrixConfig = function() {
    const cfg = {
        webhookUrl: document.getElementById('bitrix-webhook-url').value.trim(),
        mapping: {
            deal_category: document.getElementById('bitrix-pipeline-id').value,
            stage_production: document.getElementById('bitrix-stage-id').value,
            fields: {
                brand: document.getElementById('bitrix-field-brand').value.trim(),
                model: document.getElementById('bitrix-field-model').value.trim()
            }
        }
    };
    
    cfg.enabled = !!cfg.webhookUrl;
    window.saveBitrixConfig(cfg);
};

// Конец файла (Удален дублирующий слушатель)
