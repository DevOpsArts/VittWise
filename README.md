# VittWise 💰 - Smart Tax Regime Calculator

> **Vitt (वित्त)** = Finance in Hindi | **Wise** = Smart

A simple, client-side tax calculator to compare **Old vs New Tax Regime** for **Individual Salaried Employees**. Supports Financial Years 2023-24 through 2026-27 with accurate slabs per official Income Tax Department rules.

## Live Demo

🌐 **Visit: https://devopsarts.github.io/VittWise/**

## Features

- **Multi-FY Support**: Switch between FY 2026-27, FY 2025-26, FY 2024-25, and FY 2023-24
- **Compare Tax Regimes**: Instantly see which regime saves you more tax
- **Age Group Aware**: Correct slabs for Below 60 / Senior Citizen (60-79) / Super Senior Citizen (80+)
- **All Major Deductions**: HRA, 80C, 80D, 80CCD(1B), 80CCD(2), 24(b), 80E, 80G
- **Employer Type**: Separate 80CCD(2) limits — 10% (Private/PSU) vs 14% (Govt) in old regime; 14% for all in new regime
- **Surcharge Calculation**: Full surcharge with marginal relief at ₹50L, ₹1Cr, ₹2Cr, ₹5Cr thresholds
- **Gratuity Calculator**: Compare old vs new Labour Code structure (Basic vs Wages)
- **CSV Export**: Download results as Excel-compatible CSV (UTF-8 with BOM)
- **Decimal Inputs**: Supports paisa-level precision in all fields
- **Real-time Calculations**: No server required — all calculations in browser
- **Mobile Responsive**: Works on all devices
- **Privacy Focused**: No data is stored or transmitted

## Supported Deductions

### Old Tax Regime
| Section | Deduction | Max Limit |
|---------|-----------|-----------|
| Standard Deduction | Flat deduction | ₹50,000 |
| HRA | House Rent Allowance | As per rules (metro/non-metro) |
| 80C | EPF, PPF, ELSS, LIC, Home Loan Principal, Tuition Fees | ₹1,50,000 |
| 24(b) | Home Loan Interest (self-occupied) | ₹2,00,000 |
| 80CCD(1B) | Self NPS Contribution (additional) | ₹50,000 |
| 80CCD(2) | Employer NPS — Private/PSU | 10% of Basic |
| 80CCD(2) | Employer NPS — Central/State Govt | 14% of Basic |
| 80D | Health Insurance — Self & Family | ₹25,000 (₹50,000 if Senior Citizen) |
| 80D | Health Insurance — Parents | ₹25,000 (₹50,000 if Senior Citizen) |
| 80E | Education Loan Interest | No limit |
| 80G | Donations (enter post-50%/100% eligible amount) | As per rules |

### New Tax Regime
| Section | Deduction | Max Limit |
|---------|-----------|-----------|
| Standard Deduction | Flat deduction | ₹75,000 |
| 80CCD(2) | Employer NPS — All employers | 14% of Basic |

## Tax Slabs

### Old Regime (all FYs)
| Age Group | Nil Slab | 5% | 20% | 30% |
|-----------|----------|----|-----|-----|
| Below 60 | Up to ₹2.5L | ₹2.5L–5L | ₹5L–10L | Above ₹10L |
| Senior (60-79) | Up to ₹3L | ₹3L–5L | ₹5L–10L | Above ₹10L |
| Super Senior (80+) | Up to ₹5L | — | ₹5L–10L | Above ₹10L |

> Rebate u/s 87A: No tax if taxable income ≤ ₹5L (max ₹12,500). Hard cliff — no marginal relief at this boundary.

### New Regime Slabs by FY

| Slab | FY 2026-27 & 2025-26 | FY 2024-25 | FY 2023-24 |
|------|----------------------|------------|------------|
| Nil | Up to ₹4L | Up to ₹3L | Up to ₹3L |
| 5% | ₹4L–8L | ₹3L–7L | ₹3L–6L |
| 10% | ₹8L–12L | ₹7L–10L | ₹6L–9L |
| 15% | ₹12L–16L | ₹10L–12L | ₹9L–12L |
| 20% | ₹16L–20L | ₹12L–15L | ₹12L–15L |
| 25% | ₹20L–24L | — | — |
| 30% | Above ₹24L | Above ₹15L | Above ₹15L |

| FY | 87A Rebate | Std Deduction |
|----|-----------|---------------|
| FY 2026-27 & 2025-26 | ₹0 tax if income ≤ ₹12L (max ₹60,000) | ₹75,000 |
| FY 2024-25 | ₹0 tax if income ≤ ₹7L (max ₹25,000) | ₹75,000 |
| FY 2023-24 | ₹0 tax if income ≤ ₹7L (max ₹25,000) | ₹50,000 |

## Surcharge Rates (both regimes)

| Net Income | Surcharge Rate |
|------------|---------------|
| Up to ₹50L | Nil |
| ₹50L – ₹1Cr | 10% |
| ₹1Cr – ₹2Cr | 15% |
| ₹2Cr – ₹5Cr | 25% |
| Above ₹5Cr (New) | 25% |
| Above ₹5Cr (Old) | 37% |

> Marginal relief applies at each surcharge threshold.

## Gratuity Calculator

Compares gratuity under:
- **Old Structure**: `15/26 × Monthly Basic × Years of Service`
- **New Labour Code** (effective Nov 2025): `15/26 × Monthly Wages (Basic + Cash Allowances) × Years of Service`

## How to Deploy on GitHub Pages

1. Create a new repository on GitHub
2. Push these files to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - VittWise"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/VittWise.git
   git push -u origin main
   ```
3. Go to Repository **Settings** → **Pages**
4. Under "Source", select **main** branch
5. Click **Save**
6. Your site will be live at `https://YOUR_USERNAME.github.io/VittWise/`

## Files

```
VittWise/
├── index.html      # Main HTML page
├── styles.css      # Styling
├── script.js       # Tax calculation logic
├── assets/         # Icons and images
└── README.md       # This file
```

## Disclaimer

This calculator is for **informational and educational purposes only**. Tax laws are subject to change. Please consult a qualified tax professional or Chartered Accountant for accurate tax planning and filing.

## License

MIT License - Feel free to use and modify.

