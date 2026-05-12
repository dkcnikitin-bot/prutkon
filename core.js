/**
 * PRUTKON ERP OS - CORE.JS (v18.26.0)
 * ПОЛНОЕ ИСПРАВЛЕННОЕ ЯДРО (БЕЗ СОКРАЩЕНИЙ)
 */

window.DB_VERSION = "18.26.0";
window.DB_KEY = "prutkon_data_v1";

// --- 1. СИНХРОНИЗАЦИЯ ---
window.saveAllToLocal = () => {
    localStorage.setItem(window.DB_KEY, JSON.stringify({
        products: window.dbProducts || [],
        categories: window.dbCategories || [],
        orders: window.orders || [],
        employees: window.dbEmployees || [],
        directories: window.dbDirectories || [],
        audit: window.dbAuditLog || [],
        trans_products: window.dbTransProducts || [],
        trans_categories: window.dbTransCategories || [],
        catalog_data: window.catalogData || [],
        catalog_categories: window.catalogCategories || [],
        directory_categories: window.dbDirectoryCategories || []
    }));
    window.dispatchEvent(new CustomEvent('db_updated'));
};

// --- UTILS ---
window.parseRusFloat = (str) => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    // Убираем пробелы, валютные символы и меняем запятую на точку
    const s = String(str).replace(/\s/g, '').replace(/[₽%]/g, '').replace(',', '.');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
};

window.formatRusNumber = (v, decimals = 2) => {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v || 0);
};

window.formatRusCurrency = (v) => {
    return window.formatRusNumber(v, 2) + " ₽";
};

window.formatWhNumber = (v, decimals = 2) => {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: decimals }).format(v || 0);
};

window.autoCalculateMetalData = (item) => {
    const C = window.parseRusFloat(item.weight_per_m);
    const G = window.parseRusFloat(item.weight);
    const H = window.parseRusFloat(item.price);
    const M = window.parseRusFloat(item.delivery_m_no_vat);
    const Q = window.parseRusFloat(item.vat_rate);

    if (Q > 0) {
        item.sum_no_vat = window.formatRusCurrency(G * H);
        item.sum_vat = window.formatRusCurrency(G * H * Q);
        item.price_m_no_vat = window.formatRusCurrency((H / 1000) * C);
        item.price_m_vat = window.formatRusCurrency((H / 1000) * C * Q);
        item.delivery_m_vat = window.formatRusCurrency(M * Q);
        item.total_price_m_no_vat = window.formatRusCurrency(((H / 1000) * C) + M);
        item.total_price_m_vat = window.formatRusCurrency((((H / 1000) * C) + M) * Q);
    }
};

window.safeParse = (key, def) => {
    try {
        const stored = localStorage.getItem(window.DB_KEY);
        if (!stored) return def;
        const data = JSON.parse(stored);
        const map = {
            'prutkon_products': data.products,
            'prutkon_categories': data.categories,
            'prutkon_orders': data.orders,
            'prutkon_employees': data.employees,
            'prutkon_directories': data.directories,
            'prutkon_audit_log': data.audit,
            'prutkon_trans_products': data.trans_products,
            'prutkon_trans_categories': data.trans_categories,
            'prutkon_catalog_data': data.catalog_data,
            'prutkon_catalog_categories': data.catalog_categories,
            'prutkon_dir_categories': data.directory_categories
        };
        return map[key] || def;
    } catch (e) { return def; }
};

// --- 2. ДАННЫЕ (КАТЕГОРИИ И КЛИЕНТЫ) ---
window.dbCategories = window.safeParse('prutkon_categories', [
    { id: 'transporters', name: 'Транспортеры', parent: null, schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'belts', name: 'Ремни', parent: null, schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'sec_rods', name: 'Прутки', parent: null },
    { id: 'blanks', name: 'заготовки', parent: 'sec_rods', schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'sub_rods_rti', name: 'Прутки РТИ и гнутые', parent: 'sec_rods' },
    { id: 'rods_rti', name: 'Прутки РТИ', parent: 'sub_rods_rti', schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'rods_bent_metal', name: 'Прутки гнутые металл', parent: 'sub_rods_rti', schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'rods_bent_rti', name: 'Прутки гнутые РТИ', parent: 'sub_rods_rti', schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'rods_hedgehog', name: 'Прутки ёжные', parent: 'sub_rods_rti', schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'rods_finger', name: 'Прутки пальцевые', parent: 'sub_rods_rti', schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'rods_double', name: 'Сдвоенный пруток', parent: 'sec_rods', schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'pushers', name: 'Сталкиватели', parent: null, schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'fingers', name: 'Пальцы', parent: null, schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'flaps', name: 'Хлопушки', parent: null, schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'hardware_small', name: 'Скобяные изделия', parent: null },
    { id: 'locks', name: 'Замки', parent: 'hardware_small', schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'fasteners', name: 'Метизы', parent: 'hardware_small', schema: ['tech_type', 'available', 'photo', 'drawing', 'art_prutkon', 'blank_ref', 'art_all', 'stats', 'stock', 'global'] },
    { id: 'rollers', name: 'Ролики и звездочки', parent: null },
    { id: 'mesh', name: 'Ленты и полотна', parent: null },
    { id: 'glue', name: 'Клей', parent: null },
    { id: 'pvc_belts', name: 'Конвейерные ленты ПВХ', parent: null },
    { id: 'others', name: 'Другие запчасти', parent: null }
]);

window.dbProducts = window.safeParse('prutkon_products', []);
window.dbDirectoryCategories = window.safeParse('prutkon_dir_categories', [
    { id: 'metal', name: 'Справочник металлов', schema: ['diameter', 'weight_per_m', 'length', 'bars_count', 'total_len', 'steel_type', 'available', 'weight', 'price', 'delivery_total', 'sum_no_vat', 'sum_vat', 'price_m_no_vat', 'price_m_vat', 'delivery_m_no_vat', 'delivery_m_vat', 'total_price_m_no_vat', 'total_price_m_vat', 'vat_rate', 'invoice_num', 'delivery_date', 'supplier'] },
    { id: 'brands', name: 'Бренды / Производители', schema: ['country', 'website', 'priority'] },
    { id: 'dealers', name: 'Поставщики / Дилеры', schema: ['address', 'manager', 'contact'] }
]);

window.dbDirectories = window.safeParse('prutkon_directories', []);
if (!window.dbDirectories || window.dbDirectories.length === 0) {
    window.dbDirectories = [
        { id: 101, category: 'metal', name: '10-ОМZ', diameter: '10', weight_per_m: '0,616', length: '6000', bars_count: '850', total_len: '5100', steel_type: '60С2ХА', available: 'Нет', weight: '3,135', price: '112 167,00 ₽', sum_no_vat: '351 755,71 ₽', sum_vat: '422 141,87 ₽', price_m_no_vat: '69,09 ₽', price_m_vat: '84,30 ₽', delivery_m_no_vat: '5,73 ₽', delivery_m_vat: '6,99 ₽', total_price_m_no_vat: '74,82 ₽', total_price_m_vat: '91,29 ₽', vat_rate: '1,2', invoice_num: 'НК-00123', delivery_date: '08.02.2026', supplier: 'АО ОМЗ' },
        { id: 102, category: 'metal', name: '11-ОМZ', diameter: '11', weight_per_m: '0,746', length: '6000', steel_type: '60С2ХА', available: 'Нет', weight: '3,365', price: '112 167,00 ₽', sum_no_vat: '377 554,12 ₽', sum_vat: '460 616,03 ₽', price_m_no_vat: '83,68 ₽', price_m_vat: '102,09 ₽', delivery_m_no_vat: '6,94 ₽', delivery_m_vat: '8,46 ₽', total_price_m_no_vat: '90,61 ₽', total_price_m_vat: '110,55 ₽', vat_rate: '1,2', invoice_num: 'НК-00123', delivery_date: '08.02.2026', supplier: 'АО ОМЗ' },
        { id: 103, category: 'metal', name: '12-ОМZ', diameter: '12', weight_per_m: '0,888', length: '6000', steel_type: '60С2ХА', available: 'Нет', weight: '3,278', price: '112 167,00 ₽', sum_no_vat: '367 683,43 ₽', sum_vat: '448 573,78 ₽', price_m_no_vat: '99,60 ₽', price_m_vat: '121,52 ₽', delivery_m_no_vat: '8,26 ₽', delivery_m_vat: '10,07 ₽', total_price_m_no_vat: '107,86 ₽', total_price_m_vat: '131,59 ₽', vat_rate: '1,2', invoice_num: 'НК-00124', delivery_date: '08.02.2026', supplier: 'АО ОМЗ' },
        { id: 104, category: 'metal', name: '13-ОМZ', diameter: '13', weight_per_m: '1,04', length: '6000', steel_type: '60С2ХА', available: 'Нет', weight: '0,797', price: '112 167,00 ₽', sum_no_vat: '89 397,10 ₽', sum_vat: '109 064,46 ₽', price_m_no_vat: '116,65 ₽', price_m_vat: '142,32 ₽', delivery_m_no_vat: '9,67 ₽', delivery_m_vat: '11,80 ₽', total_price_m_no_vat: '126,33 ₽', total_price_m_vat: '154,12 ₽', vat_rate: '1,2', invoice_num: 'НК-00124', delivery_date: '08.02.2026', supplier: 'АО ОМЗ' },
        { id: 105, category: 'metal', name: '10-МЕТ', diameter: '10', weight_per_m: '0,616', length: '6000', steel_type: '60С2ХА', available: 'Нет', weight: '0,35', price: '161 120,00 ₽', sum_no_vat: '56 392,00 ₽', sum_vat: '67 670,40 ₽', price_m_no_vat: '99,25 ₽', price_m_vat: '119,10 ₽', delivery_m_no_vat: '11,48 ₽', delivery_m_vat: '13,77 ₽', total_price_m_no_vat: '110,73 ₽', total_price_m_vat: '132,87 ₽', vat_rate: '1,2', invoice_num: 'М-908', delivery_date: '17.02.2023', supplier: 'ПАО Ижсталь (Мечел)' },
        { id: 106, category: 'metal', name: '11-МЕТ', diameter: '11', weight_per_m: '0,746', length: '6000', steel_type: '60С2ХА', available: 'Нет', weight: '0,44', price: '161 120,00 ₽', sum_no_vat: '70 892,80 ₽', sum_vat: '85 071,36 ₽', price_m_no_vat: '120,20 ₽', price_m_vat: '144,23 ₽', delivery_m_no_vat: '13,90 ₽', delivery_m_vat: '16,68 ₽', total_price_m_no_vat: '134,10 ₽', total_price_m_vat: '160,92 ₽', vat_rate: '1,2', invoice_num: 'М-908', delivery_date: '17.02.2023', supplier: 'ПАО Ижсталь (Мечел)' },
        { id: 107, category: 'metal', name: '12-МЕТ', diameter: '12', weight_per_m: '0,888', length: '6000', steel_type: '60С2ХА', available: 'Нет', weight: '0,4', price: '161 120,00 ₽', sum_no_vat: '64 448,00 ₽', sum_vat: '77 337,60 ₽', price_m_no_vat: '143,07 ₽', price_m_vat: '171,69 ₽', delivery_m_no_vat: '16,55 ₽', delivery_m_vat: '19,86 ₽', total_price_m_no_vat: '159,62 ₽', total_price_m_vat: '191,55 ₽', vat_rate: '1,2', invoice_num: 'М-909', delivery_date: '17.02.2023', supplier: 'ПАО Ижсталь (Мечел)' },
        { id: 108, category: 'metal', name: '13-МЕТ', diameter: '13', weight_per_m: '1,04', length: '6000', steel_type: '60С2ХА', available: 'Нет', weight: '0,42', price: '161 120,00 ₽', sum_no_vat: '67 670,40 ₽', sum_vat: '81 204,48 ₽', price_m_no_vat: '167,56 ₽', price_m_vat: '201,08 ₽', delivery_m_no_vat: '19,38 ₽', delivery_m_vat: '23,25 ₽', total_price_m_no_vat: '186,94 ₽', total_price_m_vat: '224,33 ₽', vat_rate: '1,2', invoice_num: 'М-909', delivery_date: '17.02.2023', supplier: 'ПАО Ижсталь (Мечел)' }
    ];
}

window.orders = window.safeParse('prutkon_orders', []);
window.dbEmployees = window.safeParse('prutkon_employees', []);
if (!window.dbEmployees || window.dbEmployees.length === 0) {
    window.dbEmployees = [
        { id: 1, name: 'Администратор', role: 'Админ', pwd: '123' },
        { id: 2, name: 'Никитин Иван Андреевич', role: 'Руководитель', pwd: '123' },
        { id: 3, name: 'Менеджер продаж', role: 'Менеджер', pwd: '123' }
    ];
}
window.dbAuditLog = window.safeParse('prutkon_audit_log', []);
window.dbTransProducts = window.safeParse('prutkon_trans_products', []);
window.dbTransCategories = window.safeParse('prutkon_trans_categories', [
    { id: 'transporters', name: 'Транспортеры' }
]);
window.catalogData = window.safeParse('prutkon_catalog_data', []);
window.catalogCategories = window.safeParse('prutkon_catalog_categories', [
    { id: 'models', name: 'Каталог моделей техники' }
]);
window.currentUser = window.dbEmployees[0] || { name: 'Система', role: 'Admin' };

// --- 3. ГЛОБАЛЬНЫЕ КОНСТАНТЫ ---
window.steelTypes = ['60С2ХА', 'Ст3', '40Х', '65Г', '60С2А', '50ХФА', 'AISI 304', 'AISI 316'];
window.MEASURE_UNITS = ['кг', 'т', 'шт', 'м.п', 'рулон'];

// --- 4. UI ХЕЛПЕРЫ ---
window.formatCurrency = (v) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(v || 0);

window.showToast = (msg, type = 'info') => {
    let t = document.getElementById('system-toast');
    if (!t) {
        t = document.createElement('div'); t.id = 'system-toast';
        t.style.cssText = "position:fixed; bottom:50px; right:30px; z-index:100000; padding:15px 25px; border-radius:12px; font-weight:700; color:#fff; backdrop-filter:blur(15px); transition:0.3s; transform:translateY(100px); opacity:0; box-shadow:0 10px 30px rgba(0,0,0,0.5);";
        document.body.appendChild(t);
    }
    const col = { success:'#00ff9d', error:'#ff1e27', info:'#00b4ff' };
    t.style.background = (col[type] || col.info) + 'cc';
    t.innerHTML = `<i class="fa-solid fa-bell"></i> ${msg}`;
    t.style.transform = 'translateY(0)'; t.style.opacity = '1';
    setTimeout(() => { t.style.transform = 'translateY(100px)'; t.style.opacity = '0'; }, 3000);
};

window.confirmAction = (title, text, cb) => {
    let m = document.getElementById('system-confirm-modal');
    if (!m) {
        m = document.createElement('div'); m.id = 'system-confirm-modal'; m.className = 'modal confirm-modal';
        m.innerHTML = `<div class="confirm-card"><h3 id="confirm-title"></h3><p id="confirm-text"></p><div class="confirm-actions"><button class="btn btn-secondary" onclick="document.getElementById('system-confirm-modal').classList.remove('active')">Отмена</button><button id="confirm-yes" class="btn btn-primary">Да</button></div></div>`;
        document.body.appendChild(m);
    }
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-text').innerText = text;
    document.getElementById('confirm-yes').onclick = () => { m.classList.remove('active'); cb(); };
    m.classList.add('active');
};

// --- 4. АУДИТ И БЭКАП ---
window.logAudit = (type, action) => {
    window.dbAuditLog.unshift({ ts: new Date().toLocaleString(), user: window.currentUser.name, action: action });
    if (window.dbAuditLog.length > 100) window.dbAuditLog.pop();
    window.saveAllToLocal();
};

window.exportSystemBackup = () => {
    const data = { products: window.dbProducts, categories: window.dbCategories, orders: window.orders, v: window.DB_VERSION, ts: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `backup_${new Date().toISOString().split('T')[0]}.json`; a.click();
};

window.restoreSystemBackup = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    inp.onchange = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const d = JSON.parse(ev.target.result);
                if (d.products) window.dbProducts = d.products;
                if (d.categories) window.dbCategories = d.categories;
                if (d.orders) window.orders = d.orders;
                window.saveAllToLocal();
                if (window.showToast) window.showToast(`Резервная копия восстановлена (v${d.v || '?'})`, 'success');
                setTimeout(() => location.reload(), 1500);
            } catch(err) { alert('Ошибка чтения файла бэкапа: ' + err.message); }
        };
        reader.readAsText(file);
    };
    inp.click();
};

window.showAuditLog = () => {
    const logs = window.dbAuditLog || [];
    let html = `<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.9);z-index:999999;display:flex;align-items:center;justify-content:center;" onclick="if(event.target===this)this.remove()">
        <div style="background:#080808;border:1px solid #181818;border-radius:20px;width:700px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;">
            <div style="padding:25px;border-bottom:1px solid #111;display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;color:#fff;font-size:1rem;text-transform:uppercase;letter-spacing:2px;"><i class="fa-solid fa-list-ul" style="color:var(--brand-red);margin-right:10px;"></i>Журнал аудита ОС</h3>
                <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;color:#666;font-size:1.5rem;cursor:pointer;">&times;</button>
            </div>
            <div style="overflow-y:auto;padding:20px;flex:1;">
                ${logs.length === 0 ? '<div style="text-align:center;padding:40px;opacity:0.3;">Журнал пуст</div>' :
                logs.map(l => `<div style="padding:12px;background:rgba(255,255,255,0.02);border-radius:10px;margin-bottom:8px;border:1px solid rgba(255,255,255,0.03);">
                    <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                        <strong style="color:#fff;font-size:0.8rem;">${l.user || 'Система'}</strong>
                        <span style="opacity:0.4;font-size:0.65rem;">${l.ts || l.time || ''}</span>
                    </div>
                    <div style="color:#888;font-size:0.75rem;">${l.action || ''}</div>
                </div>`).join('')}
            </div>
        </div>
    </div>`;
    const el = document.createElement('div');
    el.innerHTML = html;
    document.body.appendChild(el.firstElementChild);
};

window.showVersionHistory = () => {
    const hist = window.DEFAULT_VERSION_HISTORY || [];
    let html = `<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.9);z-index:999999;display:flex;align-items:center;justify-content:center;" onclick="if(event.target===this)this.remove()">
        <div style="background:#080808;border:1px solid #181818;border-radius:20px;width:750px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;">
            <div style="padding:25px;border-bottom:1px solid #111;display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;color:#fff;font-size:1rem;text-transform:uppercase;letter-spacing:2px;"><i class="fa-solid fa-code-branch" style="color:var(--brand-red);margin-right:10px;"></i>История версий ПРУТКОН ОС</h3>
                <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;color:#666;font-size:1.5rem;cursor:pointer;">&times;</button>
            </div>
            <div style="overflow-y:auto;padding:20px;flex:1;">
                ${hist.map(v => `<div style="padding:15px;background:rgba(255,255,255,0.02);border-radius:12px;margin-bottom:10px;border-left:3px solid var(--brand-red);">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <strong style="color:var(--brand-red);font-size:0.9rem;">v${v.version} — ${v.codename}</strong>
                        <span style="opacity:0.4;font-size:0.65rem;">${v.date}</span>
                    </div>
                    <ul style="margin:0;padding-left:15px;color:#888;font-size:0.75rem;">
                        ${(v.changes||[]).map(c => `<li style="margin-bottom:3px;">${c}</li>`).join('')}
                    </ul>
                </div>`).join('')}
            </div>
        </div>
    </div>`;
    const el = document.createElement('div');
    el.innerHTML = html;
    document.body.appendChild(el.firstElementChild);
};


// --- 5. ИМПОРТ (UNIVERSAL ENGINE V2) ---
window.runUniversalImport = async ({ data, mappings, artSources, targetCategory, categoryName, options, onProgress }) => {
    const results = [];
    const moduleName = (options && options.moduleName) ? options.moduleName : "Excel Импорт";
    const userName = (window.currentUser && window.currentUser.name) ? window.currentUser.name : "Система";
    
    for (let i = 0; i < data.length; i++) {
        const row = data[i]; 
        if (!row || row.length === 0) continue;
        
        // Извлекаем артикул
        let art = ""; 
        artSources.forEach(idx => { 
            if (row[idx]) art = String(row[idx]).trim(); 
        });
        
        if (!art || art === "---" || art === "") continue;
        
        const item = { 
            id: Date.now() + i, 
            category: targetCategory, 
            art: art, 
            history: [{ time: new Date().toLocaleString(), user: userName, action: `Импорт из Excel (${moduleName})` }]
        };
        
        // Заполняем поля из маппинга
        for (let key in mappings) {
            const colIdx = mappings[key];
            const val = row[colIdx];
            if (val !== undefined && val !== null && val !== '') {
                if (key.startsWith('DYNAMIC_')) {
                    item[key.replace('DYNAMIC_', '')] = String(val).trim();
                } else {
                    item[key] = val;
                }
            }
        }
        
        // 🔥 Отладка фото (первые 3 строки)
        if (results.length < 3) {
            console.log(`📦 ROW[${i}] art="${art}"`, {
                photo_filename: item.photo_filename,
                photo_path: item.photo_path,
                allKeys: Object.keys(item)
            });
        }
        
        // === 🖼️ СБОРКА ПУТИ К ФОТО (V2 - с поддержкой абсолютных путей) ===
        let photoFilename = '';
        let photoRelDir = '';
        
        // Обработка photo_filename
        if (item.photo_filename) {
            const raw = String(item.photo_filename).trim();
            if (raw && raw !== '---') {
                photoFilename = raw.split('\\').pop().split('/').pop().trim();
            }
            delete item.photo_filename;
        }
        
        // Обработка photo_path
        if (item.photo_path) {
            const raw = String(item.photo_path).trim();
            if (raw && raw !== '---') {
                let normalized = raw.replace(/\\/g, '/').replace(/\/$/, '');
                const markerLow = normalized.toLowerCase();
                const marker = 'extracted_xlsx';
                const idx = markerLow.indexOf(marker);
                
                if (idx >= 0) {
                    photoRelDir = normalized.substring(idx);
                } else {
                    const idx2 = markerLow.indexOf('extracted');
                    if (idx2 >= 0) {
                        photoRelDir = normalized.substring(idx2);
                    } else {
                        const parts = normalized.split('/');
                        photoRelDir = parts.slice(-2).join('/');
                    }
                }
            }
            delete item.photo_path;
        }
        
        // Формируем итоговый путь к фото
        if (photoFilename && photoFilename !== '---' && photoFilename !== '') {
            if (photoRelDir && photoRelDir !== '---') {
                const dirClean = photoRelDir.replace(/\/$/, '');
                item.photo = `${dirClean}/${photoFilename}`;
            } else {
                item.photo = `extracted_xlsx/${photoFilename}`;
            }
        } else if (photoRelDir && photoRelDir !== '---') {
            item.photo = photoRelDir;
        }
        
        // 🔥 Логирование для отладки (первые 5 товаров)
        if (item.photo && results.length < 5) {
            console.log(`🖼 PHOTO [${item.art}]: ${item.photo}`);
        }
        
        // Конвертация числовых полей
        if (item.price) {
            item.price = parseFloat(String(item.price).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        }
        if (item.stock) {
            item.stock = parseInt(String(item.stock).replace(/\s/g, '')) || 0;
        }
        
        results.push(item);
        
        if (onProgress) {
            onProgress(i, data.length, results.length, `✅ ${art}`);
        }
        
        if (i % 50 === 0) await new Promise(r => setTimeout(r, 1));
    }
    
    return results;
};


// --- 6. КОНСТРУКТОР (ДЛЯ INDEX.HTML) ---
window.renderConstructor = () => {
    const p = document.getElementById('constructor-main'); if (!p) return;
    p.innerHTML = `
        <div class="welcome-panel"><h1>PRUTKON ERP</h1><p id="dash-date">...</p></div>
        <div class="stats-grid mb-5" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px;">
            <div class="stat-card"><h4>Выручка</h4><div id="dash-revenue" class="stat-value">0</div></div>
            <div class="stat-card"><h4>Заказы</h4><div id="dash-orders-count" class="stat-value">0</div></div>
            <div class="stat-card"><h4>Нагрузка</h4><div id="dash-load-value" class="stat-value">0%</div></div>
        </div>
        <div class="dash-row" style="display:grid; grid-template-columns: 2fr 1fr; gap:25px;">
            <div class="panel"><h3>Последние сделки</h3><table class="w-full"><tbody id="dash-orders-list"></tbody></table></div>
            <div class="panel"><h3>Активность</h3><div id="dash-audit-feed" class="audit-feed"></div></div>
        </div>
    `;
};

// --- 7. UI RENDERING (делегируем модулям header.js, menu.js, footer.js) ---
window.renderLayout = () => {
    if (typeof window.renderSidebar === 'function') {
        window.renderSidebar();
    }
};

if (typeof window.renderTopMenu !== 'function') {
    window.renderTopMenu = () => console.warn('header.js not loaded');
}
if (typeof window.renderNavItems !== 'function') {
    window.renderNavItems = () => console.warn('menu.js not loaded');
}
if (typeof window.renderSystemFooter !== 'function') {
    window.renderSystemFooter = () => console.warn('footer.js not loaded');
};

// --- 8. AUTHENTICATION ---
window.ensureLoginModal = () => {
    let m = document.getElementById('login-modal');
    if (!m) {
        m = document.createElement('div');
        m.id = 'login-modal';
        m.className = 'modal active';
        m.style.display = 'flex';
        m.innerHTML = `
            <div class="glass-panel" style="width:420px; padding:50px; text-align:center; border-top:4px solid var(--brand-red);">
                <div style="margin-bottom:35px;">
                    <i class="fa-solid fa-user-shield" style="font-size:3.5rem; color:var(--brand-red); margin-bottom:20px; filter:drop-shadow(0 0 20px rgba(226,31,38,0.3));"></i>
                    <h2 style="font-family:'Outfit'; margin:0 0 10px; font-size:1.8rem;">ПРУТКОН ОС</h2>
                    <p style="color:var(--text-muted); font-size:0.85rem;">Авторизация для доступа к системе</p>
                </div>
                <div class="form-group mb-4">
                    <select id="login-role" class="form-control" style="height:50px; font-size:1rem; font-weight:600;">
                        ${window.dbEmployees.map((e, i) => `<option value="${i}">${e.name} (${e.role})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group mb-4">
                    <input type="password" id="login-pwd" class="form-control" placeholder="Пароль" style="height:50px; font-size:1rem;" onkeypress="if(event.key==='Enter')window.doLogin()">
                </div>
                <button class="btn btn-primary w-100" style="height:50px; font-size:1rem;" onclick="window.doLogin()">
                    <i class="fa-solid fa-arrow-right-to-bracket"></i> Войти в систему
                </button>
                <div style="margin-top:25px; font-size:0.7rem; color:var(--text-muted);">
                    Пароль по умолчанию: <strong style="color:var(--brand-red);">123</strong>
                </div>
            </div>`;
        document.body.appendChild(m);
    }
    window.updateLoginSelect();
    return m;
};

window.checkAuth = () => {
    const idx = localStorage.getItem('prutkon_login_idx');
    const app = document.querySelector('.main-content');
    let m = document.getElementById('login-modal');
    if (!m) m = window.ensureLoginModal();
    
    if (idx !== null && window.dbEmployees[idx]) {
        if (app) { app.style.opacity = '1'; app.style.pointerEvents = 'auto'; }
        if (m) { m.classList.remove('active'); m.style.display = 'none'; }
        const emp = window.dbEmployees[idx];
        const av = emp.name.split(' ').map(x => x[0]).join('').slice(0, 2);
        document.querySelectorAll('.user-name').forEach(el => el.innerText = emp.name);
        document.querySelectorAll('.user-role').forEach(el => el.innerText = emp.role);
        document.querySelectorAll('.avatar').forEach(a => { a.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(av)}&background=E21F26&color=fff&size=128`; });
        return true;
    }
    if (app) { app.style.opacity = '0.1'; app.style.pointerEvents = 'none'; }
    if (m) { m.classList.add('active'); m.style.display = 'flex'; }
    return false;
};

window.updateLoginSelect = () => {
    const sel = document.getElementById('login-role');
    if (sel && window.dbEmployees) {
        sel.innerHTML = window.dbEmployees.map((e, i) => `<option value="${i}">${e.name} (${e.role})</option>`).join('');
    }
};

window.doLogin = () => { 
    const i = document.getElementById('login-role').value; 
    const p = document.getElementById('login-pwd').value; 
    if (window.dbEmployees[i] && p === window.dbEmployees[i].pwd) { 
        localStorage.setItem('prutkon_login_idx', i); 
        window.location.reload(); 
    } else { 
        alert("ОШИБКА АВТОРИЗАЦИИ"); 
    } 
};

window.doLogout = () => { localStorage.removeItem('prutkon_login_idx'); window.location.reload(); };

// --- 9. FIREBASE STUBS (TO PREVENT CRASHES) ---
window.fbPush = window.fbPush || (() => console.warn('Firebase: Cloud Sync disabled (local mode)'));
window.fbListen = window.fbListen || (() => console.warn('Firebase: Listener disabled (local mode)'));
window.connectFirebase = window.connectFirebase || (() => console.warn('Firebase: Connection disabled (local mode)'));

// --- 10. SYSTEM BRIDGES (LEGACY COMPATIBILITY) ---
window.saveOrders = window.saveAllToLocal;
window.saveCatalog = window.saveAllToLocal;
window.addAudit = (id, action, user) => window.logAudit('INFO', `${action} (ID: ${id})`);

// --- 11. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.renderSidebar === 'function') {
        window.renderSidebar();
    } else {
        window.renderLayout();
        window.renderNavItems();
    }
    window.renderTopMenu();
    window.renderSystemFooter();
    window.ensureLoginModal();
    if (window.checkAuth()) { console.log('Auth OK'); }
    
    setInterval(() => { 
        const el = document.getElementById("top-bar-clock"); 
        if (el) el.innerText = new Date().toLocaleTimeString("ru-RU"); 
    }, 1000);
    
    console.log(`Core OS v${window.DB_VERSION} operational.`);
});

console.log("PRUTKON CORE v18.26.0 OPERATIONAL");
