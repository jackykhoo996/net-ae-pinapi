(function () {
  'use strict';

  var supabase = null;
  var allLeads = [];
  var PAGE_SIZE = 50;
  var currentPage = 1;

  function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function truncate(str, len) {
    str = String(str || '');
    return str.length > len ? escHtml(str.slice(0, len)) + '&hellip;' : escHtml(str);
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) +
      ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  function statusPill(status) {
    var cls = { converted: 'pill-converted', pending: 'pill-pending', failed: 'pill-failed' }[status] || 'pill-pending';
    return '<span class="pill ' + cls + '">' + escHtml(status) + '</span>';
  }

  function carrierPill(val) {
    if (!val) return '<span class="muted-dash">—</span>';
    var isErr = val.toUpperCase().indexOf('ERROR') === 0;
    return '<span class="pill ' + (isErr ? 'pill-failed' : 'pill-converted') + ' pill-sm">' + escHtml(val) + '</span>';
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  fetch('/api/config')
    .then(function (r) { return r.json(); })
    .then(function (cfg) {
      if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) throw new Error('Missing Supabase config');
      supabase = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      loadLeads();
    })
    .catch(function (err) {
      console.error('Config error:', err);
      renderError('Could not load configuration. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set.');
    });

  // Inject Supabase JS from CDN
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  script.onload = function () { /* fetch('/api/config') already called above — supabase global now available */ };
  document.head.appendChild(script);

  // ── Data ─────────────────────────────────────────────────────────────────────
  function loadLeads() {
    var status = document.getElementById('filter-status').value;
    var from   = document.getElementById('filter-date-from').value;
    var to     = document.getElementById('filter-date-to').value;

    document.getElementById('leads-tbody').innerHTML = '<tr><td colspan="8" class="loading">Loading...</td></tr>';

    var query = supabase
      .from('leads')
      .select('id, msisdn, click_id, request_id, status, created_at, converted_at, carrier_req_status, carrier_ver_status')
      .order('created_at', { ascending: false })
      .limit(2000);

    if (status) query = query.eq('status', status);
    if (from)   query = query.gte('created_at', from + 'T00:00:00Z');
    if (to)     query = query.lte('created_at', to   + 'T23:59:59Z');

    query.then(function (res) {
      if (res.error) {
        console.error('Supabase query error:', res.error);
        renderError('Failed to load leads: ' + res.error.message);
        return;
      }
      allLeads = res.data || [];
      currentPage = 1;
      renderStats(allLeads);
      renderTable(allLeads, currentPage);
      renderPagination(allLeads.length);
      loadPostbackStatus(allLeads.map(function (l) { return l.id; }));
    });
  }

  function loadPostbackStatus(leadIds) {
    if (!leadIds.length) return;
    supabase
      .from('postback_logs')
      .select('lead_id, success')
      .in('lead_id', leadIds)
      .then(function (res) {
        if (res.error || !res.data) return;
        var map = {};
        res.data.forEach(function (row) { map[row.lead_id] = row.success; });
        // Update dots in table
        allLeads.forEach(function (lead, i) {
          var cell = document.getElementById('pb-' + lead.id);
          if (!cell) return;
          if (map[lead.id] === undefined) { cell.innerHTML = '<span class="dot dot-none" title="No postback"></span>'; return; }
          cell.innerHTML = map[lead.id]
            ? '<span class="dot dot-ok" title="Postback OK"></span>'
            : '<span class="dot dot-fail" title="Postback failed"></span>';
        });
      });
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  function renderStats(leads) {
    var total = leads.length;
    var conv  = leads.filter(function (l) { return l.status === 'converted'; }).length;
    var pend  = leads.filter(function (l) { return l.status === 'pending'; }).length;
    var fail  = leads.filter(function (l) { return l.status === 'failed'; }).length;
    var cvr   = total ? ((conv / total) * 100).toFixed(1) : '0.0';

    document.getElementById('stat-total').textContent     = total;
    document.getElementById('stat-converted').textContent = conv;
    document.getElementById('stat-pending').textContent   = pend;
    document.getElementById('stat-failed').textContent    = fail;
    document.getElementById('stat-cvr').textContent       = cvr + '%';
  }

  function renderTable(leads, page) {
    var start = (page - 1) * PAGE_SIZE;
    var slice = leads.slice(start, start + PAGE_SIZE);
    var tbody = document.getElementById('leads-tbody');

    if (!slice.length) {
      tbody.innerHTML = '<tr><td colspan="10" class="empty">No leads found.</td></tr>';
      return;
    }

    var html = '';
    slice.forEach(function (r, i) {
      var rowNum = start + i + 1;
      html +=
        '<tr>' +
        '<td>' + rowNum + '</td>' +
        '<td>' + formatDate(r.created_at) + '</td>' +
        '<td>' + escHtml(r.msisdn || '') + '</td>' +
        '<td title="' + escHtml(r.click_id || '') + '">' + truncate(r.click_id, 16) + '</td>' +
        '<td title="' + escHtml(r.request_id || '') + '">' + truncate(r.request_id, 12) + '</td>' +
        '<td>' + statusPill(r.status) + '</td>' +
        '<td>' + carrierPill(r.carrier_req_status) + '</td>' +
        '<td>' + carrierPill(r.carrier_ver_status) + '</td>' +
        '<td>' + formatDate(r.converted_at) + '</td>' +
        '<td id="pb-' + escHtml(r.id) + '"><span class="dot dot-none" title="Loading..."></span></td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function renderError(msg) {
    document.getElementById('leads-tbody').innerHTML =
      '<tr><td colspan="10" class="error">' + escHtml(msg) + '</td></tr>';
  }

  function renderPagination(total) {
    var pages = Math.ceil(total / PAGE_SIZE);
    var el = document.getElementById('pagination');
    if (pages <= 1) { el.innerHTML = ''; return; }

    var html = '';
    for (var p = 1; p <= pages; p++) {
      html += '<button class="page-btn' + (p === currentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
    }
    el.innerHTML = html;

    el.querySelectorAll('.page-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentPage = parseInt(this.dataset.page, 10);
        renderTable(allLeads, currentPage);
        renderPagination(allLeads.length);
      });
    });
  }

  // ── Export CSV ────────────────────────────────────────────────────────────────
  function exportCsv() {
    var headers = ['#', 'Date', 'MSISDN', 'Click ID', 'Request ID', 'Status', 'PIN Req', 'PIN Ver', 'Converted At'];
    var rows = allLeads.map(function (r, i) {
      return [
        i + 1,
        r.created_at || '',
        r.msisdn || '',
        r.click_id || '',
        r.request_id || '',
        r.status || '',
        r.carrier_req_status || '',
        r.carrier_ver_status || '',
        r.converted_at || ''
      ].map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
    });
    var csv = [headers.join(',')].concat(rows).join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'mvas-leads-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Event listeners ──────────────────────────────────────────────────────────
  document.getElementById('btn-apply').addEventListener('click', function () {
    if (!supabase) return;
    currentPage = 1;
    loadLeads();
  });

  document.getElementById('btn-reset').addEventListener('click', function () {
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value = '';
    if (!supabase) return;
    currentPage = 1;
    loadLeads();
  });

  document.getElementById('btn-refresh').addEventListener('click', function () {
    if (!supabase) return;
    loadLeads();
  });

  document.getElementById('btn-export').addEventListener('click', exportCsv);
}());
