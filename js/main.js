// ============================================================
// ОСНОВНОЙ JS-ФАЙЛ (отправка на сервер)
// ============================================================

(function() {
    // ========== НАСТРОЙКИ ==========
    const SERVER_URL = 'https://fixcrm-kataburhovich251.waw0.amvera.tech/api/send';

    // ========== МАСКА ТЕЛЕФОНА ==========
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

    // ========== TOAST ==========
    const toast = document.getElementById('toast');
    function showMessage(text, isError = false) {
        toast.textContent = text;
        toast.style.background = isError ? '#dc2626' : '#3E9FDC';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }

    // ========== ОТПРАВКА НА СЕРВЕР ==========
    async function sendToServer(formData) {
        try {
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            return result.status === 'success';
        } catch (error) {
            console.error('Ошибка отправки:', error);
            return false;
        }
    }

    // ========== ФОРМЫ ==========
    function validatePhone(phone) {
        const numbers = phone.replace(/[^\d+]/g, '').replace(/\D/g, '');
        return numbers.length >= 10 && numbers.length <= 11;
    }

    function setLoading(btn, isLoading) {
        if (isLoading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    // ========== ОСНОВНАЯ ФОРМА ==========
    const mainForm = document.getElementById('mainForm');
    const mainSubmitBtn = document.getElementById('mainFormSubmit');

    if (mainForm) {
        mainForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nameEl = document.getElementById('formName');
            const phoneEl = document.getElementById('formPhone');
            const privacyChecked = document.getElementById('formPrivacy');
            
            const name = nameEl ? nameEl.value.trim() : '';
            const phone = phoneEl ? phoneEl.value.trim() : '';

            if (!name || !phone) {
                showMessage('Заполните имя и номер телефона', true);
                return;
            }
            if (!validatePhone(phone)) {
                showMessage('Введите корректный номер телефона (10-11 цифр)', true);
                return;
            }
            if (!privacyChecked || !privacyChecked.checked) {
                showMessage('Подтвердите согласие на обработку данных', true);
                return;
            }

            const deviceTypeEl = document.getElementById('formDevice');
            const modelEl = document.getElementById('formModel');
            const problemEl = document.getElementById('formProblem');

            const formData = {
                name: name,
                phone: phone,
                deviceType: deviceTypeEl ? deviceTypeEl.value : '',
                model: modelEl ? modelEl.value.trim() : '',
                problem: problemEl ? problemEl.value.trim() : ''
            };

            setLoading(mainSubmitBtn, true);
            const success = await sendToServer(formData);
            setLoading(mainSubmitBtn, false);

            if (success) {
                showMessage('Спасибо! Заявка отправлена.');
                mainForm.reset();
            } else {
                showMessage('Ошибка отправки. Попробуйте позже.', true);
            }
        });
    }

// ========== ПОПАП ФОРМА ==========
const popup = document.getElementById('popupForm');
const popupFormElement = document.getElementById('popupFormElement');
const popupSubmitBtn = document.getElementById('popupSubmitBtn');

document.getElementById('heroOpenBtn')?.addEventListener('click', function() {
    popup.classList.add('active');
});

document.getElementById('closePopupBtn')?.addEventListener('click', function() {
    popup.classList.remove('active');
});

document.getElementById('cancelPopupBtn')?.addEventListener('click', function() {
    popup.classList.remove('active');
});

if (popupFormElement) {
    popupFormElement.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nameEl = document.getElementById('popupName');
        const phoneEl = document.getElementById('popupPhone');
        const privacyChecked = document.getElementById('popupPrivacy');
        
        const name = nameEl ? nameEl.value.trim() : '';
        const phone = phoneEl ? phoneEl.value.trim() : '';

        if (!name || !phone) {
            showMessage('Заполните имя и номер телефона', true);
            return;
        }
        if (!validatePhone(phone)) {
            showMessage('Введите корректный номер телефона (10-11 цифр)', true);
            return;
        }
        if (!privacyChecked || !privacyChecked.checked) {
            showMessage('Подтвердите согласие на обработку данных', true);
            return;
        }

        const serviceEl = document.getElementById('popupService');
        const modelEl = document.getElementById('popupModel');
        const qualityEl = document.getElementById('popupQuality');
        const priceEl = document.getElementById('popupPrice');
        const problemEl = document.getElementById('popupProblem');

        const formData = {
            name: name,
            phone: phone,
            deviceType: 'Телефон',
            model: modelEl ? modelEl.value.trim() : '',
            service: serviceEl ? serviceEl.value : '',
            quality: qualityEl ? qualityEl.value : '',
            price: priceEl ? priceEl.value : '',
            problem: problemEl ? problemEl.value.trim() : '',
            source: 'services'
        };

        setLoading(popupSubmitBtn, true);
        const success = await sendToServer(formData);
        setLoading(popupSubmitBtn, false);

        if (success) {
            showMessage('Спасибо! Заявка отправлена.');
            popupFormElement.reset();
            popup.classList.remove('active');
        } else {
            showMessage('Ошибка отправки. Попробуйте позже.', true);
        }
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

    // ============================================================
    // БУРГЕР-МЕНЮ
    // ============================================================
    const burgerBtn = document.getElementById('burgerBtn');
    const navLinks = document.getElementById('navLinks');

    if (burgerBtn && navLinks) {
        burgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                burgerBtn.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('open') && 
                !navLinks.contains(e.target) && 
                !burgerBtn.contains(e.target)) {
                burgerBtn.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // ============================================================
    // СТАТУС РАБОТЫ (ОТКРЫТО / ЗАКРЫТО)
    // ============================================================
    function updateWorkStatus() {
        const statusEl = document.getElementById('workStatus');
        if (!statusEl) return;

        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours + minutes / 60;

        const openTime = 10;
        const closeTime = 18;

        let statusText = '';
        if (currentTime >= openTime && currentTime < closeTime) {
            statusText = '10:00 – 18:00 (ОТКРЫТО)';
        } else {
            statusText = '10:00 – 18:00 (ЗАКРЫТО)';
        }

        statusEl.textContent = statusText;
        statusEl.style.color = '#FFFFFF';
        statusEl.style.fontWeight = '700';
    }

    updateWorkStatus();
    setInterval(updateWorkStatus, 60000);

    // ============================================================
    // ПОПАП ВЫБОРА МОДЕЛИ
    // ============================================================
    const modelsByBrand = {
        apple: [
            "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max",
            "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
            "iPhone 12", "iPhone 12 mini", "iPhone 12 Pro", "iPhone 12 Pro Max",
            "iPhone 13", "iPhone 13 mini", "iPhone 13 Pro", "iPhone 13 Pro Max",
            "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
            "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
            "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
            "iPhone 16e", "iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max", "iPhone 17e",
            "iPhone Air"
        ],
        samsung: [
            "Galaxy S21", "Galaxy S22", "Galaxy S23",
            "Galaxy A52", "Galaxy A53",
            "Galaxy Z Fold3", "Galaxy Z Flip3"
        ],
        xiaomi: [
            "Mi 11", "Mi 12",
            "Redmi Note 10", "Redmi Note 11",
            "12T Pro", "Poco F3"
        ],
        honor: [],
        huawei: [],
        oneplus: [],
        oppo: [],
        infinix: [],
        nokia: [],
        vivo: [],
        itel: [],
        tecno: [],
        blackberry: [],
        sony: [],
        realme: []
    };

    const modelPopup = document.getElementById('modelSelectPopup');
    const modelSearchInput = document.getElementById('modelSearchInput');
    const popupModelsList = document.getElementById('popupModelsList');
    const modelPopupBrandTitle = document.getElementById('modelPopupBrandTitle');
    const closeModelPopupBtn = document.getElementById('closeModelPopupBtn');

    document.querySelectorAll('.brand-card').forEach(card => {
        card.addEventListener('click', function() {
            const brand = this.dataset.brand.toLowerCase();
            const brandName = this.textContent.trim();

            if (modelPopupBrandTitle) {
                modelPopupBrandTitle.textContent = 'Выберите модель ' + brandName;
            }
            if (modelPopup) {
                modelPopup.classList.add('active');
            }
            document.body.style.overflow = 'hidden';
            renderModels(brand);
            if (modelSearchInput) modelSearchInput.value = '';
        });
    });

    function closeModelPopup() {
        if (modelPopup) {
            modelPopup.classList.remove('active');
        }
        document.body.style.overflow = '';
    }

    closeModelPopupBtn?.addEventListener('click', closeModelPopup);
    modelPopup?.addEventListener('click', function(e) {
        if (e.target === this) closeModelPopup();
    });

    function renderModels(brand) {
        const models = modelsByBrand[brand] || [];

        if (!popupModelsList) return;

        if (models.length === 0) {
            popupModelsList.innerHTML = '<div class="popup-model-card" style="grid-column:1/-1;color:#aaa;font-style:italic;">Модели временно отсутствуют</div>';
            return;
        }

        let html = '';
        models.forEach(model => {
            html += `
                <div class="popup-model-card" data-model="${model}">
                    ${model}
                </div>
            `;
        });
        popupModelsList.innerHTML = html;

        popupModelsList.querySelectorAll('.popup-model-card').forEach(card => {
            card.addEventListener('click', function() {
                const modelName = this.dataset.model;

                const formModelInput = document.getElementById('formModel');
                if (formModelInput) formModelInput.value = modelName;

                const popupModelInput = document.getElementById('popupModel');
                if (popupModelInput) popupModelInput.value = modelName;

                closeModelPopup();
                showMessage('Модель "' + modelName + '" выбрана!');
            });
        });
    }

    modelSearchInput?.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const titleText = modelPopupBrandTitle?.textContent || 'Выберите модель Apple';
        const brand = titleText.replace('Выберите модель ', '').toLowerCase();
        const models = modelsByBrand[brand] || [];

        const filtered = models.filter(model => 
            model.toLowerCase().includes(searchTerm)
        );

        if (!popupModelsList) return;

        if (filtered.length === 0) {
            popupModelsList.innerHTML = '<div class="popup-model-card" style="grid-column:1/-1;color:#aaa;font-style:italic;">Моделей не найдено</div>';
            return;
        }

        let html = '';
        filtered.forEach(model => {
            html += `
                <div class="popup-model-card" data-model="${model}">
                    ${model}
                </div>
            `;
        });
        popupModelsList.innerHTML = html;

        popupModelsList.querySelectorAll('.popup-model-card').forEach(card => {
            card.addEventListener('click', function() {
                const modelName = this.dataset.model;

                const formModelInput = document.getElementById('formModel');
                if (formModelInput) formModelInput.value = modelName;

                const popupModelInput = document.getElementById('popupModel');
                if (popupModelInput) popupModelInput.value = modelName;

                closeModelPopup();
                showMessage('Модель "' + modelName + '" выбрана!');
            });
        });
    });
})();
