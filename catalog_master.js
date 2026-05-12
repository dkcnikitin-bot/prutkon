/* catalog_master.js - ПРУТКОН ERP Catalog Master (Entry Point) */

// Динамическая загрузка модулей мастера
const scripts = [
    'catalog_master/state.js',
    'catalog_master/step1.js',
    'catalog_master/step2.js',
    'catalog_master/step3.js',
    'catalog_master/step4.js',
    'catalog_master/step5.js',
    'catalog_master/specification.js',
    'catalog_master/manager.js'
];

scripts.forEach(src => {
    if (!document.querySelector(`script[src="${src}"]`)) {
        const s = document.createElement('script');
        s.src = src;
        s.async = false; // Сохраняем порядок загрузки
        document.head.appendChild(s);
    }
});

// Пробрасываем глобальную функцию на всякий случай
window.openCatalogMaster = () => {
    if (window.CatalogManager) {
        window.CatalogManager.open();
    } else {
        setTimeout(window.openCatalogMaster, 100);
    }
};