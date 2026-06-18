// ============================================================
// ОСНОВНОЙ JS-ФАЙЛ (отправка в Telegram + Google Таблица)
// ============================================================

(function() {
    // ========== НАСТРОЙКИ ==========
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVg38t8MiCuD0SbdOO3U8Wdr2HmG49V8yIevcpIJfS70X7QpalM5vIgR00jhMTVym0AQ/exec';
    const BOT_TOKEN = '8877207809:AAFhA1S8UZfJfpUbNKrGh7Z5ZjQzlwxs2rY';
    const CHAT_ID = '6634773779';
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    // ========== ГАЛЕРЕЯ ==========
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
    
    // ========== ОТПРАВКА В TELEGRAM ==========
    async function sendToTelegram(formData) {
        const message = `
🔔 *Новая заявка с сайта FixService!*

👤 *Имя:* ${formData.name || 'Не указано'}
📱 *Телефон:* ${formData.phone || 'Не указан'}
📟 *Тип устройства:* ${formData.deviceType || 'Не указан'}
📱 *Модель:* ${formData.model || 'Не указана'}
📝 *Проблема:* ${formData.problem || 'Не указана'}
🕐 *Время заявки:* ${new Date().toLocaleString('ru-RU')}
        `;

        try {
            const response = await fetch(TELEGRAM_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Ошибка отправки в Telegram:', error);
            return false;
        }
    }
    
    // ========== ОТПРАВКА В GOOGLE ТАБЛИЦУ ==========
    async function sendToGoogleSheets(formData) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            return result.status === 'success';
        } catch (error) {
            console.error('Ошибка отправки в таблицу:', error);
            return false;
        }
    }
    
    // ========== ОБЩАЯ ОТПРАВКА (В ОБА МЕСТА) ==========
    async function sendToBoth(formData, submitBtn) {
        setLoading(submitBtn, true);
        
        try {
            // Отправляем в Telegram
            await sendToTelegram(formData);
            
            // Отправляем в Google Таблицу
            const success = await sendToGoogleSheets(formData);
            
            if (success) {
                showMessage('Спасибо! Заявка отправлена.');
                return true;
            } else {
                showMessage('Заявка отправлена, но есть проблемы с таблицей.', true);
                return false;
            }
        } catch (error) {
            showMessage('Ошибка отправки. Попробуйте позже.', true);
            return false;
        } finally {
            setLoading(submitBtn, false);
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
                problem: document.getElementById('formProblem').value.trim()
            };
            
            const success = await sendToBoth(formData, mainSubmitBtn);
            if (success) {
                mainForm.reset();
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
                problem: document.getElementById('popupProblem').value.trim()
            };
            
            const success = await sendToBoth(formData, popupSubmitBtn);
            if (success) {
                popupFormElement.reset();
                popup.classList.remove('active');
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
})();