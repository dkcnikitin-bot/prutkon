/**
 * ПРУТКОН ОС: Модуль "Склад и Производство" (Логика)
 */

window.formatWhNumber = window.formatWhNumber || ((v, decimals = 2) => {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: decimals }).format(v || 0);
});

let WAREHOUSE_CATALOG = {
    'metal': { name: 'Металл (Прочее)', unit: 'кг', icon: 'fa-cubes' },
    'belt': { name: 'Лента', unit: 'м', icon: 'fa-tape' },
    'blank': { name: 'Заготовка', unit: 'шт', icon: 'fa-cube' },
    'straight': { name: 'Пруток (прямой)', unit: 'шт', icon: 'fa-ruler-horizontal' },
    'double': { name: 'Сдвоенный пруток', unit: 'шт', icon: 'fa-grip-lines' },
    'bent': { name: 'Гнутый пруток', unit: 'шт', icon: 'fa-wave-square' },
    'rubberized': { name: 'Обрезиненный пруток', unit: 'шт', icon: 'fa-ring' },
    'hedge': { name: 'Ёжные и пальцевые прутки', unit: 'шт', icon: 'fa-star-of-life' },
    'bent_rubberized': { name: 'Гнутый пруток обрезиненный', unit: 'шт', icon: 'fa-bacon' }
};

window.initWarehouseCatalog = () => {
    if (window.dbDirectories) {
        const metals = window.dbDirectories.filter(d => d.category === 'metal');
        metals.forEach(m => {
            WAREHOUSE_CATALOG[`metal_${m.id}`] = {
                name: `Металл: ${m.name} (Ø${m.diameter}мм, ${m.steel_type})`,
                unit: 'кг',
                icon: 'fa-cube'
            };
        });
    }
};

const OPERATIONS_CONFIG = {
    'in_metal': { type: 'Приход: Металл', target: 'metal', source: null, isIncoming: true },
    'in_belt': { type: 'Приход: Лента', target: 'belt', source: null, isIncoming: true },
    'prod_blank': { type: 'Изготовление: Заготовка', target: 'blank', source: 'metal' },
    'prod_straight': { type: 'Изготовление: Пруток (прямой)', target: 'straight', source: 'blank' },
    'prod_double': { type: 'Изготовление: Сдвоенный пруток', target: 'double', source: 'blank' },
    'prod_bent': { type: 'Изготовление: Гнутый пруток', target: 'bent', source: 'straight' },
    'prod_rubber': { type: 'Изготовление: Обрезиненный пруток', target: 'rubberized', source: 'straight' },
    'prod_hedge': { type: 'Изготовление: Ёжные/пальцевые прутки', target: 'hedge', source: 'straight' },
    'prod_bent_rubber': { type: 'Изготовление: Гнутый обрезиненный пруток', target: 'bent_rubberized', source: 'bent' },
    'write_off': { type: 'Списание / Брак', isWriteoff: true }
};

window.initWarehouse = () => {
    window.dbWarehouseInv = JSON.parse(localStorage.getItem('prutkon_warehouse_inv')) || {
        metal: 0, belt: 0, blank: 0, straight: 0, double: 0,
        bent: 0, rubberized: 0, hedge: 0, bent_rubberized: 0
    };
    window.dbWarehouseLog = JSON.parse(localStorage.getItem('prutkon_warehouse_log')) || [];
    
    window.initWarehouseCatalog();
    window.refreshWarehouseData();
};

document.addEventListener('DOMContentLoaded', () => {
    const checkData = setInterval(() => {
        if (window.dbDirectories && window.dbDirectories.length > 0) {
            clearInterval(checkData);
            window.initWarehouse();
        }
    }, 100);

    setTimeout(() => {
        clearInterval(checkData);
        if (!window.dbWarehouseInv) window.initWarehouse();
    }, 2000);
});

window.saveWarehouseData = () => {
    localStorage.setItem('prutkon_warehouse_inv', JSON.stringify(window.dbWarehouseInv));
    localStorage.setItem('prutkon_warehouse_log', JSON.stringify(window.dbWarehouseLog));
    if (window.fbPush) {
        window.fbPush('prutkon_warehouse_inv', window.dbWarehouseInv);
        window.fbPush('prutkon_warehouse_log', window.dbWarehouseLog);
    }
    window.saveAllToLocal();
};

window.refreshWarehouseData = () => {
    renderInventory();
    renderMetrics();
    renderLog();
};

function renderInventory() {
    const tbody = document.querySelector('#inventory-table tbody');
    if (!tbody) return;

    let html = '';
    for (let key in WAREHOUSE_CATALOG) {
        if (key === 'metal' || key.startsWith('metal_')) continue;
        const item = WAREHOUSE_CATALOG[key];
        const qty = window.dbWarehouseInv[key] || 0;
        html += renderInventoryRow(key, item, qty);
    }

    html += `<tr style="background:rgba(255,255,255,0.03);"><td colspan="3" style="padding:10px; font-size:0.7rem; color:var(--brand-gold); text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">Номенклатура металлов (из справочника)</td></tr>`;
    
    let hasMetals = false;
    for (let key in WAREHOUSE_CATALOG) {
        if (key.startsWith('metal_')) {
            const qty = window.dbWarehouseInv[key] || 0;
            if (qty > 0) {
                html += renderInventoryRow(key, WAREHOUSE_CATALOG[key], qty);
                hasMetals = true;
            }
        }
    }
    
    const otherMetalQty = window.dbWarehouseInv['metal'] || 0;
    if (otherMetalQty > 0) {
        html += renderInventoryRow('metal', WAREHOUSE_CATALOG['metal'], otherMetalQty);
        hasMetals = true;
    }

    if (!hasMetals) {
        html += `<tr><td colspan="3" style="text-align:center; opacity:0.5; font-size:0.8rem; padding:20px;">Нет остатков металла</td></tr>`;
    }

    tbody.innerHTML = html;
}

function renderInventoryRow(key, item, qty) {
    let qtyStr = window.formatWhNumber(qty, item.unit === 'шт' ? 0 : 2);
    return `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid ${item.icon} text-muted" style="width:20px; text-align:center;"></i>
                    <strong style="color:var(--text-primary); font-size:0.85rem;">${item.name}</strong>
                </div>
            </td>
            <td style="color:var(--text-muted); font-size:0.8rem;">${item.unit}</td>
            <td style="text-align: right; display:flex; justify-content:flex-end; align-items:center; gap:10px;">
                <span style="font-family:'JetBrains Mono', monospace; font-size:1rem; color:${qty > 0 ? 'var(--emerald-neon)' : 'var(--text-muted)'}; font-weight:800;">
                    ${qtyStr}
                </span>
                <button class="btn btn-secondary btn-sm" onclick="window.manualEditStock('${key}')" style="padding: 2px 6px; font-size:0.7rem;" title="Изменить остаток">
                    <i class="fa-solid fa-pencil"></i>
                </button>
            </td>
        </tr>
    `;
}

function renderMetrics() {
    const container = document.getElementById('warehouse-metrics');
    if (!container) return;
    
    let totalMetalWeight = 0;
    let totalValue = 0;

    for (let key in window.dbWarehouseInv) {
        if (key === 'metal' || key.startsWith('metal_')) {
            const qty = window.parseRusFloat(window.dbWarehouseInv[key]);
            totalMetalWeight += qty;

            if (key.startsWith('metal_')) {
                const id = key.replace('metal_', '');
                const metal = window.dbDirectories.find(d => String(d.id) === id);
                if (metal && metal.price) {
                    const pricePerTon = parseFloat(metal.price.replace(/[^\d,]/g, '').replace(',', '.'));
                    if (!isNaN(pricePerTon)) {
                        totalValue += (qty * (pricePerTon / 1000));
                    }
                }
            }
        }
    }

    const blanks = parseInt(window.dbWarehouseInv.blank || 0);
    const basicRods = parseInt(window.dbWarehouseInv.straight || 0) + parseInt(window.dbWarehouseInv.double || 0);
    const specRods = parseInt(window.dbWarehouseInv.bent || 0) + parseInt(window.dbWarehouseInv.rubberized || 0) + parseInt(window.dbWarehouseInv.hedge || 0) + parseInt(window.dbWarehouseInv.bent_rubberized || 0);

    container.innerHTML = `
        <div class="metric-tile">
            <div class="metric-tile-label"><i class="fa-solid fa-weight-hanging"></i> Вес металла (всего)</div>
            <div class="metric-tile-value" style="color:var(--brand-gold);">${window.formatWhNumber(totalMetalWeight, 1)} кг</div>
            <div style="font-size:0.65rem; color:var(--text-muted); margin-top:5px;">Оценка: ${window.formatWhNumber(totalValue, 0)} руб.</div>
        </div>
        <div class="metric-tile">
            <div class="metric-tile-label"><i class="fa-solid fa-microchip"></i> Заготовки</div>
            <div class="metric-tile-value">${window.formatWhNumber(blanks, 0)} шт</div>
        </div>
        <div class="metric-tile">
            <div class="metric-tile-label"><i class="fa-solid fa-layer-group"></i> Базовые прутки</div>
            <div class="metric-tile-value">${window.formatWhNumber(basicRods, 0)} шт</div>
        </div>
        <div class="metric-tile">
            <div class="metric-tile-label"><i class="fa-solid fa-vial-circle-check"></i> Спец-изделия</div>
            <div class="metric-tile-value">${window.formatWhNumber(specRods, 0)} шт</div>
        </div>
    `;
}

function renderLog() {
    const container = document.getElementById('warehouse-log');
    if (!container) return;

    if (window.dbWarehouseLog.length === 0) {
        container.innerHTML = '<div style="opacity:0.5; padding:20px; text-align:center;">Нет записей операций</div>';
        return;
    }

    let html = '';
    const logs = window.dbWarehouseLog.slice().reverse().slice(0, 50);

    logs.forEach(log => {
        html += `
            <div class="activity-item" style="display:flex; gap:15px; align-items:flex-start;">
                <div style="background:rgba(255,255,255,0.05); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--brand-red);">
                    <i class="fa-solid fa-exchange-alt"></i>
                </div>
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color:#fff;">${log.type}</strong>
                        <span style="font-size:0.7rem; color:var(--text-muted);">${log.date}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:5px;">
                        ${log.details}
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                        ${log.comment ? `<div style="font-size:0.75rem; color:var(--emerald-neon); background:rgba(0,255,157,0.05); padding:4px 8px; border-radius:4px;">${log.comment}</div>` : '<div></div>'}
                        ${log.changes ? `<button class="btn btn-danger btn-sm" style="padding:2px 8px; font-size:0.7rem;" onclick="window.deleteOperation(${log.id})" title="Отменить операцию"><i class="fa-solid fa-undo"></i> Отменить</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

window.manualEditStock = (key) => {
    const item = WAREHOUSE_CATALOG[key];
    const current = window.dbWarehouseInv[key] || 0;
    const newVal = prompt(`Изменение остатка: ${item.name} (${item.unit})\nТекущий остаток: ${current}\nВведите новый остаток:`, current);
    if (newVal !== null) {
        const val = window.parseRusFloat(newVal);
        if (!isNaN(val) && val >= 0) {
            window.dbWarehouseInv[key] = val;
            window.dbWarehouseLog.push({
                id: Date.now(),
                date: new Date().toLocaleString(),
                type: 'Ручная корректировка',
                details: `Изменен остаток: ${item.name}. Было: ${current}, Стало: ${val} ${item.unit}`,
                comment: 'Корректировка администратора',
                user: (window.currentUser && window.currentUser.name) ? window.currentUser.name : 'Система'
            });
            window.saveWarehouseData();
            window.refreshWarehouseData();
            if(window.showToast) window.showToast('Остаток обновлен', 'success');
        }
    }
};

window.deleteOperation = (id) => {
    if (!confirm('Вы уверены, что хотите отменить эту операцию? Это вернет остатки на складе к состоянию до этой операции.')) return;
    const opIndex = window.dbWarehouseLog.findIndex(o => o.id === id);
    if (opIndex === -1) return;
    const op = window.dbWarehouseLog[opIndex];
    if (op.changes) {
        if (op.changes.source) window.dbWarehouseInv[op.changes.source.item] = (window.dbWarehouseInv[op.changes.source.item] || 0) + Math.abs(op.changes.source.qty);
        if (op.changes.target) window.dbWarehouseInv[op.changes.target.item] = (window.dbWarehouseInv[op.changes.target.item] || 0) - Math.abs(op.changes.target.qty);
    }
    window.dbWarehouseLog.splice(opIndex, 1);
    window.saveWarehouseData();
    window.refreshWarehouseData();
    if(window.showToast) window.showToast('Операция отменена', 'info');
};

window.showNewOperationModal = (prefillType) => {
    document.getElementById('op-qty').value = '';
    document.getElementById('op-source-qty').value = '';
    document.getElementById('op-comment').value = '';
    document.getElementById('op-supplier').value = '';
    document.getElementById('op-destination').value = '';
    document.getElementById('op-unit-price').value = '';
    document.getElementById('op-delivery-cost').value = '';
    document.getElementById('op-sum-no-vat').value = '';
    document.getElementById('op-sum-vat').value = '';
    document.getElementById('op-total-cost').value = '0.00 руб';
    
    // Новые поля для точной автоматики
    if (document.getElementById('op-bars-count')) document.getElementById('op-bars-count').value = '';
    if (document.getElementById('op-bar-len')) document.getElementById('op-bar-len').value = '';
    if (document.getElementById('op-diameter')) document.getElementById('op-diameter').value = '';
    if (document.getElementById('op-steel-type')) document.getElementById('op-steel-type').value = '';
    if (document.getElementById('op-weight-per-m')) document.getElementById('op-weight-per-m').value = '';
    if (document.getElementById('op-invoice-num')) document.getElementById('op-invoice-num').value = '';

    document.getElementById('op-belt-rolls').value = '';
    document.getElementById('op-belt-weight').value = '';
    document.getElementById('op-belt-diameter').value = '';
    document.getElementById('op-belt-width').value = '';
    document.getElementById('op-belt-length').value = '';

    if (prefillType) {
        const typeSelect = document.getElementById('op-type');
        if (typeSelect) typeSelect.value = prefillType;
    }

    // Заполнение списков-подсказок (datalists)
    const suppliers = window.dbDirectories.filter(d => d.category === 'dealers').map(d => d.name);
    const suppliersList = document.getElementById('op-suppliers-list');
    if (suppliersList) suppliersList.innerHTML = suppliers.map(s => `<option value="${s}">`).join('');

    const steelTypesList = document.getElementById('op-steel-types-list');
    if (steelTypesList) steelTypesList.innerHTML = (window.steelTypes || []).map(s => `<option value="${s}">`).join('');

    window.populateMetalSelect();
    document.getElementById('modal-new-operation').classList.add('active');
    window.updateOperationForm();
};

window.populateMetalSelect = () => {
    const sel = document.getElementById('op-metal-select');
    const calcSel = document.getElementById('calc-metal-select');
    if (!window.dbDirectories) return;
    const metals = window.dbDirectories.filter(d => d.category === 'metal');
    const opts = '<option value="">-- Выберите металл из справочника --</option>' + 
        metals.map(m => `<option value="${m.id}">${m.name} (Ø${m.diameter}мм, ${m.steel_type})</option>`).join('');
    if (sel) { sel.innerHTML = opts; sel.value = ''; }
    if (calcSel) { calcSel.innerHTML = opts; calcSel.value = ''; }
};

window.toggleBlankCalc = () => {
    const isChecked = document.getElementById('blank-calc-toggle').checked;
    const fields = document.getElementById('blank-calc-fields');
    if (fields) fields.style.display = isChecked ? 'block' : 'none';
    
    const qtyInput = document.getElementById('op-qty');
    const sourceQtyInput = document.getElementById('op-source-qty');
    if (isChecked) {
        if (qtyInput) { qtyInput.readOnly = true; qtyInput.placeholder = "Авторасчет..."; }
        window.doBlankCalc();
    } else {
        if (qtyInput) { qtyInput.readOnly = false; qtyInput.placeholder = "Например: 3135..."; }
        if (sourceQtyInput) sourceQtyInput.readOnly = false;
        document.getElementById('calc-blank-result').innerHTML = 'Авторасчет выключен.';
    }
};

window.doBlankCalc = () => {
    const isChecked = document.getElementById('blank-calc-toggle').checked;
    if (!isChecked) return;
    
    const metalId = document.getElementById('calc-metal-select').value;
    const lenStr = document.getElementById('calc-blank-len').value;
    const sourceQtyStr = document.getElementById('op-source-qty').value;
    const resultDiv = document.getElementById('calc-blank-result');
    const qtyInput = document.getElementById('op-qty');
    
    const metal = window.dbDirectories.find(d => String(d.id) === metalId);
    const len = window.parseRusFloat(lenStr);
    const consumedKg = window.parseRusFloat(sourceQtyStr);
    
    if (!metal) {
        resultDiv.innerHTML = 'Выберите металл для получения веса погонного метра.';
        if (qtyInput) qtyInput.value = '';
        return;
    }
    if (len <= 0) {
        resultDiv.innerHTML = 'Укажите длину заготовки (> 0 мм).';
        if (qtyInput) qtyInput.value = '';
        return;
    }
    if (consumedKg <= 0) {
        resultDiv.innerHTML = 'Укажите расход металла (кг) в нижнем блоке.';
        if (qtyInput) qtyInput.value = '';
        return;
    }
    
    const weightPerM = window.parseRusFloat(metal.weight_per_m);
    if (weightPerM <= 0) {
        resultDiv.innerHTML = 'В справочнике для данного металла не указан вес 1 м.п.';
        return;
    }
    
    const blankWeight = weightPerM * (len / 1000);
    const blanksCount = Math.floor(consumedKg / blankWeight);
    
    resultDiv.innerHTML = `Вес 1 заготовки: <strong>${blankWeight.toFixed(3)} кг</strong>. Расчетный выход: <strong>${blanksCount} шт</strong>`;
    
    if (qtyInput) {
        qtyInput.value = blanksCount;
    }
    window.updateLiveSummary();
};

window.onMetalSelectChange = () => {
    const sel = document.getElementById('op-metal-select');
    if (!sel || !sel.value) return;
    const metal = window.dbDirectories.find(d => String(d.id) === sel.value);
    if (metal) {
        const sup = document.getElementById('op-supplier');
        if (sup && !sup.value) sup.value = metal.supplier || '';
        
        const inv = document.getElementById('op-invoice-num');
        if (inv && !inv.value) inv.value = metal.invoice_num || '';
        
        const vat = document.getElementById('op-vat-rate');
        if (vat && (!vat.value || vat.value === '1.2' || vat.value === '1.22')) vat.value = metal.vat_rate || '1.22';
        if (document.getElementById('op-diameter')) document.getElementById('op-diameter').value = metal.diameter || '';
        if (document.getElementById('op-steel-type')) document.getElementById('op-steel-type').value = metal.steel_type || '';
        if (document.getElementById('op-weight-per-m')) document.getElementById('op-weight-per-m').value = metal.weight_per_m || '';
        
        // Автоматика: подгружаем кол-во и длину из справочника
        if (document.getElementById('op-bars-count')) document.getElementById('op-bars-count').value = metal.bars_count || '';
        if (document.getElementById('op-bar-len')) document.getElementById('op-bar-len').value = metal.length || '';

        let pStr = metal.price || '';
        let numTonne = window.parseRusFloat(pStr);
        if (numTonne > 0) {
            if (document.getElementById('op-price-tonne')) document.getElementById('op-price-tonne').value = numTonne.toFixed(2);
            if (document.getElementById('op-unit-price')) document.getElementById('op-unit-price').value = (numTonne / 1000).toFixed(2);
        }
        window.onMetalManualCalc();
    }
};

window.onMetalManualCalc = () => {
    const barsCount = window.parseRusFloat(document.getElementById('op-bars-count')?.value || '0');
    const barLen = window.parseRusFloat(document.getElementById('op-bar-len')?.value || '0');
    const weightPerM = window.parseRusFloat(document.getElementById('op-weight-per-m')?.value || '0');
    const diam = window.parseRusFloat(document.getElementById('op-diameter')?.value || '0');
    
    let wpm = weightPerM;
    if (diam > 0 && wpm === 0) {
        wpm = diam * diam * 0.00616;
        if (document.getElementById('op-weight-per-m')) document.getElementById('op-weight-per-m').value = window.formatWhNumber(wpm, 3);
    }

    if (barsCount > 0 && barLen > 0 && wpm > 0) {
        const totalWeightKg = (barsCount * (barLen / 1000) * wpm);
        const qtyInput = document.getElementById('op-qty');
        if (qtyInput) {
            qtyInput.value = window.formatWhNumber(totalWeightKg, 2);
            window.onOperationFinancialCalc('qty');
        }
    }
};

window.onOperationFinancialCalc = (trigger) => {
    const type = document.getElementById('op-type').value;
    const Q = window.parseRusFloat(document.getElementById('op-vat-rate')?.value || '1.22');
    const delTotal = window.parseRusFloat(document.getElementById('op-delivery-cost').value);

    let G = window.parseRusFloat(type === 'in_belt' ? document.getElementById('op-belt-weight').value : (document.getElementById('op-qty') ? document.getElementById('op-qty').value : '0'));
    
    // Синхронизация Вес КГ <-> Вес Тонны
    if (trigger === 'qty_tonne') {
        const GT = window.parseRusFloat(document.getElementById('op-qty-tonne').value);
        G = GT * 1000;
        document.getElementById('op-qty').value = G.toFixed(2);
    } else if (trigger === 'qty') {
        if (document.getElementById('op-qty-tonne')) document.getElementById('op-qty-tonne').value = (G / 1000).toFixed(3);
    } else {
        // При других триггерах просто убеждаемся что тонны актуальны
        if (document.getElementById('op-qty-tonne')) document.getElementById('op-qty-tonne').value = (G / 1000).toFixed(3);
    }

    let priceKg = window.parseRusFloat(document.getElementById('op-unit-price').value);
    let priceTonne = window.parseRusFloat(document.getElementById('op-price-tonne')?.value || '0');
    let sumNoVat = window.parseRusFloat(document.getElementById('op-sum-no-vat').value);

    if (trigger === 'price_tonne') {
        priceKg = priceTonne / 1000;
        document.getElementById('op-unit-price').value = priceKg.toFixed(2);
        sumNoVat = G * priceKg;
    } else if (trigger === 'price') {
        priceTonne = priceKg * 1000;
        if (document.getElementById('op-price-tonne')) document.getElementById('op-price-tonne').value = priceTonne.toFixed(2);
        sumNoVat = G * priceKg;
    } else if (trigger === 'sum_no_vat') {
        if (G > 0) {
            priceKg = sumNoVat / G;
            priceTonne = priceKg * 1000;
            document.getElementById('op-unit-price').value = priceKg.toFixed(2);
            if (document.getElementById('op-price-tonne')) document.getElementById('op-price-tonne').value = priceTonne.toFixed(2);
        }
    } else if (trigger === 'sum_vat') {
        const sumVat = window.parseRusFloat(document.getElementById('op-sum-vat').value);
        if (Q > 0) {
            sumNoVat = sumVat / Q;
            document.getElementById('op-sum-no-vat').value = sumNoVat.toFixed(2);
            if (G > 0) {
                priceKg = sumNoVat / G;
                priceTonne = priceKg * 1000;
                document.getElementById('op-unit-price').value = priceKg.toFixed(2);
                if (document.getElementById('op-price-tonne')) document.getElementById('op-price-tonne').value = priceTonne.toFixed(2);
            }
        }
    } else {
        sumNoVat = G * priceKg;
    }

    // Синхронизация полей (с использованием запятых для красоты, но parseRusFloat их поймет)
    const setFmt = (id, val, dec = 2) => {
        const el = document.getElementById(id);
        if (el && trigger !== id.replace('op-', '')) {
            el.value = window.formatWhNumber(val, dec);
        }
    };

    setFmt('op-sum-no-vat', sumNoVat);
    setFmt('op-sum-vat', sumNoVat * Q);
    setFmt('op-unit-price', priceKg);
    setFmt('op-price-tonne', priceKg * 1000);
    setFmt('op-qty', G);
    setFmt('op-qty-tonne', G / 1000, 3);

    // Детализация стоимости погонного метра
    const summaryDetailed = document.getElementById('financial-summary-detailed');
    if (type === 'in_metal' && G > 0) {
        if (summaryDetailed) summaryDetailed.style.display = 'block';
        const weightPerM = window.parseRusFloat(document.getElementById('op-weight-per-m').value);
        
        const priceMNoVat = priceKg * weightPerM;
        const priceMVat = priceMNoVat * Q;
        const delMNoVat = (delTotal / G) * weightPerM;
        const delMVat = delMNoVat * Q;
        const totalMNoVat = priceMNoVat + delMNoVat;
        const totalMVat = totalMNoVat * Q;
        
        if (document.getElementById('res-m-price-no-vat')) document.getElementById('res-m-price-no-vat').innerText = window.formatRusCurrency(priceMNoVat);
        if (document.getElementById('res-m-price-vat')) document.getElementById('res-m-price-vat').innerText = window.formatRusCurrency(priceMVat);
        if (document.getElementById('res-m-del-no-vat')) document.getElementById('res-m-del-no-vat').innerText = window.formatRusCurrency(delMNoVat);
        if (document.getElementById('res-m-del-vat')) document.getElementById('res-m-del-vat').innerText = window.formatRusCurrency(delMVat);
        if (document.getElementById('res-m-total-no-vat')) document.getElementById('res-m-total-no-vat').innerText = window.formatRusCurrency(totalMNoVat);
        if (document.getElementById('res-m-total-vat')) document.getElementById('res-m-total-vat').innerText = window.formatRusCurrency(totalMVat);
        
        document.getElementById('op-total-cost').value = `${window.formatWhNumber(totalMVat)} руб/м.п (Себест. с НДС)`;
    } else {
        if (summaryDetailed) summaryDetailed.style.display = 'none';
        if (G > 0) {
            const perUnitCost = (sumNoVat + delTotal) * Q / G;
            const unit = OPERATIONS_CONFIG[type].target ? WAREHOUSE_CATALOG[OPERATIONS_CONFIG[type].target].unit : 'ед';
            document.getElementById('op-total-cost').value = `${window.formatWhNumber(perUnitCost)} руб/${unit}`;
        } else {
            document.getElementById('op-total-cost').value = '0.00 руб';
        }
    }

    window.updateLiveSummary();
};

window.closeOperationModal = () => {
    document.getElementById('modal-new-operation').classList.remove('active');
};

window.updateOperationForm = () => {
    const type = document.getElementById('op-type').value;
    const config = OPERATIONS_CONFIG[type];
    
    const sourceGroup = document.getElementById('op-source-group');
    const sourceLabel = document.getElementById('op-source-label');
    const targetLabel = document.getElementById('op-target-label');

    const targetItem = config.isWriteoff ? document.getElementById('op-writeoff-item').value : config.target;
    if (targetItem && targetItem !== 'metal') {
        let currentAv = window.parseRusFloat(window.dbWarehouseInv[targetItem] || 0);
        if (WAREHOUSE_CATALOG[targetItem].unit === 'шт') currentAv = parseInt(currentAv);
        targetLabel.innerHTML = `${WAREHOUSE_CATALOG[targetItem].name} <span style="font-size:0.75rem; color:var(--brand-gold);">[Остаток: ${currentAv} ${WAREHOUSE_CATALOG[targetItem].unit}]</span>`;
    } else {
        targetLabel.innerHTML = `Металл`;
    }

    const sourceSelectWrapper = document.getElementById('op-source-select-wrapper');
    const sourceItemSelect = document.getElementById('op-source-item-select');

    if (config.source) {
        sourceGroup.style.display = 'block';
        if (config.source === 'metal') {
            sourceSelectWrapper.style.display = 'block';
            let metalOpts = '<option value="metal">-- Выберите металл --</option>';
            for (let key in WAREHOUSE_CATALOG) {
                if (key.startsWith('metal_')) {
                    const av = window.parseRusFloat(window.dbWarehouseInv[key] || 0);
                    metalOpts += `<option value="${key}">${WAREHOUSE_CATALOG[key].name} (Остаток: ${av} кг)</option>`;
                }
            }
            const oldAv = window.parseRusFloat(window.dbWarehouseInv['metal'] || 0);
            if (oldAv > 0) metalOpts += `<option value="metal">Металл (Прочее) (Остаток: ${oldAv} кг)</option>`;
            sourceItemSelect.innerHTML = metalOpts;
            sourceLabel.innerText = 'Металл (кг)';
        } else {
            sourceSelectWrapper.style.display = 'none';
            sourceLabel.innerText = WAREHOUSE_CATALOG[config.source].name + ' (' + WAREHOUSE_CATALOG[config.source].unit + ')';
        }
        window.updateSourceHint();
    } else {
        sourceGroup.style.display = 'none';
    }

    if (document.getElementById('incoming-fields')) document.getElementById('incoming-fields').style.display = config.isIncoming ? 'block' : 'none';
    if (document.getElementById('incoming-metal-fields')) document.getElementById('incoming-metal-fields').style.display = (type === 'in_metal') ? 'block' : 'none';
    if (document.getElementById('writeoff-fields')) document.getElementById('writeoff-fields').style.display = config.isWriteoff ? 'block' : 'none';

    if (document.getElementById('belt-specs-group')) document.getElementById('belt-specs-group').style.display = (type === 'in_belt') ? 'block' : 'none';
    if (document.getElementById('blank-calc-group')) document.getElementById('blank-calc-group').style.display = (type === 'prod_blank') ? 'block' : 'none';
    if (document.getElementById('op-qty-group')) document.getElementById('op-qty-group').style.display = (type === 'in_belt' || config.isWriteoff) ? 'none' : 'block';
    
    if (document.getElementById('op-comment-label')) {
        document.getElementById('op-comment-label').innerText = config.isWriteoff ? "Причина списания / Кто списал" : "Комментарий / Исполнитель";
    }

    if (config.isWriteoff) window.updateWriteoffHint();
    window.updateLiveSummary();
};

window.updateSourceHint = () => {
    const type = document.getElementById('op-type').value;
    const config = OPERATIONS_CONFIG[type];
    if (!config || !config.source) return;
    let sourceItem = (config.source === 'metal' && document.getElementById('op-source-item-select').value) ? document.getElementById('op-source-item-select').value : config.source;
    if (document.getElementById('op-source-hint') && WAREHOUSE_CATALOG[sourceItem]) {
        let av = window.dbWarehouseInv[sourceItem] || 0;
        document.getElementById('op-source-hint').innerText = 'На складе: ' + (WAREHOUSE_CATALOG[sourceItem].unit === 'шт' ? parseInt(av) : parseFloat(av).toFixed(2)) + ' ' + WAREHOUSE_CATALOG[sourceItem].unit;
    }
};

window.updateWriteoffHint = () => {
    const wItem = document.getElementById('op-writeoff-item').value;
    const wHint = document.getElementById('op-writeoff-hint');
    if (!wHint || !wItem) return;
    let av = window.dbWarehouseInv[wItem] || 0;
    wHint.innerText = `Доступно для списания: ${WAREHOUSE_CATALOG[wItem].unit === 'шт' ? parseInt(av) : parseFloat(av).toFixed(2)} ${WAREHOUSE_CATALOG[wItem].unit}`;
    if (document.getElementById('op-target-label')) document.getElementById('op-target-label').innerText = WAREHOUSE_CATALOG[wItem].name;
};


window.updateLiveSummary = () => {
    const type = document.getElementById('op-type').value;
    const config = OPERATIONS_CONFIG[type];
    if (!config) return;
    let qty = window.parseRusFloat(type === 'in_belt' ? document.getElementById('op-belt-weight').value : (document.getElementById('op-qty') ? document.getElementById('op-qty').value : '0'));
    const summaryDiv = document.getElementById('op-live-summary');
    if (!summaryDiv) return;
    if (qty <= 0) { summaryDiv.style.display = 'none'; return; }
    summaryDiv.style.display = 'block';
    const targetItem = config.isWriteoff ? document.getElementById('op-writeoff-item').value : config.target;
    const currentAv = window.parseRusFloat(window.dbWarehouseInv[targetItem] || 0);
    const unit = WAREHOUSE_CATALOG[targetItem].unit;
    const decimals = unit === 'шт' ? 0 : 2;
    let newAv = config.isWriteoff ? currentAv - qty : currentAv + qty;
    let html = `<div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.05em;">Прогноз итога операции:</div>`;
    if (config.isWriteoff) {
        html += `<div style="font-size:1.1rem; margin-bottom:4px;"><strong style="color:var(--brand-red);"><i class="fa-solid fa-arrow-down"></i> Списание: -${window.formatWhNumber(qty, decimals)} ${unit}</strong></div>`;
    } else {
        html += `<div style="font-size:1.1rem; margin-bottom:4px;"><strong style="color:var(--emerald-neon);"><i class="fa-solid fa-arrow-up"></i> Поступление: +${window.formatWhNumber(qty, decimals)} ${unit}</strong></div>`;
    }
    html += `<div style="font-size:0.9rem;">Остаток на складе станет: <strong style="color:#fff;">${window.formatWhNumber(newAv, decimals)} ${unit}</strong></div>`;
    if (config.isIncoming) {
        const total = (qty * window.parseRusFloat(document.getElementById('op-unit-price').value)) + window.parseRusFloat(document.getElementById('op-delivery-cost').value);
        if (total > 0) html += `<div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1); color:var(--brand-gold); font-size:1rem;">Общая стоимость поступления: <strong>${window.formatWhNumber(total)} руб</strong></div>`;
    }
    summaryDiv.innerHTML = html;
};

window.saveOperation = () => {
    const type = document.getElementById('op-type').value;
    const config = OPERATIONS_CONFIG[type];
    let qtyStr = (type === 'in_belt' ? document.getElementById('op-belt-weight').value : document.getElementById('op-qty').value);
    const sourceQtyStr = document.getElementById('op-source-qty').value;
    const comment = document.getElementById('op-comment').value;
    const supplier = document.getElementById('op-supplier').value;
    const destination = document.getElementById('op-destination').value;
    const deliveryCostStr = document.getElementById('op-delivery-cost').value;
    const priceStr = document.getElementById('op-unit-price').value;
    const selectedMetalId = document.getElementById('op-metal-select')?.value;
    let writeoffItem = config.isWriteoff ? document.getElementById('op-writeoff-item').value : '';
    if (config.isWriteoff) qtyStr = document.getElementById('op-source-qty').value;
    
    if (!qtyStr || parseFloat(qtyStr) <= 0) { window.showToast('Укажите корректное количество!', 'error'); return; }
    let qty = window.parseRusFloat(qtyStr);
    let sourceQty = config.source ? window.parseRusFloat(sourceQtyStr) : 0;
    let actualTarget = (type === 'in_metal' && selectedMetalId) ? `metal_${selectedMetalId}` : config.target;
    let actualSource = (config.source === 'metal' && document.getElementById('op-source-item-select').value) ? document.getElementById('op-source-item-select').value : config.source;

    if (actualSource || config.isWriteoff) {
        const itemToCheck = config.isWriteoff ? writeoffItem : actualSource;
        let qtyToCheck = config.isWriteoff ? qty : sourceQty;
        if (qtyToCheck > window.parseRusFloat(window.dbWarehouseInv[itemToCheck] || 0)) {
            window.showToast('Недостаточно на складе (' + (WAREHOUSE_CATALOG[itemToCheck]?.name || itemToCheck) + ')', 'error');
            return;
        }
    }

    const opChanges = { target: { item: actualTarget, qty: qty } };
    if (config.isWriteoff) {
        window.dbWarehouseInv[writeoffItem] = (window.dbWarehouseInv[writeoffItem] || 0) - qty;
        opChanges.target = { item: writeoffItem, qty: -qty };
    } else {
        if (actualSource) {
            window.dbWarehouseInv[actualSource] = (window.dbWarehouseInv[actualSource] || 0) - sourceQty;
            opChanges.source = { item: actualSource, qty: -sourceQty };
        }
        window.dbWarehouseInv[actualTarget] = (window.dbWarehouseInv[actualTarget] || 0) + qty;
        
        if (type === 'in_metal' && selectedMetalId) {
            const metal = window.dbDirectories.find(d => String(d.id) === selectedMetalId);
            if (metal) {
                metal.weight = window.formatWhNumber(qty / 1000, 3);
                metal.price = window.formatRusCurrency(window.parseRusFloat(priceStr) * 1000);
                metal.delivery_m_no_vat = window.formatRusNumber((window.parseRusFloat(deliveryCostStr) / qty) * window.parseRusFloat(document.getElementById('op-weight-per-m').value), 2);
                metal.vat_rate = document.getElementById('op-vat-rate').value;
                metal.invoice_num = document.getElementById('op-invoice-num').value;
                metal.steel_type = document.getElementById('op-steel-type').value;
                metal.supplier = supplier;
                metal.delivery_date = new Date().toLocaleDateString();
                if (window.autoCalculateMetalData) window.autoCalculateMetalData(metal);
                window.saveAllToLocal();
            }
        }
    }

    let details = config.isWriteoff ? `<span class="brand-red">Списание: -${window.formatWhNumber(qty, qty % 1 === 0 ? 0 : 2)} ${WAREHOUSE_CATALOG[writeoffItem].unit} (${WAREHOUSE_CATALOG[writeoffItem].name})</span>` : `Приход: +${window.formatWhNumber(qty, qty % 1 === 0 ? 0 : 2)} ${WAREHOUSE_CATALOG[actualTarget].unit} (${WAREHOUSE_CATALOG[actualTarget].name})`;
    if (!config.isWriteoff && actualSource) details += ` | Расход: -${window.formatWhNumber(sourceQty, sourceQty % 1 === 0 ? 0 : 2)} ${WAREHOUSE_CATALOG[actualSource].unit} (${WAREHOUSE_CATALOG[actualSource].name})`;
    
    window.dbWarehouseLog.push({
        id: Date.now(),
        date: new Date().toLocaleString(),
        type: config.type,
        details: details,
        comment: comment,
        changes: opChanges,
        user: (window.currentUser && window.currentUser.name) ? window.currentUser.name : 'Система'
    });

    window.saveWarehouseData();
    window.refreshWarehouseData();
    window.closeOperationModal();
    window.showToast('Операция успешно проведена', 'success');
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('warehouse.html')) {
        window.initWarehouse();
        window.renderInventory();
        window.renderMetrics();
        window.renderLog();
    }
});
