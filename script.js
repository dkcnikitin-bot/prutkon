// База данных
const db = {
    trans: [
        { article: '100.22233', brand: 'Grimme', model: 'SE 150-60', type: 'pickup', length: 12000, width: 800, pitch: 40, beltsSide: 'R', beltsCenter: '', lock: 'Вулканиз.', price: 164500, img: 'image114.jpg' },
        { article: '200.44455', brand: 'Ropa', model: 'Euro Tiger', type: 'main', length: 8000, width: 1000, pitch: 35, beltsSide: 'S', beltsCenter: '400, 400', lock: 'Механика', price: 92000, img: 'image14.png' },
        { article: '300.77123', brand: 'Dewulf', model: 'RA3060', type: 'sift', length: 15500, width: 750, pitch: 32, beltsSide: 'DS', beltsCenter: '', lock: 'Вулканиз.', price: 215000, img: 'image16.jpg' },
        { article: '400.88001', brand: 'AVR', model: 'Puma 3', type: 'main', length: 9000, width: 900, pitch: 42, beltsSide: 'R', beltsCenter: '300', lock: 'Механика', price: null, img: 'image18.jpg' },
        { article: '500.11022', brand: 'Holmer', model: 'Terra DosT4', type: 'pickup', length: 6500, width: 850, pitch: 40, beltsSide: 'S', beltsCenter: '', lock: 'Вулканиз.', price: 105000, img: 'image20.jpg' },
        { article: '600.55667', brand: 'Grimme', model: 'Evo 290', type: 'main', length: 11000, width: 1100, pitch: 50, beltsSide: 'DS', beltsCenter: '500', lock: 'Механика', price: 184000, img: 'image24.jpg' },
        { article: '700.33445', brand: 'Ropa', model: 'Keiler 2', type: 'sift', length: 10500, width: 800, pitch: 36, beltsSide: 'R', beltsCenter: '', lock: 'Вулканиз.', price: null, img: 'image30.jpg' }
    ],
    belts: [
        { type: 'R', w: 50, t: 10, holes: '32,40,50', dia: '8,10', price: 800 },
        { type: 'S (с бортом)', w: 60, t: 15, holes: '40,50', dia: '10,11', price: 1200 },
        { type: 'DS', w: 60, t: 15, holes: '50', dia: '10', price: null },
        { type: 'N (HN)', w: 75, t: 20, holes: '40, 50', dia: '10, 11', price: 1850 },
        { type: 'DNG', w: 100, t: 25, holes: '50', dia: '12', price: 2400 }
    ],
    hardware: [],
    fasteners: [],
    rods: [
        { name: 'Обычный прямой пруток (Ст3/Пружинная)', dia: '10, 11, 12', price: 250 },
        { name: 'Пруток с выгибом (Центральный)', dia: '10, 11', price: 320 },
        { name: 'Сдвоенный пруток', dia: '11, 12', price: 850 },
        { name: 'Замок шарнирный РТИ (в сборе)', dia: '-', price: 540 }
    ]
};

// Генерация скобянки и метизов
const realImages = ['image1.jpg','image10.jpg','image100.png','image101.png','image102.png','image103.png','image104.jpg','image106.png','image107.jpg','image108.png','image109.png','image11.jpg','image110.jpg','image111.png','image112.jpg','image113.png','image114.jpg','image115.jpg','image116.png','image117.jpg','image118.jpg','image119.jpg','image12.jpg','image120.jpg','image121.png','image122.png','image123.png','image124.jpg','image125.png','image126.jpg','image127.jpg','image128.jpg','image129.jpg','image13.png','image130.jpg','image131.jpg','image132.jpg','image133.jpg','image134.jpg','image135.jpg','image136.jpg','image137.jpg','image139.jpg','image14.png','image140.jpg','image141.jpg','image142.jpg','image143.jpg','image144.jpg','image145.jpg','image146.jpg','image147.jpg','image148.jpg','image149.jpg','image15.jpg','image150.jpg','image151.jpg','image152.png','image153.jpg','image154.jpg','image156.jpg','image157.jpg','image158.png','image16.jpg','image160.jpg','image161.png','image164.png','image166.png','image167.png','image168.png','image169.png','image17.png','image172.png','image173.jpg','image177.jpg','image178.jpg','image179.png','image18.jpg','image181.jpg','image182.jpg','image183.jpg','image184.jpg','image185.jpg','image19.png','image2.jpg','image20.jpg','image21.jpg','image22.png','image23.jpg','image24.jpg','image26.jpg','image27.jpg','image28.jpg','image29.jpg','image3.jpg','image30.jpg','image31.jpg','image32.jpg','image33.jpg','image34.jpg','image35.jpg','image36.jpg','image37.jpg','image38.jpg','image39.jpg','image4.jpg','image40.jpg','image41.jpg','image42.jpg','image43.jpg','image44.jpg','image45.png','image46.jpg','image47.jpg','image48.jpg','image49.jpg','image5.png','image50.jpg','image51.jpg','image52.png','image53.jpg','image56.jpg','image57.jpg','image58.jpg','image6.jpg','image7.png','image72.jpg','image73.jpg','image74.jpg','image77.jpg','image8.png','image80.png','image81.jpg','image83.jpg','image84.png','image85.jpg','image86.jpg','image87.jpg','image89.png','image9.jpg','image90.png','image91.png','image92.png','image93.jpg','image94.jpg','image95.jpg','image96.jpg','image97.png','image98.png'];

realImages.forEach(function(img, index) {
    if (index % 2 === 0) {
        db.hardware.push({ name: 'Скобяное изделие (Арт. ' + (3000 + index) + ')', material: 'Ст3/Пластик', count: 10 * index, price: index % 5 === 0 ? null : (50 + index * 10), img: img });
    } else {
        db.fasteners.push({ name: 'Метиз/Деталь (Арт. ' + (5000 + index) + ')', material: 'Оцинк', count: 1000, price: 15, img: img });
    }
});

// Заказы и производственный прогресс
let orders = [
    { id: 'ЗН-26042', date: '31.10.2026', art: '100.22233', brand: 'ОАО Агро-Регион', sum: 164500, status: 'В работе', progress: 40 },
    { id: 'ЗН-26041', date: '30.10.2026', art: 'Пруток сдвоенный (20шт)', brand: 'ИП Иванов (Ropa)', sum: 17000, status: 'Новый', progress: 0 },
    { id: 'ЗН-26040', date: '25.10.2026', art: 'Транспортер 8000x600', brand: 'КФХ Агро (Holmer)', sum: 89200, status: 'Завершен', progress: 100 }
];

// Утилиты
function formatCurr(num) {
    return Math.round(num || 0).toLocaleString('ru-RU') + ' ₽';
}

function getTodayStr() {
    var td = new Date();
    var d = td.getDate();
    var m = td.getMonth() + 1;
    var y = td.getFullYear();
    return (d < 10 ? '0' + d : d) + '.' + (m < 10 ? '0' + m : m) + '.' + y;
}
var tdStr = getTodayStr();

function initApp() {
    var dates = document.querySelectorAll('.today-date');
    for (var i = 0; i < dates.length; i++) {
        dates[i].innerText = tdStr;
    }

    // Логин и Доступ
    window.sysPwd = '623401';
    window.currentUser = null;

    window.doLogin = function() {
        var idx = document.getElementById('login-role').value;
        var pwd = document.getElementById('login-pwd').value;
        var emp = window.dbEmployees[idx];
        
        if (emp && pwd === emp.pwd) {
            window.currentUser = emp;
            document.getElementById('login-modal').classList.remove('active');
            document.querySelector('.user-name').innerText = emp.name;
            document.querySelector('.user-role').innerText = emp.role;
            alert('С возвращением, ' + emp.name + '!');
        } else {
            alert('Неверный пароль доступа!');
        }
    };

    window.changeSysPwd = function() {
        var newP = document.getElementById('settings-sys-pwd').value;
        if (newP.length < 4) return alert('Пароль слишком короткий!');
        window.sysPwd = newP;
        alert('Системный пароль успешно изменен на: ' + newP);
    };

    // Навигация
    var navItems = document.querySelectorAll('.nav-item');
    var viewSections = document.querySelectorAll('.view-section');
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function(e) {
            var item = e.currentTarget;
            for (var j = 0; j < navItems.length; j++) navItems[j].classList.remove('active');
            for (var k = 0; k < viewSections.length; k++) viewSections[k].classList.remove('active');
            item.classList.add('active');
            var targetId = item.getAttribute('data-target');
            var targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.classList.add('active');
        });
    }

    // Умный поиск
    var searchInput = document.getElementById('global-search');
    var searchDropdown = document.getElementById('search-dropdown');

    if (searchInput && searchDropdown) {
        searchInput.addEventListener('input', function(e) {
            var q = e.target.value.toLowerCase();
            searchDropdown.innerHTML = '';
            if (q.length < 2) {
                searchDropdown.classList.add('hidden');
                return;
            }

            var results = [];
            var kwords = q.split(/\s+/).filter(function(kw) { return kw.length > 0; });
            
            function matchKW(str) {
                if (!str) return false;
                var s = str.toLowerCase();
                for (var i=0; i<kwords.length; i++) {
                    if (s.indexOf(kwords[i]) === -1) return false;
                }
                return true;
            }

            db.trans.forEach(function(t, idx) {
                var s = t.article + ' ' + t.model + ' ' + t.brand + ' транспортер';
                if (matchKW(s)) results.push({ type: 'Транспортер', text: t.article + ' - ' + t.brand + ' ' + t.model, data: t, cat: 'trans', idx: idx });
            });
            db.hardware.forEach(function(h, idx) {
                if (matchKW(h.name + ' ' + h.material)) results.push({ type: 'Скобянка', text: h.name, data: h, cat: 'hardware', idx: idx });
            });
            db.fasteners.forEach(function(f, idx) {
                if (matchKW(f.name + ' ' + f.material)) results.push({ type: 'Метизы', text: f.name, data: f, cat: 'fasteners', idx: idx });
            });
            db.rods.forEach(function(r, idx) {
                if (matchKW(r.name)) results.push({ type: 'Скобянка (Пруток)', text: r.name, data: r, cat: 'rods', idx: idx });
            });

            if (results.length > 0) {
                results.forEach(function(res) {
                    var div = document.createElement('div');
                    div.className = 'search-item';
                    var imgSrc = res.data.img ? 'extracted_xlsx/xl/media/' + res.data.img : 'extracted_xlsx/xl/media/image11.jpg';
                    div.innerHTML = '<img src="' + imgSrc + '" class="search-item-img">' +
                                    '<div class="search-item-info">' +
                                        '<span class="search-item-title">' + res.text + '</span>' +
                                        '<span class="search-item-model">' + (res.data.material || res.data.brand || '') + '</span>' +
                                    '</div>' +
                                    '<span class="search-item-cat">' + res.type + '</span>';
                    div.onclick = function() {
                        searchInput.value = '';
                        searchDropdown.classList.add('hidden');
                        window.selectFromCatalog(res.cat, res.idx);
                    };
                    searchDropdown.appendChild(div);
                });
                searchDropdown.classList.remove('hidden');
            } else {
                searchDropdown.innerHTML = '<div class="p-1 neutral">Ничего не найдено</div>';
                searchDropdown.classList.remove('hidden');
            }
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.header-search')) searchDropdown.classList.add('hidden');
        });
    }

    function fillFormWithData(res) {
        if (!res || !res.data) return;
        var t = res.data;
        if (res.type === 'Транспортер') {
            document.getElementById('calc-article').value = t.article || '';
            document.getElementById('calc-brand').value = t.brand || '';
            document.getElementById('calc-model').value = t.model || '';
            document.getElementById('calc-conv-type').value = t.type || 'main';
            document.getElementById('calc-length').value = t.length || 0;
            document.getElementById('calc-width').value = t.width || 0;
            document.getElementById('calc-pitch').value = t.pitch || 0;
            document.getElementById('calc-belts-side').value = t.beltsSide || '';
            document.getElementById('calc-lock-type').value = t.lock || '';
        } else {
            document.getElementById('calc-article').value = t.name || '';
            document.getElementById('calc-chk-met').checked = true;
            document.getElementById('calc-txt-met').value = t.name || '';
        }
    }

    // Автоподстановка данных при вводе артикула
    var calcArtInput = document.getElementById('calc-article');
    if (calcArtInput) {
        calcArtInput.addEventListener('input', function(e) {
            var val = e.target.value.toLowerCase();
            if (val.length < 4) return;
            // Ищем в базе по артикулу
            var found = null;
            db.trans.forEach(function(t) { if(t.article.toLowerCase() === val) found = { type: 'Транспортер', data: t }; });
            if (!found) {
                db.hardware.forEach(function(h) { if(h.name.toLowerCase().indexOf(val) !== -1) found = { type: 'Скобянка', data: h }; });
            }
            if (found) fillFormWithData(found);
        });
    }

    // Калькулятор
    var btnCalcRun = document.getElementById('btn-calc-run');
    if (btnCalcRun) {
        btnCalcRun.addEventListener('click', function() {
            var art = document.getElementById('calc-article').value.trim();
            if (art === '') {
                alert('Укажите артикул!');
                return;
            }
            
            var L = parseFloat(document.getElementById('calc-length').value) || 0;
            var W = parseFloat(document.getElementById('calc-width').value) || 0;
            var P = parseFloat(document.getElementById('calc-pitch').value) || 0;
            
            var isBelt = (L > 0 && W > 0 && P > 0);
            var materialCost = 0;
            var finalWeight = 0;
            var rodsCount = 0;

            if (isBelt) {
                rodsCount = Math.floor(L / P);
                var beltMeters = (L / 1000) * 2;
                materialCost += beltMeters * 1200; 
                finalWeight += rodsCount * (W / 1000) * 0.65;
            }

            if (document.getElementById('calc-chk-str').checked) {
                var step1 = parseInt(document.getElementById('calc-stp-str').value) || 1;
                var c1 = isBelt ? Math.ceil(rodsCount / step1) : 50; 
                materialCost += c1 * 250;
            }
            if (document.getElementById('calc-chk-ben').checked) {
                var step2 = parseInt(document.getElementById('calc-stp-ben').value) || 1;
                var c2 = isBelt ? Math.ceil(rodsCount / step2) : 50;
                materialCost += c2 * 320;
            }
            if (document.getElementById('calc-chk-met').checked) {
                materialCost += 5000;
            }

            if (materialCost === 0) materialCost = 5000;

            var laborCost = materialCost * 0.25;
            var total = (materialCost + laborCost) * 1.35; // margin
            
            document.getElementById('calc-res-total').innerText = formatCurr(total);
            if (!isBelt) {
                 document.getElementById('calc-res-rods').innerText = 'Сырье/Шт';
                 document.getElementById('calc-res-weight').innerText = 'по факту';
            } else {
                 document.getElementById('calc-res-rods').innerText = rodsCount + ' шт';
                 document.getElementById('calc-res-weight').innerText = finalWeight.toFixed(1) + ' кг';
            }
            
            document.getElementById('calc-results-wrap').classList.remove('hidden');
        });
    }

    // Корзина калькулятора (Многопозиционные заказы)
    window.calcBasket = [];
    window.addItemToBasket = function() {
        var art = document.getElementById('calc-article').value || 'Деталь';
        var totalStr = document.getElementById('calc-res-total').innerText;
        var totalVal = parseInt(totalStr.replace(/[^\d]/g, '')) || 0;
        var desc = document.getElementById('calc-brand').value + ' ' + (parseFloat(document.getElementById('calc-length').value) || '');
        
        window.calcBasket.push({ art: art, desc: desc, sum: totalVal });
        renderBasket();
        document.getElementById('calc-results-wrap').classList.add('hidden');
        alert('Позиция ' + art + ' добавлена в состав заказа!');
    };

    function renderBasket() {
        var tbody = document.getElementById('calc-basket-tbody');
        var totalEl = document.getElementById('calc-basket-total');
        if (!tbody) return;
        
        if (window.calcBasket.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center neutral">Список пуст. Добавьте расчет выше.</td></tr>';
            totalEl.innerText = '0 ₽';
            return;
        }
        
        var h = '';
        var total = 0;
        window.calcBasket.forEach(function(it, i) {
            total += it.sum;
            h += '<tr><td><strong>' + it.art + '</strong></td><td>' + it.desc + '</td><td class="emerald">' + formatCurr(it.sum) + '</td>' +
                 '<td><button class="td-btn btn-danger" onclick="window.delBasketItem('+i+')"><i class="fa-solid fa-times"></i></button></td></tr>';
        });
        tbody.innerHTML = h;
        totalEl.innerText = formatCurr(total);
    }

    window.delBasketItem = function(i) {
        window.calcBasket.splice(i, 1);
        renderBasket();
    };

    window.createFinalOrder = function() {
        if (window.calcBasket.length === 0) return alert('Список изделий пуст!');
        
        var firstArt = window.calcBasket[0].art;
        var brand = document.getElementById('calc-brand').value || 'Н/Д';
        var totalSum = window.calcBasket.reduce(function(acc, it) { return acc + it.sum; }, 0);
        
        var newId = 'ЗН-' + Math.floor(26000 + Math.random() * 1000);
        var artText = window.calcBasket.length > 1 ? firstArt + ' + ' + (window.calcBasket.length - 1) + ' поз.' : firstArt;
        
        orders.unshift({ id: newId, date: tdStr, art: artText, brand: brand, sum: totalSum, status: 'Новый', progress: 0 });
        
        window.calcBasket = [];
        renderBasket();
        document.getElementById('calc-form').reset();
        renderOrders();
        renderProd();
        document.querySelector('[data-target="orders"]').click();
        alert('Многопозиционный заказ ' + newId + ' успешно сформирован!');
    };

    // Отрисовка Справочников
    var catTabs = document.querySelectorAll('#catalog-tabs button');
    var catTable = document.getElementById('catalog-table');
    
    // Глобальная функция выбора из каталога
    window.selectedProductForCalc = null;
    window.selectFromCatalog = function(typeStr, index) {
        var res = null;
        if (typeStr === 'trans') res = { type: 'Транспортер', data: db.trans[index] };
        if (typeStr === 'hardware') res = { type: 'Скобянка', data: db.hardware[index] };
        if (typeStr === 'fasteners') res = { type: 'Метизы', data: db.fasteners[index] };
        if (typeStr === 'rods') res = { type: 'Скобянка', data: db.rods[index] };
        if (res) {
            window.selectedProductForCalc = res;
            window.selectedProductForCalc.category = typeStr;
            window.selectedProductForCalc.index = index;
            var m = document.getElementById('product-modal');
            var img = res.data.img ? 'extracted_xlsx/xl/media/' + res.data.img : 'extracted_xlsx/xl/media/image11.jpg';
            document.getElementById('pc-img').src = img;
            document.getElementById('pc-title').innerText = 'Карточка: ' + res.type;
            
            document.getElementById('pc-edit-art').value = res.data.article || res.data.name;
            document.getElementById('pc-edit-price').value = res.data.price || 0;
            document.getElementById('pc-edit-stock').value = res.data.count || 0;
            
            document.getElementById('pc-ordered-count').innerText = Math.floor(Math.random() * 50) + 1;
            if(m) m.classList.add('active');
        }
    };

    var btnPcClose = document.getElementById('btn-pc-close');
    if(btnPcClose) btnPcClose.addEventListener('click', function() {
        document.getElementById('product-modal').classList.remove('active');
    });

    var btnPcSave = document.getElementById('btn-pc-save');
    if(btnPcSave) btnPcSave.addEventListener('click', function() {
        if(window.selectedProductForCalc) {
            var cat = window.selectedProductForCalc.category;
            var idx = window.selectedProductForCalc.index;
            var data = db[cat][idx];
            data.price = parseFloat(document.getElementById('pc-edit-price').value) || 0;
            data.count = parseInt(document.getElementById('pc-edit-stock').value) || 0;
            var newName = document.getElementById('pc-edit-art').value;
            if(data.article !== undefined) data.article = newName;
            else data.name = newName;
            
            document.getElementById('product-modal').classList.remove('active');
            renderCatTab(cat);
        }
    });

    var btnPcDel = document.getElementById('btn-pc-del');
    if(btnPcDel) btnPcDel.addEventListener('click', function() {
        if(window.selectedProductForCalc && confirm('Вы уверены, что хотите безвозвратно удалить этот товар из базы справочника?')) {
            var cat = window.selectedProductForCalc.category;
            var idx = window.selectedProductForCalc.index;
            db[cat].splice(idx, 1);
            document.getElementById('product-modal').classList.remove('active');
            renderCatTab(cat);
        }
    });

    var btnPcUse = document.getElementById('btn-pc-use');
    if(btnPcUse) btnPcUse.addEventListener('click', function() {
        document.getElementById('product-modal').classList.remove('active');
        if(window.selectedProductForCalc) {
            document.querySelector('[data-target="calculator"]').click();
            fillFormWithData(window.selectedProductForCalc);
            window.scrollTo(0, 0);
        }
    });

    // Управление настройками и сотрудниками
    if (!window.dbEmployees) {
        window.dbEmployees = [
            { name: 'Администратор', role: 'admin', base: 50000, share: 0, pwd: 'admin', extra: 0 },
            { name: 'Иванов С.А.', role: 'Мастер цеха', base: 45000, share: 0.40, pwd: '123', extra: 0 },
            { name: 'Петров В.В.', role: 'Оператор ЧПУ', base: 40000, share: 0.35, pwd: '123', extra: 0 }
        ];
    }
    if (!window.dbSalArchive) window.dbSalArchive = [];

    window.renderEmpSettings = function() {
        var el = document.getElementById('settings-emp-list');
        var loginSel = document.getElementById('login-role');
        if(!el) return;
        var h = '';
        var selH = '';
        window.dbEmployees.forEach(function(e, i) {
            h += '<div style="display:flex; gap:10px; background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); flex-wrap:wrap">' +
                '<input type="text" class="form-control" value="'+e.name+'" onchange="window.updateEmp('+i+', &quot;name&quot;, this.value)" style="flex:2; min-width:150px" placeholder="ФИО">' +
                '<select class="form-control" onchange="window.updateEmp('+i+', &quot;role&quot;, this.value)" style="flex:1; min-width:140px">' +
                    '<option value="admin" '+(e.role==='admin'?'selected':'')+'>Администратор</option>' +
                    '<option value="manager" '+(e.role==='manager'?'selected':'')+'>Менеджер КП</option>' +
                    '<option value="prod" '+(e.role==='prod'?'selected':'')+'>Зав. производством</option>' +
                '</select>' +
                '<input type="password" class="form-control" value="'+e.pwd+'" onchange="window.updateEmp('+i+', &quot;pwd&quot;, this.value)" style="flex:1; min-width:80px" placeholder="Пароль">' +
                '<input type="number" class="form-control" value="'+e.base+'" onchange="window.updateEmp('+i+', &quot;base&quot;, this.value)" style="flex:1" placeholder="Оклад">' +
                '<input type="number" class="form-control" value="'+(e.share*100)+'" onchange="window.updateEmp('+i+', &quot;share&quot;, this.value)" style="flex:1" title="ФОТ %" placeholder="%">' +
                '<button class="btn btn-danger" onclick="window.delEmp('+i+')"><i class="fa-solid fa-times"></i></button></div>';
            selH += '<option value="'+i+'">'+e.name + ' (' + (e.role === 'admin' ? 'Админ' : e.role === 'manager' ? 'Менеджер' : 'Зав. произв.') + ')</option>';
        });
        el.innerHTML = h;
        if(loginSel) loginSel.innerHTML = selH;
        if(window.fbPush) window.fbPush();
    };
    
    window.addEmployee = function() {
        window.dbEmployees.push({ name: 'Новый сотрудник', role: 'Сотрудник', base: 30000, share: 0.1, pwd: '123', extra: 0 });
        window.renderEmpSettings();
    };

    window.updateEmp = function(idx, fld, val) {
        if (fld === 'share') val = parseFloat(val) / 100;
        if (fld === 'base' || fld === 'extra') val = parseFloat(val) || 0;
        window.dbEmployees[idx][fld] = val;
        renderProd();
    };
    window.delEmp = function(idx) {
        window.dbEmployees.splice(idx, 1);
        renderEmpSettings();
        renderProd();
    };
    window.addEmployee = function() {
        window.dbEmployees.push({ name: '', role: '', base: 0, share: 0 });
        renderEmpSettings();
    };
    window.connectFirebase = function() {
        // Финальная конфигурация для проекта "prutkon-41faf"
        const firebaseConfig = {
            apiKey: "AIzaSyCvUdwwNkhiGzUIQ6L_P8fx0Eaj6I3exKE",
            authDomain: "prutkon-41faf.firebaseapp.com",
            projectId: "prutkon-41faf", 
            storageBucket: "prutkon-41faf.firebasestorage.app",
            messagingSenderId: "658162506199",
            appId: "1:658162506199:web:c5afdf6723327b00279392",
            measurementId: "G-N052MJRD1H"
        };

        try {
           if (firebase.apps.length === 0) {
              firebase.initializeApp(firebaseConfig);
           }
           // Используем Firestore, так как пользователь ее создал
           window.fbDB = firebase.firestore();
           alert('Синхронизация ПРУТКОН через Cloud Firestore (проект «' + firebaseConfig.projectId + '») установлена!');
           
           // Pull & Push initial
           window.fbPull();
           window.fbPush();
        } catch(e) {
           alert('Ошибка Firebase Firestore: ' + e.message);
        }
    };

    window.fbPush = function() {
        if (!window.fbDB) return;
        window.fbDB.collection('erp_data').doc('current').set({
            orders: orders,
            employees: window.dbEmployees,
            archive: window.dbSalArchive,
            ts: Date.now()
        }).catch(err => console.error('Push error:', err));
    };

    window.fbPull = function() {
        if (!window.fbDB) return;
        window.fbDB.collection('erp_data').doc('current').get().then(function(doc) {
            if (doc.exists) {
                var data = doc.data();
                if (data.orders) orders = data.orders;
                if (data.employees) window.dbEmployees = data.employees;
                if (data.archive) window.dbSalArchive = data.archive;
                renderOrders();
                renderProd();
                renderEmpSettings();
                console.log('Данные успешно загружены из Cloud Firestore');
            }
        }).catch(err => console.error('Pull error:', err));
    };

    // Обновленные функции рендера с авто-пушем в облако
    var oldRenderOrders = renderOrders;
    renderOrders = function() {
        oldRenderOrders();
        window.fbPush();
    };

    var oldRenderProd = renderProd;
    renderProd = function() {
        oldRenderProd();
        window.fbPush();
    };

    var oldRenderEmp = renderEmpSettings;
    renderEmpSettings = function() {
        oldRenderEmp();
        window.fbPush();
    };

    // Вызов один раз при инициализации
    renderEmpSettings();

    function renderCatTab(c) {
        var html = '';
        if (c === 'trans') {
            html += '<thead><tr><th>Артикул</th><th>Бренд/Модель</th><th>Длина</th><th>Ширина</th><th>Шаг</th><th>Замок</th><th>Цена</th></tr></thead><tbody>';
            db.trans.forEach(function(i, idx) {
                var s = (!i.price || !i.lock) ? 'row-incomplete' : '';
                html += '<tr class="' + s + '" style="cursor:pointer;" onclick="window.selectFromCatalog(&quot;trans&quot;, ' + idx + ')" title="Кликните для переноса в Калькулятор"><td>' + (i.img ? '<img src="extracted_xlsx/xl/media/' + i.img + '" style="height:30px;vertical-align:middle;margin-right:5px; border-radius:4px;">' : '') + i.article + '</td><td>' + i.brand + ' ' + i.model + '</td><td>' + i.length + '</td><td>' + i.width + '</td><td>' + i.pitch + '</td><td>' + i.lock + '</td><td>' + (i.price ? formatCurr(i.price) : '-') + '</td></tr>';
            });
            html += '</tbody>';
        } else if (c === 'hardware' || c === 'fasteners') {
            var nCat = c === 'hardware' ? 'Скобяные изделия' : 'Метизы и детали';
            html += '<thead><tr><th>Фото (' + nCat + ')</th><th>Наименование / Артикул</th><th>Материал</th><th>В наличии</th><th>Цена (шт)</th></tr></thead><tbody>';
            db[c].forEach(function(i, idx) {
                var s = (!i.price) ? 'row-incomplete' : '';
                html += '<tr class="' + s + '" style="cursor:pointer;" onclick="window.selectFromCatalog(&quot;' + c + '&quot;, ' + idx + ')" title="Кликните для переноса в Калькулятор"><td>' + (i.img ? '<img src="extracted_xlsx/xl/media/' + i.img + '" style="height:60px; object-fit:contain; border-radius:4px; border:1px solid rgba(255,255,255,0.1); background:#fff">' : 'Нет фото') + '</td><td><strong>' + i.name + '</strong></td><td>' + (i.material || '-') + '</td><td>' + (i.count || '-') + ' шт</td><td>' + (i.price ? formatCurr(i.price) : '<span class="text-warning">Нет цены</span>') + '</td></tr>';
            });
            html += '</tbody>';
        } else if (c === 'belts') {
            html += '<thead><tr><th>Тип ремня</th><th>Ширина (мм)</th><th>Толщина (мм)</th><th>Отверстия</th><th>Диаметр (мм)</th><th>Цена (метр)</th></tr></thead><tbody>';
            db.belts.forEach(function(i) {
                var s = (!i.price) ? 'row-incomplete' : '';
                html += '<tr class="' + s + '"><td>' + i.type + '</td><td>' + i.w + '</td><td>' + i.t + '</td><td>' + i.holes + '</td><td>' + i.dia + '</td><td>' + (i.price ? formatCurr(i.price) : '-') + '</td></tr>';
            });
            html += '</tbody>';
        } else if (c === 'rods') {
            html += '<thead><tr><th>Наименование прутка/замка</th><th>Рекомендуемый Диаметр (мм)</th><th>Базовая цена (шт/компл)</th></tr></thead><tbody>';
            db.rods.forEach(function(i, idx) {
                var s = (!i.price) ? 'row-incomplete' : '';
                html += '<tr class="' + s + '" style="cursor:pointer;" onclick="window.selectFromCatalog(&quot;rods&quot;, ' + idx + ')" title="Кликните для переноса в Калькулятор"><td><strong>' + i.name + '</strong></td><td>' + (i.dia || '-') + '</td><td>' + (i.price ? formatCurr(i.price) : '-') + '</td></tr>';
            });
            html += '</tbody>';
        }
        if (catTable) catTable.innerHTML = html;
    }

    for (var m = 0; m < catTabs.length; m++) {
        catTabs[m].addEventListener('click', function(e) {
            for (var bn = 0; bn < catTabs.length; bn++) { catTabs[bn].classList.remove('active'); }
            var btn = e.currentTarget;
            btn.classList.add('active');
            renderCatTab(btn.getAttribute('data-cat'));
        });
    }
    renderCatTab('trans');

    // Отрисовка заказов
    var ordTable = document.querySelector('#orders-table tbody');
    function renderOrders() {
        if (!ordTable) return;
        ordTable.innerHTML = '';
        orders.forEach(function(o) {
            var tr = document.createElement('tr');
            var statuses = ['Новый', 'В работе', 'Завершен', 'Отменен'];
            var statOpts = '';
            for (var q = 0; q < statuses.length; q++) {
                var s = statuses[q];
                statOpts += '<option value="' + s + '" ' + (o.status === s ? 'selected' : '') + '>' + s + '</option>';
            }
            
            var badgeColor = 'status-primary';
            if (o.status === 'Новый') badgeColor = 'status-warning bg-transparent border';
            if (o.status === 'Завершен') badgeColor = 'status-success';
            if (o.status === 'Отменен') badgeColor = 'status-danger';

            var tdStrHTML = '<td><strong>' + o.id + '</strong></td>';
            tdStrHTML += '<td>' + o.date + '</td>';
            tdStrHTML += '<td>' + o.art + '<br><small class="neutral">' + o.brand + '</small></td>';
            tdStrHTML += '<td>' + formatCurr(o.sum) + '</td>';
            tdStrHTML += '<td><select class="select-status ' + badgeColor + '" data-id="' + o.id + '">' + statOpts + '</select></td>';
            tdStrHTML += '<td><button class="td-btn print-bill-btn" data-id="' + o.id + '" title="Печать Счета"><i class="fa-solid fa-print"></i></button></td>';
            
            tr.innerHTML = tdStrHTML;
            ordTable.appendChild(tr);
        });

        var selects = document.querySelectorAll('.select-status');
        for (var sIdx = 0; sIdx < selects.length; sIdx++) {
            selects[sIdx].addEventListener('change', function(e) {
                var rowId = e.target.getAttribute('data-id');
                for (var i = 0; i < orders.length; i++) {
                    if (orders[i].id === rowId) {
                        orders[i].status = e.target.value;
                        if (e.target.value === 'В работе' && orders[i].progress === 0) orders[i].progress = 10;
                        if (e.target.value === 'Завершен') orders[i].progress = 100;
                    }
                }
                renderOrders();
                renderProd();
            });
        }

        var printBtns = document.querySelectorAll('.print-bill-btn');
        for (var pIdx = 0; pIdx < printBtns.length; pIdx++) {
            printBtns[pIdx].addEventListener('click', function(e) {
                var rowId = e.currentTarget.getAttribute('data-id');
                var ord = null;
                for (var i = 0; i < orders.length; i++) {
                    if (orders[i].id === rowId) ord = orders[i];
                }
                if (ord) {
                    document.getElementById('bill-num').innerText = ord.id;
                    document.getElementById('bill-date').innerText = ord.date;
                    document.getElementById('bill-item').innerText = ord.art + ' (' + ord.brand + ')';
                    document.getElementById('bill-price').innerText = formatCurr(ord.sum);
                    document.getElementById('bill-sum').innerText = formatCurr(ord.sum);
                    document.getElementById('bill-total').innerText = formatCurr(ord.sum);
                    
                    document.body.classList.add('print-bill');
                    window.print();
                    document.body.classList.remove('print-bill');
                }
            });
        }
    }

    // Производство
    function renderProd() {
        var ordBadge = document.getElementById('orders-badge');
        if (ordBadge) ordBadge.innerText = orders.length;
        
        var complSum = 0, cCount = 0, actCount = 0;
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].status === 'Завершен' || orders[i].status === 'Оплачен ФОТ') {
                complSum += orders[i].sum;
                cCount++;
            }
            if (orders[i].status !== 'Отменен') actCount++;
        }
        
        var avg = cCount > 0 ? complSum / cCount : 0;
        
        // Обновление Дашборда и Отчетов
        var dsRev = document.querySelectorAll('.dash-revenue');
        for (var ir = 0; ir < dsRev.length; ir++) dsRev[ir].innerText = formatCurr(complSum);
        
        var elRepRev = document.getElementById('rep-total-rev');
        if(elRepRev) elRepRev.innerText = formatCurr(complSum);
        
        var elRepCount = document.getElementById('rep-completed-count');
        if(elRepCount) elRepCount.innerText = cCount + ' шт';
        
        var dsCount = document.querySelectorAll('.dash-orders-count');
        for (var ic = 0; ic < dsCount.length; ic++) dsCount[ic].innerText = actCount + ' шт';
        
        var dsAvg = document.querySelectorAll('.dash-avg-check');
        for (var ia = 0; ia < dsAvg.length; ia++) dsAvg[ia].innerText = formatCurr(avg);

        // ФОТ и Зарплата (Оклад + Премия + Gross/Net/NDFL)
        var fot = complSum * 0.25; // 25% margin mapped to salaries
        var dashFot = document.getElementById('dash-fot-total');
        if (dashFot) dashFot.innerText = formatCurr(fot);

        var salTbody = document.getElementById('salary-tbody');
        var printSalTbody = document.getElementById('print-salary-tbody');
        if (salTbody) {
            var salHtml = '';
            var printHtml = '';
            var totalPrem = 0, totalNet = 0;
            for (var iEmp = 0; iEmp < window.dbEmployees.length; iEmp++) {
                var emp = window.dbEmployees[iEmp];
                var prem = fot * (emp.share || 0);
                var extra = emp.extra || 0;
                var gross = emp.base + prem + extra;
                var ndfl = gross * 0.13;
                var net = gross - ndfl;
                totalPrem += prem;
                totalNet += net;
                
                salHtml += '<tr>' +
                    '<td><strong>' + emp.name + '</strong><br><small class="neutral">'+emp.role+'</small></td>' +
                    '<td>' + formatCurr(emp.base) + '</td>' +
                    '<td class="emerald">+' + formatCurr(prem) + '</td>' +
                    '<td><input type="number" class="form-control" value="'+extra+'" style="width:100px; padding:4px" onchange="window.updateEmp('+iEmp+', &quot;extra&quot;, this.value)"></td>' +
                    '<td>' + formatCurr(gross) + '</td>' +
                    '<td class="text-warning">-' + formatCurr(ndfl) + '</td>' +
                    '<td><strong class="blue">' + formatCurr(net) + '</strong></td>' +
                '</tr>';
                
                printHtml += '<tr><td>' + emp.name + '</td><td>' + formatCurr(emp.base) + '</td><td>' + formatCurr(prem) + '</td><td>' + formatCurr(extra) + '</td><td>' + formatCurr(gross) + '</td><td>' + formatCurr(ndfl) + '</td><td><strong>' + formatCurr(net) + '</strong></td><td></td></tr>';
            }
            salTbody.innerHTML = salHtml;
            if(printSalTbody) printSalTbody.innerHTML = printHtml;
            
            var elPrem = document.getElementById('sal-total-prem');
            if(elPrem) elPrem.innerText = formatCurr(totalPrem);
            var elNet = document.getElementById('sal-total-net');
            if(elNet) elNet.innerText = formatCurr(totalNet);
        }

        window.paySalary = function() {
            var p = document.getElementById('sal-period-sel').value;
            var tn = document.getElementById('sal-total-net').innerText;
            if(confirm('Подтверждаете начисление и выплату зарплаты за ' + p + ' на сумму ' + tn + ' ?\\nАрхив будет сохранен, а текущие закрытые заказы выведены из ФОТ.')) {
                window.dbSalArchive.push({ period: p, total: tn, count: window.dbEmployees.length });
                // Очистка или сброс сумм заказов (Мок закрытия периода)
                orders.forEach(function(o) { if(o.status === 'Завершен') o.status = 'Оплачен ФОТ'; });
                renderProd();
                alert('Выплата успешно проведена. Период ' + p + ' закрыт.');
            }
        };

        window.printSalary = function() {
            var p = document.getElementById('sal-period-sel').value;
            var tn = document.getElementById('sal-total-net').innerText;
            document.getElementById('print-salary-period').innerText = p;
            document.getElementById('print-salary-date').innerText = getTodayStr();
            document.getElementById('print-salary-total').innerText = tn;
            
            document.body.classList.add('print-bill');
            document.getElementById('print-salary-area').classList.remove('hidden');
            window.print();
            
            setTimeout(function() {
                document.getElementById('print-salary-area').classList.add('hidden');
                document.body.classList.remove('print-bill');
            }, 500);
        };

        // Render Archive
        var arcTbody = document.getElementById('salary-archive-tbody');
        if (arcTbody) {
            var arcHtml = '';
            window.dbSalArchive.forEach(function(arc) {
                arcHtml += '<tr><td>' + arc.period + '</td><td class="emerald"><strong>' + arc.total + '</strong></td><td>' + arc.count + ' чел.</td><td><span style="background:var(--status-success);color:white;padding:3px 8px;border-radius:4px;font-size:0.8rem">Проведено</span></td></tr>';
            });
            if(window.dbSalArchive.length === 0) arcHtml = '<tr><td colspan="4" class="text-center neutral">Архив пуст</td></tr>';
            arcTbody.innerHTML = arcHtml;
        }

        // Формирование очереди производства
        var htmlQueue = '';
        var hasActive = false;
        
        for (var i = 0; i < orders.length; i++) {
            var o = orders[i];
            if (o.status === 'В работе' || o.status === 'Новый') {
                hasActive = true;
                var p1 = o.progress || 0;
                
                var machine = 'Сборочный цех (Ручная сборка)';
                if (o.art.toString().toLowerCase().indexOf('транспортер') !== -1) {
                    machine = 'Агрегатная сборка / Вулканизация';
                } else if (o.art.indexOf('Пруток') !== -1 || o.art.indexOf('Замок') !== -1) {
                    machine = 'Станок ЧПУ (Гибка/Штамповка)';
                }
                
                var actionBtnHTML = '';
                if (o.status === 'Новый') {
                    actionBtnHTML = '<button class="btn btn-emerald mt-3" style="font-size:0.8rem; padding: 6px 12px; border-radius:4px" onclick="window.workAction(&quot;' + o.id + '&quot;, &quot;start&quot;)"><i class="fa-solid fa-play"></i> Начать производство</button>';
                } else if (o.status === 'В работе') {
                    actionBtnHTML = '<div style="display:flex; gap:10px;" class="mt-3"><button class="btn btn-secondary" style="font-size:0.8rem; padding: 6px 12px; border-radius:4px" onclick="window.workAction(&quot;' + o.id + '&quot;, &quot;progress&quot;)"><i class="fa-solid fa-forward-step"></i> Выполнить цикл (+20%)</button>' +
                                    '<button class="btn btn-success" style="font-size:0.8rem; padding: 6px 12px; background:var(--status-success); color:white; border-radius:4px" onclick="window.workAction(&quot;' + o.id + '&quot;, &quot;finish&quot;)"><i class="fa-solid fa-check-double"></i> Сдать на склад (Завершить)</button></div>';
                }
                
                htmlQueue += '<div class="prod-item">' +
                        '<div class="prod-header">' +
                            '<span class="prod-id"><i class="fa-solid fa-file-signature"></i> ' + o.id + '</span>' +
                            '<span class="prod-status ' + (o.status === 'В работе' ? 'status-info' : 'status-warning') + '">' + o.status + '</span>' +
                        '</div>' +
                        '<div style="font-size:0.95rem">' + o.art + ' <br><small class="neutral">' + o.brand + '</small></div>' +
                        '<div class="prod-progress-bg"><div class="prod-progress-bar" style="width: ' + p1 + '%"></div></div>' +
                        '<div class="prod-machine"><i class="fa-solid fa-industry emerald"></i> <strong>' + machine + '</strong> &nbsp;|&nbsp; Прогресс: ' + p1 + '%</div>' +
                        actionBtnHTML +
                    '</div>';
            }
        }
        
        if (!hasActive) {
            htmlQueue = '<div class="p-4 neutral text-center"><i class="fa-solid fa-mug-hot fa-2x mb-3"></i><br>Нет активных заказов. Оборудование простаивает. Разместите заказ из Калькулятора.</div>';
        }

        var qMain = document.getElementById('production-queue');
        var qDash = document.getElementById('dash-prod-queue');
        if (qMain) qMain.innerHTML = htmlQueue;
        if (qDash) qDash.innerHTML = htmlQueue;
    }

    // Глобальные обработчики для кнопок Производства
    window.workAction = function(id, action) {
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].id === id) {
                if (action === 'start') {
                    orders[i].status = 'В работе';
                    orders[i].progress = 10;
                } else if (action === 'progress') {
                    orders[i].progress = Math.min(orders[i].progress + 20, 99);
                } else if (action === 'finish') {
                    orders[i].progress = 100;
                    orders[i].status = 'Завершен';
                    // Optional small alert so the user feels the interactivity
                    alert('Заказ ' + id + ' успешно завершен и перемещен на склад готовой продукции!');
                }
            }
        }
        renderOrders();
        renderProd();
    };

    renderOrders();
    renderProd();

    var btnExport = document.getElementById('btn-export-excel');
    if (btnExport) {
        btnExport.addEventListener('click', function() {
            var rows = [["№ Заказа", "Дата", "Изделие/Артикул", "Бренд/Клиент", "Сумма", "Статус"]];
            for(var i = 0; i < orders.length; i++) {
                var o = orders[i];
                rows.push([o.id, o.date, o.art, o.brand, o.sum, o.status]);
            }
            var csvContent = "\uFEFF";
            for(var j = 0; j < rows.length; j++) {
                csvContent += rows[j].join(";") + "\r\n";
            }
            var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            var link = document.createElement("a");
            link.setAttribute("href", URL.createObjectURL(blob));
            link.setAttribute("download", "Пруткон_Отчет_" + tdStr + ".csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    window.printCalc = function() {
        document.body.classList.add('print-calc');
        window.print();
    };

    window.addEventListener('beforeprint', function() {
        // Class is added inside specific print functions to avoid collisions
    });

    window.addEventListener('afterprint', function() {
        document.body.classList.remove('print-calc');
        document.body.classList.remove('print-bill');
        document.body.classList.remove('print-salary');
        document.getElementById('print-salary-area').classList.add('hidden');
    });

}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});
