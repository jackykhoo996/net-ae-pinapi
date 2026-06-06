(function () {
  'use strict';

  /* ── i18n ── */
  var translations = {
    ar: {
      hv_offer: 'عرض حصري الآن',
      hv_cta:   'ابدأ اللعب مجاناً',
      hv_meta:  '٢٤ ساعة مجانية · ١٠٠٠+ لعبة',
      badge:         'وصول حصري',
      headline:      'العب &bull; انتصر &bull; استمتع',
      sub:           'اشترك في Gameonz واستمتع بأكثر من 1000 لعبة حصرية مباشرةً على رقم اتصالات الإمارات الخاص بك',
      phone_label:   'أدخل رقم اتصالات الإمارات',
      get_pin:       'احصل على رمز PIN',
      terms:         'بالمتابعة، أنت توافق على الشروط والأحكام. AED 3.25/يوم بعد 24 ساعة مجانية. للإلغاء أرسل <strong>STOP GD</strong> إلى <strong>1741</strong>',
      pin_label:     'أدخل رمز PIN المرسل إلى هاتفك',
      verify:        'تحقق وفعّل',
      resend:        'إعادة إرسال PIN',
      success_title: '!أهلاً بك',
      success_msg:   'اشتراكك في Gameonz نشط الآن. استمتع بالمحتوى الحصري والمكافآت اليومية.',
      f1: '1000+ لعبة',
      f2: 'بطولات يومية',
      f3: 'مكافآت حصرية',
      toast_invalid_phone: 'أدخل رقماً صحيحاً مكوناً من 9 أرقام',
      toast_already_reg:   'هذا الرقم مسجل مسبقاً',
      toast_pin_error:     'رمز PIN غير صحيح، حاول مرة أخرى',
      toast_network:       'خطأ في الشبكة، يرجى المحاولة مجدداً',
      toast_fail:          'حدث خطأ، يرجى المحاولة مجدداً',
      toast_resent:        'تم إعادة إرسال رمز PIN!',
      toast_pin_length:    'أدخل رمز PIN المكون من 4 أرقام',
      phone_placeholder:   'XXXX XXX X5',
      wait:                'جاري التحميل...',
      lang_label:          'EN',
      detected_label:      'تم اكتشاف رقمك',
      not_my_number:       'ليس رقمي؟',
      sending_pin:         'جاري إرسال رمز PIN إلى هاتفك...'
    },
    en: {
      hv_offer: 'EXCLUSIVE OFFER',
      hv_cta:   'Play Free Now',
      hv_meta:  '24 Hours Free · 1000+ Games',
      badge:         'EXCLUSIVE ACCESS',
      headline:      'Play &bull; Win &bull; Enjoy',
      sub:           'Subscribe to Gameonz and enjoy 1000+ exclusive games directly on your Etisalat UAE number',
      phone_label:   'Enter your Etisalat UAE number',
      get_pin:       'GET MY PIN',
      terms:         'By proceeding you agree to the T&amp;C. AED 3.25/day after 24hr free trial. Cancel: <strong>STOP GD</strong> to <strong>1741</strong>',
      pin_label:     'Enter the PIN sent to your phone',
      verify:        'VERIFY & ACTIVATE',
      resend:        'Resend PIN',
      success_title: "You're In!",
      success_msg:   'Your Gameonz Pass is now active. Enjoy exclusive content & daily rewards.',
      f1: '1000+ Games',
      f2: 'Daily Tournaments',
      f3: 'Exclusive Drops',
      toast_invalid_phone: 'Please enter a valid 9-digit UAE number',
      toast_already_reg:   'This number is already registered',
      toast_pin_error:     'Incorrect PIN. Please try again',
      toast_network:       'Network error. Please try again',
      toast_fail:          'Something went wrong. Please try again',
      toast_resent:        'PIN resent!',
      toast_pin_length:    'Please enter the 4-digit PIN',
      phone_placeholder:   '5X XXX XXXX',
      wait:                'Please wait...',
      lang_label:          'عربي',
      detected_label:      'Number Detected',
      not_my_number:       'Not my number?',
      sending_pin:         'Sending PIN to your phone...'
    }
  };

  var lang = 'ar';

  function t(key) { return translations[lang][key] || key; }

  function applyLang() {
    var isAr = lang === 'ar';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.innerHTML = t(key);
    });

    // Language button label
    document.getElementById('lang-btn').textContent = t('lang_label');

    // Phone placeholder
    document.getElementById('phone').placeholder = t('phone_placeholder');

    // Page title
    document.title = isAr ? 'Gameonz — اشترك الآن' : 'Gameonz — Subscribe Now';
  }

  /* ── URL params ── */
  var params  = new URLSearchParams(window.location.search);
  var clickId = params.get('clickid') || params.get('click_id') || params.get('cid') || '';
  var requestId = '';
  var msisdn    = '';

  /* ── DOM ── */
  var stepPhone    = document.getElementById('step-phone');
  var stepPin      = document.getElementById('step-pin');
  var stepSuccess  = document.getElementById('step-success');
  var phoneInput   = document.getElementById('phone');
  var pinInput     = document.getElementById('pin');
  var btnRequest   = document.getElementById('btn-request');
  var btnVerify    = document.getElementById('btn-verify');
  var btnResend    = document.getElementById('btn-resend');
  var langBtn      = document.getElementById('lang-btn');
  var phoneRow     = document.getElementById('phone-row');
  var detectedRow  = document.getElementById('detected-row');
  var detectedNum  = document.getElementById('detected-num');
  var phoneLabel   = document.getElementById('phone-label');
  var btnChange    = document.getElementById('btn-change');

  /* ── Digit-only inputs ── */
  phoneInput.addEventListener('input', function () {
    var v = this.value.replace(/\D/g, '');
    if (v.charAt(0) === '0') v = v.slice(1);
    this.value = v;
  });
  pinInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
  });

  /* ── Language toggle ── */
  langBtn.addEventListener('click', function () {
    lang = lang === 'ar' ? 'en' : 'ar';
    applyLang();
  });

  /* ── Toast ── */
  function showToast(msg) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('show'); });
    });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 300);
    }, 3500);
  }

  /* ── Loading state ── */
  function setLoading(btn, loading) {
    var textEl = btn.querySelector('.btn-text') || btn;
    if (loading) {
      btn.disabled = true;
      btn.dataset.orig = textEl.textContent;
      textEl.textContent = t('wait');
    } else {
      btn.disabled = false;
      textEl.textContent = btn.dataset.orig || textEl.textContent;
    }
  }

  /* ── Step transitions ── */
  function showStep(step) {
    [stepPhone, stepPin, stepSuccess].forEach(function (s) { s.classList.add('hidden'); });
    step.classList.remove('hidden');
  }

  /* ── Request PIN ── */
  var sendingEl = document.getElementById('pin-sending');

  btnRequest.addEventListener('click', function () {
    var raw = phoneInput.value.trim().replace(/\D/g, '');
    if (raw.length !== 9) {
      showToast(t('toast_invalid_phone'));
      return;
    }
    msisdn = '+971' + raw;

    // Transition immediately — no waiting
    showStep(stepPin);
    sendingEl.classList.remove('hidden');
    pinInput.disabled = true;
    btnVerify.disabled = true;
    btnResend.disabled = true;

    fetch('/api/request-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msisdn: msisdn, click_id: clickId })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        sendingEl.classList.add('hidden');
        if (data.success) {
          requestId = data.request_id;
          pinInput.disabled = false;
          btnVerify.disabled = false;
          btnResend.disabled = false;
          pinInput.focus();
        } else if (data.error === 'already_registered') {
          showStep(stepPhone);
          showToast(t('toast_already_reg'));
        } else {
          showStep(stepPhone);
          showToast(t('toast_fail'));
        }
      })
      .catch(function () {
        sendingEl.classList.add('hidden');
        showStep(stepPhone);
        showToast(t('toast_network'));
      });
  });

  /* ── Verify PIN ── */
  btnVerify.addEventListener('click', function () {
    var pin = pinInput.value.trim();
    if (pin.length !== 4) {
      showToast(t('toast_pin_length'));
      return;
    }

    setLoading(btnVerify, true);
    fetch('/api/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin, request_id: requestId, click_id: clickId, msisdn: msisdn })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          showStep(stepSuccess);
        } else if (data.error === 'invalid_pin') {
          showToast(t('toast_pin_error'));
          pinInput.value = '';
          pinInput.focus();
        } else {
          showToast(t('toast_fail'));
        }
      })
      .catch(function () { showToast(t('toast_network')); })
      .finally(function () { setLoading(btnVerify, false); });
  });

  /* ── Resend PIN ── */
  btnResend.addEventListener('click', function () {
    if (btnResend.disabled || !msisdn) return;
    setLoading(btnResend, true);

    fetch('/api/request-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msisdn: msisdn, click_id: clickId })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          requestId = data.request_id;
          pinInput.value = '';
          showToast(t('toast_resent'));
        } else {
          showToast(t('toast_fail'));
        }
      })
      .catch(function () { showToast(t('toast_network')); })
      .finally(function () { setLoading(btnResend, false); });
  });

  /* ── Auto-detect MSISDN from carrier header ── */
  function maskLocal(n) {
    // 501234567 → +971 501 *** 567
    return '+971 ' + n.slice(0, 3) + ' *** ' + n.slice(6);
  }

  function showDetected(localNum) {
    phoneInput.value = localNum;
    detectedNum.textContent = maskLocal(localNum);
    detectedRow.classList.remove('hidden');
    phoneRow.classList.add('hidden');
    phoneLabel.classList.add('hidden');
  }

  function resetToManual() {
    phoneInput.value = '';
    detectedRow.classList.add('hidden');
    phoneRow.classList.remove('hidden');
    phoneLabel.classList.remove('hidden');
    phoneInput.focus();
  }

  btnChange.addEventListener('click', resetToManual);

  // Check URL params first (traffic source may pass msisdn/phone/ani/cli)
  var urlMsisdn = (function () {
    var p = new URLSearchParams(window.location.search);
    var raw = p.get('msisdn') || p.get('phone') || p.get('mobile') || p.get('ani') || p.get('cli') || '';
    raw = raw.replace(/[\s\-]/g, '');
    if (raw.startsWith('+971'))      raw = raw.slice(4);
    else if (raw.startsWith('00971')) raw = raw.slice(5);
    else if (raw.startsWith('971') && raw.length === 12) raw = raw.slice(3);
    if (raw.startsWith('0'))         raw = raw.slice(1);
    return /^5\d{8}$/.test(raw) ? raw : '';
  }());

  if (urlMsisdn) {
    showDetected(urlMsisdn);
  } else {
    // Fall back to server-side carrier header detection
    fetch('/api/detect-msisdn')
      .then(function (r) { return r.json(); })
      .then(function (data) { if (data.msisdn) showDetected(data.msisdn); })
      .catch(function () { /* silently ignore — show normal input */ });
  }

  /* ── Init ── */
  applyLang();

}());
