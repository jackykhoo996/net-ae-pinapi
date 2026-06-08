(function () {
  'use strict';

  /* ── i18n ── */
  var translations = {
    ar: {
      hv_offer: 'عرض حصري الآن',
      hv_cta:   'ابدأ اللعب مجاناً',
      hv_meta:  '٢٤ ساعة مجانية · ١٠٠٠+ لعبة',
      badge:         '⚽ عرض كأس العالم 2026',
      headline:      'العب &bull; انتصر &bull; احتفل',
      sub:           'انضم إلى ملايين اللاعبين واستمتع بأكثر من 1000 لعبة خلال موسم كأس العالم FIFA 2026',
      phone_label:   'أدخل رقم اتصالات الإمارات',
      get_pin:       'ابدأ تجربتك المجانية',
      urgency:       '⚡ عرض محدود لموسم كأس العالم — سارع الآن!',
      free_big:      '٢٤ ساعة مجاناً',
      free_sub:      'ثم AED 3.25 فقط يومياً',
      free_badge:    'مجاناً',
      pin_label_step2: 'أدخل رمز التحقق المرسل إلى هاتفك',
      top_bar:       'مجانًا لمدة 24 ساعة ثم ستُفرض على 3.25 دراهم / يومًا درهمًا إماراتيًا شاملاً ضريبة القيمة المضافة.',
      terms:         'مجانًا لمدة 24 ساعة ثم ستُفرض على 3.25 دراهم / يومًا درهمًا إماراتيًا شاملاً ضريبة القيمة المضافة. بالضغط على اشترك، سوف تتلقى رسالة تحتوي على رمز التفعيل لتأكيد اشتراكك.',
      pin_label:     'أدخل رمز التحقق المرسل إلى هاتفك',
      verify:        'تحقق وفعّل',
      resend:        'إعادة إرسال الرمز',
      success_title: '!أهلاً بك في الفريق',
      success_msg:   'اشتراكك في Gameonz نشط الآن. استعد لكأس العالم 2026 مع محتوى حصري ومكافآت يومية.',
      f1: 'ألعاب كأس العالم',
      f2: 'بطولات يومية',
      f3: 'مكافآت حصرية',
      toast_invalid_phone: 'أدخل رقماً صحيحاً مكوناً من 9 أرقام',
      toast_already_reg:   'هذا الرقم مسجل مسبقاً',
      toast_pin_error:     'رمز التحقق غير صحيح، حاول مرة أخرى',
      toast_network:       'خطأ في الشبكة، يرجى المحاولة مجدداً',
      toast_fail:          'حدث خطأ، يرجى المحاولة مجدداً',
      toast_resent:        'تم إعادة إرسال رمز التحقق!',
      toast_pin_length:    'أدخل الرمز المكون من 4 أرقام',
      phone_placeholder:   'XXXX XXX X5',
      wait:                'جاري التحميل...',
      lang_label:          'EN',
      detected_label:      'تم اكتشاف رقمك',
      not_my_number:       'ليس رقمي؟',
      sending_pin:         'جاري إرسال رمز التحقق إلى هاتفك...',
      exit_btn:            'خروج'
    },
    en: {
      hv_offer: 'EXCLUSIVE OFFER',
      hv_cta:   'Play Free Now',
      hv_meta:  '24 Hours Free · 1000+ Games',
      badge:         '⚽ FIFA WORLD CUP 2026 OFFER',
      headline:      'Play &bull; Win &bull; Celebrate',
      sub:           'Join millions of players and enjoy 1000+ exclusive games this FIFA World Cup 2026 season',
      phone_label:   'Enter your Etisalat UAE number',
      get_pin:       'START FREE TRIAL',
      urgency:       '⚡ Limited World Cup offer — Act now!',
      free_big:      '24 Hours FREE',
      free_sub:      'Then only AED 3.25/day',
      free_badge:    'FREE',
      pin_label_step2: 'Enter the code sent to your phone',
      top_bar:       'Free for 24 hours then 3.25 AED/Daily (VAT inclusive)',
      terms:         'Free for 24 hours then 3.25 AED/Daily (VAT inclusive). By clicking Subscribe, you will receive a message containing the activation code to confirm your subscription.',
      pin_label:     'Enter the code sent to your phone',
      verify:        'VERIFY & ACTIVATE',
      resend:        'Resend Code',
      success_title: "You're In The Team!",
      success_msg:   'Your Gameonz Pass is now active. Get ready for FIFA World Cup 2026 with exclusive content & daily rewards.',
      f1: 'World Cup Games',
      f2: 'Daily Tournaments',
      f3: 'Exclusive Rewards',
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
      sending_pin:         'Sending PIN to your phone...',
      exit_btn:            'Exit'
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
