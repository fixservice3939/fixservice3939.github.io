// ============================================================
// ОСНОВНОЙ JS-ФАЙЛ (отправка на сервер)
// ============================================================

(function() {
    // ========== НАСТРОЙКИ ==========
    const SERVER_URL = 'https://fixservicegsm.ru/send.php';
    
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
})();