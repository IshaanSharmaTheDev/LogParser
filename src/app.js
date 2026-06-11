(function () {
  'use strict';
  let allEntries = [];
  const SAMPLE = `2024-01-15T09:00:01 INFO Server started on port 3000
2024-01-15T09:00:05 INFO Database connected: mongodb://localhost:27017
2024-01-15T09:01:22 192.168.1.10 - GET /api/users 200 1234
2024-01-15T09:01:23 192.168.1.11 - POST /api/login 401 89
2024-01-15T09:02:00 ERROR Failed to load config: ENOENT /etc/app/config.json
2024-01-15T09:02:05 WARN Retry attempt 1/3 for job queue
2024-01-15T09:03:11 192.168.1.10 - GET /api/orders 500 0
2024-01-15T09:03:12 FATAL Out of memory: kill process 1234
2024-01-15T09:03:15 DEBUG Cache miss for key: user_profile_42
2024-01-15T09:04:00 INFO Backup completed: 12345 records
2024-01-15T09:05:00 ERROR DB query timeout after 5000ms SELECT * FROM orders`;

  function process(text) {
    allEntries = LogParser.parse(text);
    renderStats();
    renderEntries(allEntries);
  }

  function renderStats() {
    const s = LogParser.getStats(allEntries);
    const statsEl = document.getElementById('stats-bar');
    const levelColors = {ERROR:'#f44336',WARN:'#ff9800',INFO:'#4caf50',DEBUG:'#2196f3',FATAL:'#9c27b0'};
    statsEl.innerHTML = Object.entries(s.levels).map(([l, c]) =>
      `<span class="stat-badge" style="background:${levelColors[l]||'#888'}20;color:${levelColors[l]||'#888'};border:1px solid ${levelColors[l]||'#888'}40">${l}: ${c}</span>`
    ).join('') + `<span class="stat-total">Total: ${s.total}</span>`;

    // Top IPs
    const topIPs = Object.entries(s.ips).sort((a,b)=>b[1]-a[1]).slice(0,5);
    document.getElementById('top-ips').innerHTML = topIPs.length
      ? topIPs.map(([ip, c]) => `<span class="ip-badge">${ip} (${c})</span>`).join('') : '<span style="color:#555">—</span>';
  }

  function renderEntries(entries) {
    const levelColors = {ERROR:'#f44336',WARN:'#ff9800',INFO:'#4caf50',DEBUG:'#2196f3',FATAL:'#9c27b0',TRACE:'#607d8b'};
    const container = document.getElementById('log-entries');
    if (!entries.length) { container.innerHTML = '<div class="no-log">No entries to show</div>'; return; }
    container.innerHTML = entries.map(e =>
      `<div class="log-entry level-${e.level.toLowerCase()}">
        <span class="entry-num">${e.idx + 1}</span>
        <span class="entry-level" style="color:${levelColors[e.level]||'#aaa'}">${e.level}</span>
        ${e.timestamp ? `<span class="entry-ts">${e.timestamp}</span>` : ''}
        ${e.ip ? `<span class="entry-ip">${e.ip}</span>` : ''}
        ${e.status ? `<span class="entry-status status-${Math.floor(e.status/100)}">${e.status}</span>` : ''}
        <span class="entry-msg">${esc(e.message)}</span>
      </div>`
    ).join('');
  }

  function applyFilter() {
    const level = document.getElementById('filter-level').value;
    const search = document.getElementById('filter-search').value;
    const filtered = LogParser.filter(allEntries, { level, search });
    renderEntries(filtered);
    document.getElementById('filter-count').textContent = `${filtered.length}/${allEntries.length}`;
  }

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function init() {
    document.getElementById('log-input').addEventListener('input', function() { process(this.value); });
    document.getElementById('btn-sample').addEventListener('click', () => { document.getElementById('log-input').value = SAMPLE; process(SAMPLE); });
    document.getElementById('btn-clear').addEventListener('click', () => { document.getElementById('log-input').value = ''; allEntries = []; document.getElementById('log-entries').innerHTML = ''; document.getElementById('stats-bar').innerHTML = ''; });
    document.getElementById('filter-level').addEventListener('change', applyFilter);
    document.getElementById('filter-search').addEventListener('input', applyFilter);
    document.getElementById('btn-export').addEventListener('click', () => {
      const lines = allEntries.map(e => e.raw).join('\n');
      const blob = new Blob([lines], {type:'text/plain'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'filtered.log'; a.click();
    });
  }
  document.addEventListener('DOMContentLoaded', init);
})();
