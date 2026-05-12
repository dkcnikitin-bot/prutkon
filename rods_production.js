/* rods_production.js - ПРУТКОН Engineering Workflow (v16) */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initData();
    renderRegistry();
});

const RODS_STORAGE_KEY = 'prutkon_rods_registry';
const RODS_KEYS = ['rods_metal', 'rods_blanks', 'rods_standard', 'rods_bent', 'rods_rubber', 'rods_double'];

window.formatCurr = window.formatCurr || window.formatRusCurrency || window.formatCurrency || ((v) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(v || 0));


function getEmptyRodsStore() {
    return {
        rods_metal: [],
        rods_blanks: [],
        rods_standard: [],
        rods_bent: [],
        rods_rubber: [],
        rods_double: []
    };
}

function persistRodsStore() {
    const payload = {};
    RODS_KEYS.forEach(key => {
        payload[key] = Array.isArray(window.db[key]) ? window.db[key] : [];
    });
    localStorage.setItem(RODS_STORAGE_KEY, JSON.stringify(payload));
    if (window.fbPush) window.fbPush(RODS_STORAGE_KEY, payload);
}

function notify(message, type = 'info') {
    if (window.showToast) {
        window.showToast(message, type);
        return;
    }
    alert(message);
}

// Initialization of DB parts if they don't exist
function initData() {
    if (!window.db) window.db = {};

    const stored = window.safeParse ? window.safeParse(RODS_STORAGE_KEY, getEmptyRodsStore()) : getEmptyRodsStore();
    RODS_KEYS.forEach(key => {
        const existing = window.db[key];
        if (Array.isArray(existing) && existing.length) return;
        window.db[key] = Array.isArray(stored[key]) ? stored[key] : [];
    });

    updateDropdowns();
}

function initTabs() {
    const tabs = document.querySelectorAll('#rods-tabs button');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            
            const step = btn.getAttribute('data-step');
            document.querySelectorAll('.step-container').forEach(c => c.classList.remove('active'));
            document.getElementById(`step-${step}`).classList.add('active');
            
            updateDropdowns(); // Refresh lists when entering a step
        });
    });
}

// STEP 1: METAL CALC
window.calcStep1Price = function(trigger) {
    const vatRate = parseFloat(document.getElementById('m-vat-rate').value) || 1.2;
    if (trigger === 'vat') {
        const withVat = parseFloat(document.getElementById('m-price-ton-vat').value) || 0;
        document.getElementById('m-price-ton-no-vat').value = (withVat / vatRate).toFixed(2);
    } else if (trigger === 'no-vat') {
        const noVat = parseFloat(document.getElementById('m-price-ton-no-vat').value) || 0;
        document.getElementById('m-price-ton-vat').value = (noVat * vatRate).toFixed(2);
    }
    calcStep1();
}

function calcStep1() {
    const batchKg = parseFloat(document.getElementById('m-batch-kg').value) || 0;
    const delivery = parseFloat(document.getElementById('m-delivery-cost').value) || 0;
    const priceTonNoVat = parseFloat(document.getElementById('m-price-ton-no-vat').value) || 0;
    const priceKg = priceTonNoVat / 1000;
    const vatRate = parseFloat(document.getElementById('m-vat-rate').value) || 1.2;
    if (priceTonNoVat > 0 && document.activeElement.id !== 'm-price-ton-vat') {
        document.getElementById('m-price-ton-vat').value = (priceTonNoVat * vatRate).toFixed(2);
    }
    let weightM = parseFloat(document.getElementById('m-weight-m').value) || 0;
    const dia = parseFloat(document.getElementById('m-dia').value) || 0;

    if (dia > 0 && weightM === 0) {
        weightM = dia * dia * 0.00616;
        document.getElementById('m-weight-m').value = weightM.toFixed(3);
    }

    const delKg = batchKg > 0 ? delivery / batchKg : 0;
    const delM = weightM * delKg;
    const totalM = (weightM * priceKg) + delM;

    document.getElementById('m-res-del-kg').innerText = window.formatCurr(delKg);
    document.getElementById('m-res-del-m').innerText = window.formatCurr(delM);
    document.getElementById('m-res-total-m').innerText = window.formatCurr(totalM);
    return totalM;
}

// STEP 2: BLANK CALC
function calcStep2() {
    const metalId = document.getElementById('b-metal-select').value;
    const metal = window.db.rods_metal[metalId];
    if (!metal) {
        document.getElementById('b-res-metal-cost').innerText = window.formatCurr(0);
        document.getElementById('b-res-total').innerText = window.formatCurr(0);
        if (document.getElementById('b-article')) document.getElementById('b-article').value = '';
        return 0;
    }

    const length = parseFloat(document.getElementById('b-length').value) || 0;
    const labor = parseFloat(document.getElementById('b-labor').value) || 0;
    const rodLength = parseFloat(document.getElementById('b-rod-length').value) || 6000;
    const gap = parseFloat(document.getElementById('b-gap').value) || 10;

    if (document.getElementById('b-article') && length > 0) {
        document.getElementById('b-article').value = `${metal.dia} mm ${length}`;
    }

    let qtyInRod = 0;
    let remainder = 0;
    let wastePercent = 0;
    
    if (length > 0 && rodLength > 0) {
        qtyInRod = Math.floor((rodLength + gap) / (length + gap));
        remainder = rodLength - (qtyInRod * length + Math.max(0, qtyInRod - 1) * gap);
        wastePercent = (remainder / rodLength) * 100;
        
        document.getElementById('b-res-qty').innerText = `${qtyInRod} шт`;
        document.getElementById('b-res-remainder').innerText = `${remainder.toFixed(0)} мм`;
        document.getElementById('b-res-waste').innerText = `${wastePercent.toFixed(1)} %`;
        
        if (wastePercent > 10) {
            document.getElementById('b-waste-container').style.color = 'var(--brand-red)';
            document.getElementById('b-res-waste').style.color = 'var(--brand-red)';
        } else {
            document.getElementById('b-waste-container').style.color = 'var(--text-muted)';
            document.getElementById('b-res-waste').style.color = '#fff';
        }
    } else {
        document.getElementById('b-res-qty').innerText = `0 шт`;
        document.getElementById('b-res-remainder').innerText = `0 мм`;
        document.getElementById('b-res-waste').innerText = `0 %`;
        document.getElementById('b-waste-container').style.color = 'var(--text-muted)';
        document.getElementById('b-res-waste').style.color = '#fff';
    }

    let metalCost = 0;
    if (qtyInRod > 0) {
        const rodCost = (metal.pricePerM * rodLength) / 1000;
        metalCost = rodCost / qtyInRod;
    }

    const total = metalCost + labor;

    document.getElementById('b-res-metal-cost').innerText = window.formatCurr(metalCost);
    document.getElementById('b-res-total').innerText = window.formatCurr(total);
    return total;
}

// STEP 3: STANDARD ROD CALC
function calcStep3() {
    const blankId = document.getElementById('r-blank-select').value;
    const blank = window.db.rods_blanks[blankId];
    const labor = parseFloat(document.getElementById('r-labor').value) || 0;

    const blankCost = blank ? blank.price : 0;
    const total = blankCost + labor;

    document.getElementById('r-res-blank-cost').innerText = window.formatCurr(blankCost);
    document.getElementById('r-res-total').innerText = window.formatCurr(total);
    return total;
}

// STEP 4: BENT ROD CALC
function calcStep4() {
    const rodId = document.getElementById('bent-rod-select').value;
    const rod = window.db.rods_standard[rodId];
    const labor = parseFloat(document.getElementById('bent-labor').value) || 0;

    const baseCost = rod ? rod.price : 0;
    const total = baseCost + labor;

    document.getElementById('bent-res-base').innerText = window.formatCurr(baseCost);
    document.getElementById('bent-res-total').innerText = window.formatCurr(total);
    return total;
}

// STEP 5: RUBBERIZED ROD CALC
function calcStep5() {
    const rodId = document.getElementById('rub-rod-select').value;
    const allRods = [...window.db.rods_standard, ...window.db.rods_bent];
    const rod = allRods[rodId];

    const labor = parseFloat(document.getElementById('rub-labor').value) || 0;
    const baseCost = rod ? rod.price : 0;
    const total = baseCost + labor;

    document.getElementById('rub-res-base').innerText = window.formatCurr(baseCost);
    document.getElementById('rub-res-total').innerText = window.formatCurr(total);
    return total;
}

// STEP 6: DOUBLE ROD CALC
function calcStep6() {
    const blankId = document.getElementById('d-blank-select').value;
    const blank = window.db.rods_blanks[blankId];
    const clampPrice = parseFloat(document.getElementById('d-clamp-price').value) * 2 || 0;
    const centerPrice = parseFloat(document.getElementById('d-center-clamp-price').value) || 0;
    const labor = parseFloat(document.getElementById('d-labor').value) || 0;

    const blankCost = blank ? blank.price * 2 : 0;
    const total = blankCost + clampPrice + centerPrice + labor;

    document.getElementById('d-res-blanks').innerText = window.formatCurr(blankCost);
    document.getElementById('d-res-clamps').innerText = window.formatCurr(clampPrice + centerPrice);
    document.getElementById('d-res-total').innerText = window.formatCurr(total);
}

// DROPDOWN UPDATERS
window.populateDirectoryEnums = function() {
    const metals = window.dbDirectories ? window.dbDirectories.filter(d => d.category === 'metal') : [];
    
    const dias = [...new Set(metals.map(m => window.parseRusFloat(m.diameter)).filter(v=>v>0))].sort((a,b)=>a-b);
    const mDia = document.getElementById('m-dia');
    if (mDia && !mDia.dataset.populated) {
        mDia.innerHTML = '<option value="">-- Выберите --</option>' + dias.map(d => `<option value="${d}">${d} мм</option>`).join('');
        mDia.dataset.populated = 'true';
    }

    const steels = [...new Set(metals.map(m => m.name).filter(Boolean))].sort();
    const mName = document.getElementById('m-name');
    if (mName && !mName.dataset.populated) {
        mName.innerHTML = '<option value="">-- Выберите --</option>' + steels.map(s => `<option value="${s}">${s}</option>`).join('');
        mName.dataset.populated = 'true';
    }
}

window.autoPullMetalData = function() {
    const dia = document.getElementById('m-dia').value;
    const mNameStr = document.getElementById('m-name').value;
    if (!dia && !mNameStr) return;

    const metals = window.dbDirectories ? window.dbDirectories.filter(d => d.category === 'metal') : [];
    
    let found = null;
    if (dia && mNameStr) {
        found = metals.find(m => String(window.parseRusFloat(m.diameter)) === String(dia) && m.name === mNameStr);
    } 
    if (!found && mNameStr) found = metals.find(m => m.name === mNameStr);
    if (!found && dia) found = metals.find(m => String(window.parseRusFloat(m.diameter)) === String(dia));

    if (found) {
        if (found.diameter && document.getElementById('m-dia').value !== String(window.parseRusFloat(found.diameter))) {
            document.getElementById('m-dia').value = window.parseRusFloat(found.diameter);
        }
        if (found.name && document.getElementById('m-name').value !== found.name) {
            document.getElementById('m-name').value = found.name;
        }
        if (found.price) {
            const priceTon = window.parseRusFloat(found.price);
            document.getElementById('m-price-ton-no-vat').value = priceTon.toFixed(2);
        }
        if (found.weight_per_m) {
            document.getElementById('m-weight-m').value = window.parseRusFloat(found.weight_per_m);
        }
        if (found.vat_rate) {
            document.getElementById('m-vat-rate').value = found.vat_rate;
        }
        if (found.delivery_total && found.weight) {
            document.getElementById('m-batch-kg').value = (window.parseRusFloat(found.weight) * 1000).toFixed(0);
            document.getElementById('m-delivery-cost').value = window.parseRusFloat(found.delivery_total);
        }
        
        calcStep1Price('no-vat');
        notify('Данные металла подтянуты из Справочника', 'success');
    }
}

window.updatePricesFromDirectory = function() {
    const metals = window.dbDirectories ? window.dbDirectories.filter(d => d.category === 'metal') : [];
    if (metals.length === 0) return notify('Справочник пуст', 'warning');
    
    let updated = 0;
    
    window.db.rods_metal.forEach(rm => {
        let found = metals.find(m => String(window.parseRusFloat(m.diameter)) === String(rm.dia));
        if (found) {
            if (found.total_price_m_no_vat) {
                rm.pricePerM = window.parseRusFloat(found.total_price_m_no_vat);
            } else {
                const priceKg = window.parseRusFloat(found.price) / 1000;
                const weightM = window.parseRusFloat(found.weight_per_m) || (rm.dia * rm.dia * 0.00616);
                const delM = window.parseRusFloat(found.delivery_m_no_vat) || 0;
                rm.pricePerM = (priceKg * weightM) + delM;
            }
            updated++;
        }
    });

    window.db.rods_blanks.forEach(b => {
        const rm = window.db.rods_metal.find(m => m.dia == b.dia);
        if (rm) {
            const rodLength = 6000; // Standard fallback
            const gap = 10;
            const qtyInRod = Math.floor((rodLength + gap) / (b.length + gap));
            let metalCost = 0;
            if (qtyInRod > 0) {
                const rodCost = (rm.pricePerM * rodLength) / 1000;
                metalCost = rodCost / qtyInRod;
            }
            b.price = metalCost + parseFloat(b.labor || 0);
        }
    });

    // Cascade Update: Step 3 (Standard Rods)
    window.db.rods_standard.forEach(r => {
        let blank;
        if (r.blankId !== undefined && window.db.rods_blanks[r.blankId]) {
            blank = window.db.rods_blanks[r.blankId];
        } else {
            // Reverse-lookup for old records
            blank = window.db.rods_blanks.find(b => b.dia == r.dia && b.length == r.length);
        }
        
        if (blank) {
            let labor = r.labor !== undefined ? r.labor : (r.price - blank.price); // fallback logic
            r.price = blank.price + labor;
        }
    });

    // Cascade Update: Step 4 (Bent Rods)
    window.db.rods_bent.forEach(rb => {
        let base;
        if (rb.baseId !== undefined && window.db.rods_standard[rb.baseId]) {
            base = window.db.rods_standard[rb.baseId];
        } else {
            base = window.db.rods_standard.find(rs => rs.name === rb.name.replace(' (Гнутый)', ''));
        }

        if (base) {
            let labor = rb.labor !== undefined ? rb.labor : (rb.price - base.price);
            rb.price = base.price + labor;
        }
    });

    // Cascade Update: Step 5 (Rubberized Rods)
    window.db.rods_rubber.forEach(rr => {
        let base;
        if (rr.baseId !== undefined) {
            const allRods = [...window.db.rods_standard, ...window.db.rods_bent];
            base = allRods[rr.baseId];
        } else {
            const allRods = [...window.db.rods_standard, ...window.db.rods_bent];
            base = allRods.find(rs => rr.name.includes(rs.name));
        }

        if (base) {
            let labor = rr.labor !== undefined ? rr.labor : (rr.price - base.price);
            rr.price = base.price + labor;
        }
    });

    // Cascade Update: Step 6 (Double Rods)
    window.db.rods_double.forEach(rd => {
        let blank;
        if (rd.blankId !== undefined && window.db.rods_blanks[rd.blankId]) {
            blank = window.db.rods_blanks[rd.blankId];
        } else {
            blank = window.db.rods_blanks.find(b => b.dia == rd.dia && b.length == rd.length);
        }

        if (blank) {
            let labor = rd.labor !== undefined ? rd.labor : 0;
            let clamps = (rd.clampPrice || 0) + (rd.centerClampPrice || 0);
            if (rd.labor === undefined && rd.clampPrice === undefined) {
                // Approximate fallback for old records
                labor = rd.price - (blank.price * 2);
                clamps = 0;
            }
            rd.price = (blank.price * 2) + clamps + labor;
        }
    });

    
    persistRodsStore();
    updateDropdowns();
    renderRegistry();
    notify(`Цены обновлены по ${updated} металлам из Справочника`, 'success');
}

function updateDropdowns() {
    if (window.populateDirectoryEnums) window.populateDirectoryEnums();
    
    // Metal
    const metalSel = document.getElementById('b-metal-select');
    if (metalSel) {
        metalSel.innerHTML = window.db.rods_metal.map((m, i) => `<option value="${i}">${m.name} Ø${m.dia} (${window.formatCurr(m.pricePerM)}/м)</option>`).join('');
    }

    // Blanks for Step 3
    updateBlanksForStep3();
    
    // Rods for Step 4
    const rod4Sel = document.getElementById('bent-rod-select');
    if (rod4Sel) {
        rod4Sel.innerHTML = window.db.rods_standard.map((r, i) => `<option value="${i}">${r.name} (L=${r.length}, Ø${r.dia})</option>`).join('');
    }

    // Rods for Step 5 (Standard + Bent)
    const rod5Sel = document.getElementById('rub-rod-select');
    if (rod5Sel) {
        const combined = [
            ...window.db.rods_standard.map(r => ({...r, type:'Стандарт'})),
            ...window.db.rods_bent.map(r => ({...r, type:'Гнутый'}))
        ];
        rod5Sel.innerHTML = combined.map((r, i) => `<option value="${i}">${r.type}: ${r.name} (L=${r.length})</option>`).join('');
    }

    // Step 6 Dia
    const dia6Sel = document.getElementById('d-dia-select');
    if (dia6Sel) {
        const previousValue = dia6Sel.value;
        const dias = [...new Set(window.db.rods_metal.map(m => m.dia))];
        dia6Sel.innerHTML = dias.map(d => `<option value="${d}">${d} мм</option>`).join('');
        if (dias.map(String).includes(String(previousValue))) {
            dia6Sel.value = previousValue;
        }
        updateBlanksForStep6();
    }
}

function updateBlanksForStep3() {
    const diaSel = document.getElementById('r-dia-select');
    const dias = [...new Set(window.db.rods_metal.map(m => m.dia))];
    if (diaSel) {
        const previousValue = diaSel.value;
        diaSel.innerHTML = dias.map(d => `<option value="${d}">${d} мм</option>`).join('');
        if (dias.map(String).includes(String(previousValue))) {
            diaSel.value = previousValue;
        }
    }

    const currentDia = diaSel ? diaSel.value : null;
    const blankSel = document.getElementById('r-blank-select');
    if (blankSel) {
        const filtered = window.db.rods_blanks
            .map((b, i) => ({...b, originalIdx: i}))
            .filter(b => b.dia == currentDia);
        blankSel.innerHTML = filtered.map(b => `<option value="${b.originalIdx}">Заготовка L=${b.length} (${window.formatCurr(b.price)})</option>`).join('');
    }
}

function updateBlanksForStep6() {
    const dia = document.getElementById('d-dia-select').value;
    const blankSel = document.getElementById('d-blank-select');
    if (blankSel) {
        const filtered = window.db.rods_blanks
            .map((b, i) => ({...b, originalIdx: i}))
            .filter(b => b.dia == dia);
        blankSel.innerHTML = filtered.map(b => `<option value="${b.originalIdx}">Заготовка L=${b.length} (${window.formatCurr(b.price)})</option>`).join('');
    }
}

// SAVE CURRENT STEP DATA
window.saveCurrentStep = function() {
    const activeBtn = document.querySelector('#rods-tabs button.active');
    const step = activeBtn ? activeBtn.getAttribute('data-step') : "1";

    if (step == "1") {
        const name = document.getElementById('m-name').value.trim();
        const dia = document.getElementById('m-dia').value;
        const pricePerM = calcStep1();
        if (!name) return notify('Введите название металла', 'warning');
        window.db.rods_metal.push({ name, dia, pricePerM, ts: Date.now() });
    } 
    else if (step == "2") {
        const metalId = document.getElementById('b-metal-select').value;
        const metal = window.db.rods_metal[metalId];
        const length = document.getElementById('b-length').value;
        const labor = document.getElementById('b-labor').value;
        const price = calcStep2();
        if (!metal) return notify('Сначала добавьте металл на шаге 1', 'warning');
        if (!Number(length)) return notify('Укажите длину заготовки', 'warning');

        // Check duplicates
        const exists = window.db.rods_blanks.find(b => b.dia == metal.dia && b.length == length);
        if (exists) return notify('Такая заготовка уже существует в базе', 'warning');

        window.db.rods_blanks.push({ dia: metal.dia, length, labor, price, metalName: metal.name });
    }
    else if (step == "3") {
        const dia = document.getElementById('r-dia-select').value;
        const length = document.getElementById('r-length').value;
        if (!dia || !Number(length)) return notify('Для прутка заполните диаметр и длину', 'warning');
        const name = `Пруток Ø${document.getElementById('r-dia-select').value} L=${document.getElementById('r-length').value}`;
        const price = calcStep3();
        window.db.rods_standard.push({ 
            name, 
            dia: document.getElementById('r-dia-select').value, 
            length: document.getElementById('r-length').value,
            center: document.getElementById('r-center').value,
            holes: document.getElementById('r-holes').value,
            pitch: document.getElementById('r-pitch').value,
            drawing: document.getElementById('r-drawing').value,
            labor: parseFloat(document.getElementById('r-labor').value) || 0,
            blankId: document.getElementById('r-blank-select').value,
            price 
        });
    }
    else if (step == "4") {
        const rodId = document.getElementById('bent-rod-select').value;
        const baseRod = window.db.rods_standard[rodId];
        if (!baseRod) return notify('Сначала создайте базовый пруток на шаге 3', 'warning');
        const price = calcStep4();
        window.db.rods_bent.push({
            ...baseRod,
            name: baseRod.name + ' (Гнутый)',
            drawing: document.getElementById('bent-drawing').value,
            labor: parseFloat(document.getElementById('bent-labor').value) || 0,
            baseId: rodId,
            price
        });
    }
    else if (step == "5") {
        const price = calcStep5();
        const rodId = document.getElementById('rub-rod-select').value;
        const allRods = [...window.db.rods_standard, ...window.db.rods_bent];
        const baseRod = allRods[rodId];
        if (!baseRod) return notify('Нет базового прутка для обрезинивания', 'warning');
        window.db.rods_rubber.push({
            ...baseRod,
            name: baseRod.name + ' (Обрезиненный)',
            rubDia: document.getElementById('rub-dia').value,
            rubWidth: document.getElementById('rub-width').value,
            labor: parseFloat(document.getElementById('rub-labor').value) || 0,
            baseId: rodId,
            price
        });
    }
    else if (step == "6") {
        const blankId = document.getElementById('d-blank-select').value;
        const blank = window.db.rods_blanks[blankId];
        const length = document.getElementById('d-length').value;
        if (!blank) return notify('Сначала подготовьте заготовку для сдвоенного прутка', 'warning');
        if (!Number(length)) return notify('Укажите длину изделия', 'warning');
        const total = (blank.price * 2) + (parseFloat(document.getElementById('d-clamp-price').value) * 2) + parseFloat(document.getElementById('d-center-clamp-price').value) + parseFloat(document.getElementById('d-labor').value);
        
        window.db.rods_double.push({
            name: `Сдвоенный пруток L=${length} (Ø${blank.dia})`,
            dia: blank.dia,
            length,
            clampPrice: parseFloat(document.getElementById('d-clamp-price').value) * 2 || 0,
            centerClampPrice: parseFloat(document.getElementById('d-center-clamp-price').value) || 0,
            labor: parseFloat(document.getElementById('d-labor').value) || 0,
            blankId,
            price: total
        });
    }

    persistRodsStore();
    updateDropdowns();
    renderRegistry();
    notify('Данные сохранены в базу модуля', 'success');
};

// AUTO-SUGGESTING BLANK
window.suggestBlank = function(step) {
    let targetLength, targetDia;
    if (step == 3) {
        targetLength = parseFloat(document.getElementById('r-length').value) + 10; // Logic: rod + 10mm margin
        targetDia = document.getElementById('r-dia-select').value;
    } else if (step == 6) {
        targetLength = parseFloat(document.getElementById('d-length').value) + 10;
        targetDia = document.getElementById('d-dia-select').value;
    }

    if (!targetLength || !targetDia) return notify('Введите длину и выберите диаметр', 'warning');

    // Find metal
    const metalIdx = window.db.rods_metal.findIndex(m => m.dia == targetDia);
    if (metalIdx === -1) return notify(`В шаге 1 не найден металл диаметром ${targetDia}мм`, 'warning');

    // Check if blank already exists
    const exists = window.db.rods_blanks.find(b => b.dia == targetDia && b.length == targetLength);
    if (exists) {
        notify('Заготовка нужного размера уже есть в базе', 'info');
        updateDropdowns();
        return;
    }

    // Auto-create blank
    const metal = window.db.rods_metal[metalIdx];
    const metalCost = (metal.pricePerM * targetLength) / 1000;
    const labor = 50; 
    const price = metalCost + labor;

    window.db.rods_blanks.push({ dia: targetDia, length: targetLength, labor, price, metalName: metal.name });
    persistRodsStore();
    notify(`Создана заготовка L=${targetLength} мм, Ø${targetDia} мм`, 'success');
    updateDropdowns();
};

function renderRegistry() {
    const tbody = document.getElementById('rods-registry-tbody');
    if (!tbody) return;

    let h = '';
    const addRows = (list, type) => {
        list.forEach(item => {
            h += `<tr>
                <td><span class="btn-sm btn-secondary" style="font-size:0.6rem">${type}</span></td>
                <td><strong>${item.name}</strong></td>
                <td class="neutral text-sm">${item.dia ? 'Ø'+item.dia : ''} ${item.length ? 'L='+item.length : ''}</td>
                <td class="emerald">${window.formatCurr(item.price)}</td>
                <td><button class="btn-logout" style="background:none" onclick="deleteRodItem('${type}', '${item.name}')"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        });
    };

    addRows(window.db.rods_standard, 'Стандарт');
    addRows(window.db.rods_bent, 'Гнутый');
    addRows(window.db.rods_rubber, 'Резина');
    addRows(window.db.rods_double, 'Сдвоенный');

    tbody.innerHTML = h || '<tr><td colspan="5" class="text-center neutral">База изделий пуста</td></tr>';
}

window.deleteRodItem = function(type, name) {
    const removeItem = () => {
        let list;
        if(type === 'Стандарт') list = window.db.rods_standard;
        if(type === 'Гнутый') list = window.db.rods_bent;
        if(type === 'Резина') list = window.db.rods_rubber;
        if(type === 'Сдвоенный') list = window.db.rods_double;
        if (!list) return;
        
        const idx = list.findIndex(i => i.name === name);
        if(idx > -1) list.splice(idx, 1);
        
        persistRodsStore();
        renderRegistry();
        notify('Позиция удалена', 'success');
    };

    if (window.confirmAction) {
        window.confirmAction('Удаление детали', `Удалить "${name}" из базы модуля?`, removeItem);
        return;
    }

    if (confirm('Удалить деталь?')) removeItem();
};

window.resetRodsWorkflow = function() {
    const reset = () => {
        document.querySelectorAll('.step-container input').forEach(input => {
            if (input.type === 'number') {
                input.value = input.defaultValue || '';
            } else {
                input.value = '';
            }
        });
        document.querySelectorAll('.step-container select').forEach(select => {
            select.selectedIndex = 0;
        });
        updateDropdowns();
        calcStep1();
        calcStep2();
        calcStep3();
        calcStep4();
        calcStep5();
        calcStep6();
        notify('Форма конструктора сброшена', 'success');
    };

    if (window.confirmAction) {
        window.confirmAction('Сброс формы', 'Очистить текущие поля конструктора без удаления сохраненной базы?', reset);
        return;
    }

    reset();
};
