(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var clickId = params.get('clickid') || params.get('click_id') || '';
  var requestId = '';
  var msisdn = '';

  var stepPhone = document.getElementById('step-phone');
  var stepPin = document.getElementById('step-pin');
  var stepSuccess = document.getElementById('step-success');

  var phoneInput = document.getElementById('phone');
  var pinInput = document.getElementById('pin');
  var btnRequest = document.getElementById('btn-request');
  var btnVerify = document.getElementById('btn-verify');
  var btnResend = document.getElementById('btn-resend');

  // Only allow digits in phone field
  phoneInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
  });

  // Only allow digits in PIN field
  pinInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
  });

  function showToast(msg) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { t.classList.add('show'); });
    });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 300);
    }, 3500);
  }

  function setLoading(btn, loading) {
    if (loading) {
      btn.disabled = true;
      btn.dataset.orig = btn.textContent;
      btn.textContent = 'Please wait...';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.orig || btn.textContent;
    }
  }

  function showStep(step) {
    stepPhone.classList.add('hidden');
    stepPin.classList.add('hidden');
    stepSuccess.classList.add('hidden');
    step.classList.remove('hidden');
  }

  btnRequest.addEventListener('click', function () {
    var raw = phoneInput.value.trim().replace(/\D/g, '');
    if (raw.length !== 9) {
      showToast('Please enter your 9-digit Etisalat number (e.g. 5X XXX XXXX).');
      return;
    }
    msisdn = '+971' + raw;

    setLoading(btnRequest, true);
    fetch('/api/request-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msisdn: msisdn, click_id: clickId })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          requestId = data.request_id;
          showStep(stepPin);
        } else if (data.error === 'already_registered') {
          showToast('This number is already registered.');
        } else {
          showToast('Could not send PIN. Please try again.');
        }
      })
      .catch(function () {
        showToast('Network error. Please try again.');
      })
      .finally(function () {
        setLoading(btnRequest, false);
      });
  });

  btnVerify.addEventListener('click', function () {
    var pin = pinInput.value.trim();
    if (!pin || pin.length !== 4) {
      showToast('Please enter the PIN sent to your phone.');
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
          showToast('Incorrect PIN. Please try again.');
          pinInput.value = '';
          pinInput.focus();
        } else {
          showToast('Verification failed. Please try again.');
        }
      })
      .catch(function () {
        showToast('Network error. Please try again.');
      })
      .finally(function () {
        setLoading(btnVerify, false);
      });
  });

  btnResend.addEventListener('click', function () {
    if (btnResend.disabled) return;
    var raw = msisdn.replace('+971', '');
    if (!raw) { showStep(stepPhone); return; }

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
          showToast('PIN resent!');
        } else {
          showToast('Could not resend PIN. Please try again.');
        }
      })
      .catch(function () {
        showToast('Network error. Please try again.');
      })
      .finally(function () {
        setLoading(btnResend, false);
      });
  });
}());
