## 🚀 Live Demo: [LogParser](https://ishaansharmathedev.github.io/LogParser/)

> Try it in your browser: **[https://ishaansharmathedev.github.io/LogParser/](https://ishaansharmathedev.github.io/LogParser/)**

# LogParser

A browser-based log file parser that handles Nginx, Apache, syslog, JSON logs, and custom formats.

## Features
- **Auto-detection** — identifies log level, timestamp, IP, HTTP status code per line
- **JSON log support** — parses structured JSON log lines
- **Level filter** — filter by ERROR, WARN, INFO, DEBUG, FATAL
- **Live search** — instant text filter across all entries
- **Stats bar** — breakdown by log level with color badges
- **Top IPs** — most active IP addresses
- **Color-coded rows** — ERROR/FATAL rows highlighted
- **Export** — download filtered results as .log file

## Structure
```
src/parser.js   # Line parser, regex patterns, stats, filter
src/app.js      # UI, rendering, search, export
```

## License
MIT
