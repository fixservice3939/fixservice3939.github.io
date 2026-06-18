// ============================================================
// ОСНОВНОЙ JS-ФАЙЛ ДЛЯ ВСЕГО САЙТА
// ============================================================

(function() {
    // ========== КОНСТАНТЫ ==========
    const previewPhotos = [
        "photos/display/Zam.stcl1.jpg",
        "photos/display/Zam.stcl2.jpg",
        "photos/display/Zam.stcl3.jpg",
        "photos/iphone-memory/память айфон 1.jpg",
        "photos/laptops/ZamProcNout.jpg",
        "photos/laptops/ZamProcNout2.jpg",
        "photos/motherboard/восстановление сети айфонk.jpg",
        "photos/motherboard/ребол процессора.jpg"
    ];
    
    const modelsByBrand = {
        Apple: ["iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max", "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max", "iPhone 12", "iPhone 12 mini", "iPhone 12 Pro", "iPhone 12 Pro Max", "iPhone 13", "iPhone 13 mini", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max", "iPhone 16e", "iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max", "iPhone Air", "iPhone 17e"],
        Samsung: ["Samsung Galaxy S21", "Samsung Galaxy S22", "Samsung Galaxy S23", "Samsung Galaxy A52", "Samsung Galaxy A53", "Samsung Galaxy Z Fold3", "Samsung Galaxy Z Flip3"],
        Xiaomi: ["Xiaomi Mi 11", "Xiaomi Mi 12", "Xiaomi Redmi Note 10", "Xiaomi Redmi Note 11", "Xiaomi 12T Pro", "Xiaomi Poco F3"],
        Honor: ["Honor 50", "Honor 70", "Honor X8", "Honor Magic4 Pro"],
        Huawei: ["Huawei P30", "Huawei P40", "Huawei Mate 40", "Huawei Nova 9"],
        Oneplus: ["OnePlus 9", "OnePlus 10 Pro", "OnePlus Nord 2"],
        Oppo: ["Oppo Find X5", "Oppo Reno 8", "Oppo A96"],
        Infinix: ["Infinix Note 11", "Infinix Zero 20", "Infinix Hot 12"],
        Nokia: ["Nokia G21", "Nokia X20", "Nokia 5.4"],
        Vivo: ["Vivo V23", "Vivo X80", "Vivo Y75"],
        itel: ["itel A60", "itel P40", "itel S23"],
        Tecno: ["Tecno Spark 9", "Tecno Camon 19", "Tecno Pova 4"],
        BlackBerry: ["BlackBerry Key2", "BlackBerry Motion"],
        Sony: ["Sony Xperia 1 III", "Sony Xperia 5 III", "Sony Xperia 10 III"],
        realme: ["realme GT 2", "realme 9 Pro", "realme C35"]
    };
    
    // ========== DOM ЭЛЕМЕНТЫ ==========
    const toast = document.getElementById('toast');
    const popup = document.getElementById('popupForm');
    const modelPopup = document.getElementById('modelSelectPopup');
    const popupType = document.getElementById('popupType');
    const popupTitle = document.getElementById('popupTitle');
    const popupDeviceSelect = document.querySelector('#popupForm .popup-device-select');
    const formModelInput = document.getElementById('formModel');
    const popupModelInput = document.getElementById('popupModel');
    
    let currentSelectedBrand = '';
    
    // ========== ГАЛЕРЕЯ ==========
    const galleryGrid = document.getElementById('serviceGalleryGrid');
    if (galleryGrid) {
        galleryGrid.innerHTML = previewPhotos.map(src => `
            <div class="service-gallery-item" onclick="openLightbox('${src.replace(/'/g, "\\'")}')">
                <img src="${src}" loading="lazy" onerror="this.src='https://placehold.co/400x400/3E9FDC/white?text=Фото'">
            </div>
        `).join('');
    }
    
    window.openLightbox = function(imgSrc) {
        const lb = document.getElementById('lightbox');
        const img = document.getElementById('lightboxImg');
        img.src = imgSrc;
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    window.closeLightbox = function() {
        const lb = document.getElementById('lightbox');
        lb.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    // ========== ОБЩИЕ ФУНКЦИИ ==========
    function showMessage(text, isError = false) {
        toast.textContent = text;
        toast.style.background = isError ? '#dc2626' : '#3E9FDC';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }
    
    function validatePhone(phone) {
        const numbers = phone.replace(/[^\d+]/g, '').replace(/\D/g, '');
        return numbers.length >= 10 && numbers.length <= 11;
    }
    
    function applyPhoneMask(input) {
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            let formatted = '';
            if (value.length > 0) formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.slice(1, 4);
            if (value.length > 4) formatted += ') ' + value.slice(4, 7);
            if (value.length > 7) formatted += '-' + value.slice(7, 9);
            if (value.length > 9) formatted += '-' + value.slice(9, 11);
            this.value = formatted;
        });
    }
    
    document.querySelectorAll('[data-phone-mask]').forEach(applyPhoneMask);
    
    function setLoading(btn, isLoading) {
        if (isLoading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }
    
    // ========== ОТПРАВКА В TELEGRAM ==========
    async function sendToTelegram(formData) {
        const message = `
🔔 *Новая заявка с сайта FixService!*

👤 *Имя:* ${formData.name || 'Не указано'}
📱 *Телефон:* ${formData.phone || 'Не указан'}
📟 *Тип устройства:* ${formData.deviceType || 'Не указан'}
📱 *Модель:* ${formData.model || 'Не указана'}
📝 *Проблема:* ${formData.problem || 'Не указана'}
🕐 *Время заявки:* ${new Date(formData.timestamp).toLocaleString('ru-RU')}
        `;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(TELEGRAM_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown',
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Telegram API error:', errorData);
                throw new Error(`Ошибка ${response.status}: ${errorData.description || 'Неизвестная ошибка'}`);
            }

            const result = await response.json();
            if (!result.ok) {
                throw new Error('Telegram не подтвердил отправку');
            }

            return true;
        } catch (error) {
            console.error('Ошибка отправки в Telegram:', error);
            
            if (error.name === 'AbortError') {
                throw new Error('Превышено время ожидания. Попробуйте позже.');
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Нет соединения с интернетом. Проверьте связь.');
            } else {
                throw new Error('Ошибка отправки. Попробуйте позже или позвоните нам.');
            }
        }
    }
    
    // ========== ОБЩАЯ ФУНКЦИЯ ДЛЯ ОТПРАВКИ ЛЮБОЙ ФОРМЫ ==========
    async function submitForm(formDataObj, submitBtn, resetFormCallback) {
        setLoading(submitBtn, true);
        
        try {
            const success = await sendToTelegram(formDataObj);
            
            if (success) {
                showMessage('Спасибо! Заявка отправлена. Мастер свяжется с вами.');
                if (resetFormCallback) resetFormCallback();
                return true;
            } else {
                throw new Error('Отправка не удалась');
            }
        } catch (error) {
            showMessage(error.message || 'Ошибка отправки. Попробуйте позже или позвоните нам.', true);
            return false;
        } finally {
            setLoading(submitBtn, false);
        }
    }
    
    // ========== МОДЕЛИ И БРЕНДЫ ==========
    function openModelSelectPopup(brand) {
        currentSelectedBrand = brand;
        document.getElementById('modelPopupBrandTitle').textContent = `Выберите модель ${brand}`;
        document.getElementById('modelSearchInput').value = '';
        renderModelList(brand, '');
        modelPopup.classList.add('active');
    }
    
    function renderModelList(brand, searchTerm) {
        const models = modelsByBrand[brand] || [`${brand} (модели уточняйте)`];
        const filtered = models.filter(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
        const container = document.getElementById('popupModelsList');
        container.innerHTML = '';
        if (filtered.length === 0) {
            container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#7EC8FF;">Моделей не найдено</div>';
            return;
        }
        filtered.forEach(model => {
            const card = document.createElement('div');
            card.className = 'popup-model-card';
            card.textContent = model;
            card.addEventListener('click', () => {
                if (formModelInput) formModelInput.value = model;
                if (popupModelInput) popupModelInput.value = model;
                modelPopup.classList.remove('active');
                showMessage(`Выбрана модель: ${model}`);
                setTimeout(() => {
                    if (popupType) {
                        popupType.value = 'main';
                        popupTitle.textContent = 'Оставить заявку';
                        if (popupDeviceSelect) popupDeviceSelect.style.display = 'block';
                        popup.classList.add('active');
                    }
                }, 200);
            });
            container.appendChild(card);
        });
    }
    
    const searchInput = document.getElementById('modelSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderModelList(currentSelectedBrand, e.target.value);
        });
    }
    
    document.getElementById('closeModelPopupBtn')?.addEventListener('click', () => modelPopup.classList.remove('active'));
    modelPopup?.addEventListener('click', (e) => { if(e.target === modelPopup) modelPopup.classList.remove('active'); });
    
    document.querySelectorAll('.brand-card').forEach(card => {
        card.addEventListener('click', () => {
            const brand = card.getAttribute('data-brand');
            if (brand && modelsByBrand[brand]) {
                openModelSelectPopup(brand);
            } else if (brand) {
                if (formModelInput) formModelInput.value = brand;
                if (popupModelInput) popupModelInput.value = brand;
                showMessage(`Выбран бренд: ${brand}. Уточните модель мастеру.`);
                setTimeout(() => {
                    popupType.value = 'main';
                    popupTitle.textContent = 'Оставить заявку';
                    if (popupDeviceSelect) popupDeviceSelect.style.display = 'block';
                    popup.classList.add('active');
                }, 200);
            }
        });
    });
    
    // ========== ОСНОВНАЯ ФОРМА ==========
    const mainForm = document.getElementById('mainForm');
    const mainSubmitBtn = document.getElementById('mainFormSubmit');
    
    if (mainForm) {
        mainForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('formName').value.trim();
            const phone = document.getElementById('formPhone').value.trim();
            const privacyChecked = document.getElementById('formPrivacy').checked;
            
            if (!name || !phone) {
                showMessage('Заполните имя и номер телефона', true);
                return;
            }
            if (!validatePhone(phone)) {
                showMessage('Введите корректный номер телефона (10-11 цифр)', true);
                return;
            }
            if (!privacyChecked) {
                showMessage('Подтвердите согласие на обработку данных', true);
                return;
            }
            
            const formData = {
                name, phone,
                deviceType: document.getElementById('formDevice').value,
                model: document.getElementById('formModel').value.trim(),
                problem: document.getElementById('formProblem').value.trim(),
                timestamp: new Date().toISOString()
            };
            
            await submitForm(formData, mainSubmitBtn, () => mainForm.reset());
        });
    }
    
    // ========== ПОПАП ФОРМА ==========
    function openMainPopup() {
        popupType.value = 'main';
        popupTitle.textContent = 'Оставить заявку';
        if (popupDeviceSelect) popupDeviceSelect.style.display = 'block';
        popup.classList.add('active');
    }
    
    document.getElementById('heroOpenBtn')?.addEventListener('click', openMainPopup);
    document.getElementById('closePopupBtn')?.addEventListener('click', () => popup.classList.remove('active'));
    document.getElementById('cancelPopupBtn')?.addEventListener('click', () => popup.classList.remove('active'));
    popup?.addEventListener('click', (e) => { if(e.target === popup) popup.classList.remove('active'); });
    
    const popupFormElement = document.getElementById('popupFormElement');
    const popupSubmitBtn = document.getElementById('popupSubmitBtn');
    
    if (popupFormElement) {
        popupFormElement.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('popupName').value.trim();
            const phone = document.getElementById('popupPhone').value.trim();
            const privacyChecked = document.getElementById('popupPrivacy').checked;
            
            if (!name || !phone) {
                showMessage('Заполните имя и номер телефона', true);
                return;
            }
            if (!validatePhone(phone)) {
                showMessage('Введите корректный номер телефона (10-11 цифр)', true);
                return;
            }
            if (!privacyChecked) {
                showMessage('Подтвердите согласие на обработку данных', true);
                return;
            }
            
            const formData = {
                name, phone,
                deviceType: document.getElementById('popupDevice').value,
                model: document.getElementById('popupModel').value.trim(),
                problem: document.getElementById('popupProblem').value.trim(),
                timestamp: new Date().toISOString()
            };
            
            const success = await submitForm(formData, popupSubmitBtn, () => {
                popupFormElement.reset();
                if (popupDeviceSelect) popupDeviceSelect.style.display = 'block';
                popup.classList.remove('active');
            });
        });
    }
    
    // ========== ПЛАВНАЯ ПРОКРУТКА ==========
    document.querySelectorAll('a.nav-link, .footer-links a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
})();