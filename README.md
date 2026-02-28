# Roseville 95661 Refinance Tracker Website

A lightweight website for tracking Roseville ZIP 95661 refinance trends and estimating principal-and-interest payments.

## Features

- Roseville 95661-focused 30-year refinance rate display
- Refinance payment estimator with defaults for a $150,000 loan amount
- Principal-and-interest-only monthly estimate (property tax and insurance excluded)
- Six-point trend chart with real date labels (month/day) instead of generic week numbers
- Scheduled client-side data pull windows at 7:00 AM and 5:00 PM daily (demo simulation)
- Live payment status message showing the current estimated payment at the current rate

## Run locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.
