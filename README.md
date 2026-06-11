# LogParser

A CLI log file analyzer. Grep patterns, get frequency counts, filter by time range, and generate summaries — faster than doing it manually with grep and awk.

Built this when I was trying to debug a server issue and kept having to write the same grep pipelines over and over. Decided to just make a proper tool for it.

## Usage

```bash
# Basic usage — analyze a log file
python logparser.py server.log

# Filter by pattern
python logparser.py server.log --grep "ERROR"

# Show top N most common lines
python logparser.py server.log --top 20

# Filter by time range (parses common log timestamp formats)
python logparser.py server.log --from "2024-01-15 10:00" --to "2024-01-15 11:00"

# Count occurrences of a pattern
python logparser.py server.log --count "status=5[0-9][0-9]"

# Extract and count specific fields (regex capture group)
python logparser.py server.log --extract "IP: ([0-9.]+)" --top-values 10

# Live tail with pattern filtering
python logparser.py server.log --tail --grep "ERROR"
```

## Supported log formats

Auto-detects:
- Apache/Nginx access logs
- Syslog format
- Python logging format
- Generic ISO timestamp format
- Falls back to treating each line as raw text

## Output example

```
File: server.log  (45,231 lines)
Time range: 2024-01-15 09:00:02 → 2024-01-15 23:59:58

Top patterns:
  ERROR  →  234 occurrences (0.52%)
  WARN   →  891 occurrences (1.97%)
  INFO   → 44106 occurrences (97.51%)

Top 5 IP addresses:
  192.168.1.45   →  1,203 requests
  10.0.0.12      →    891 requests
  ...
```

---

Python stdlib only. No external dependencies. Tested on Apache, Nginx, and Python app logs.
