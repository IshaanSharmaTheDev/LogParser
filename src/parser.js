const LogParser = (() => {
  const PATTERNS = {
    nginx: /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([^"]+)"\s+(\d+)\s+(\d+)/,
    apache: /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([^"]+)"\s+(\d+)\s+(\d+)/,
    syslog: /^(\w+ \d+ \d+:\d+:\d+)\s+(\S+)\s+([^:]+):\s*(.*)/,
    json: null,
    custom: null,
  };
  const LEVEL_RE = /\b(ERROR|WARN|WARNING|INFO|DEBUG|FATAL|CRITICAL|TRACE)\b/i;
  const IP_RE = /\b(\d{1,3}\.){3}\d{1,3}\b/;
  const TIMESTAMP_RE = /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/;
  const HTTP_STATUS_RE = /\b([1-5]\d{2})\b/;

  function parse(text) {
    const lines = text.split('\n').filter(l => l.trim());
    return lines.map((line, i) => parseLine(line, i));
  }

  function parseLine(line, idx) {
    const entry = { idx, raw: line, level: null, timestamp: null, ip: null, status: null, message: line };
    const lvl = line.match(LEVEL_RE);
    if (lvl) entry.level = lvl[1].toUpperCase();
    const ts = line.match(TIMESTAMP_RE);
    if (ts) entry.timestamp = ts[0];
    const ip = line.match(IP_RE);
    if (ip) entry.ip = ip[0];
    const hs = line.match(HTTP_STATUS_RE);
    if (hs) entry.status = parseInt(hs[1]);
    // Try JSON
    try {
      const j = JSON.parse(line);
      entry.level = (j.level || j.severity || entry.level || 'INFO').toUpperCase();
      entry.message = j.message || j.msg || line;
      entry.timestamp = j.timestamp || j.time || entry.timestamp;
      entry.json = j;
    } catch(e) {}
    if (!entry.level) {
      if (/error/i.test(line)) entry.level = 'ERROR';
      else if (/warn/i.test(line)) entry.level = 'WARN';
      else entry.level = 'INFO';
    }
    return entry;
  }

  function getStats(entries) {
    const levels = {};
    const statusCodes = {};
    const ips = {};
    entries.forEach(e => {
      levels[e.level] = (levels[e.level] || 0) + 1;
      if (e.status) statusCodes[e.status] = (statusCodes[e.status] || 0) + 1;
      if (e.ip) ips[e.ip] = (ips[e.ip] || 0) + 1;
    });
    return { levels, statusCodes, ips, total: entries.length };
  }

  function filter(entries, opts) {
    return entries.filter(e => {
      if (opts.level && opts.level !== 'ALL' && e.level !== opts.level) return false;
      if (opts.search && !e.raw.toLowerCase().includes(opts.search.toLowerCase())) return false;
      if (opts.ip && e.ip !== opts.ip) return false;
      return true;
    });
  }

  return { parse, getStats, filter };
})();
