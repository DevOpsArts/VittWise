# VittWise ₹ - Smart Financial Calculator Suite

> **Vitt (वित्त)** = Finance in Hindi | **Wise** = Smart

A comprehensive, client-side financial calculator suite for Indian users. Compare tax regimes, plan investments, estimate EMIs, and more — all calculations run locally in your browser with zero data tracking.

## Live Demo

🌐 **Visit: https://devopsarts.github.io/VittWise/**

## Calculators

| # | Calculator | Description |
|---|-----------|-------------|
| 1 | **Tax Regime Comparator** | Old vs New regime comparison for FY 2023-24 to FY 2026-27 |
| 2 | **SIP Calculator** | Systematic Investment Plan returns with wealth gain breakdown |
| 3 | **FD / RD Calculator** | Fixed & Recurring Deposit maturity with interest calculation |
| 4 | **PPF Calculator** | Public Provident Fund projections over 15+ years |
| 5 | **HRA Exemption** | Calculate HRA exemption under Section 10(13A) |
| 6 | **Home Loan EMI** | EMI, total interest, amortization with pie chart |
| 7 | **Personal Loan EMI** | EMI breakdown with principal vs interest split |
| 8 | **Car Loan EMI** | Auto loan EMI with visual breakdown |
| 9 | **Lumpsum Calculator** | One-time investment growth projections |
| 10 | **Rent vs Buy** | Compare renting vs buying a house over time |
| 11 | **Retirement Planner** | Estimate retirement corpus needed based on expenses |
| 12 | **EPF Calculator** | Employee Provident Fund maturity with employer contribution |
| 13 | **NPS Calculator** | National Pension System corpus and annuity estimate |
| 14 | **Inflation Calculator** | Future value of money adjusted for inflation |
| 15 | **Capital Gains** | STCG/LTCG tax on equity, debt, and property |
| 16 | **Gratuity Calculator** | Old structure vs New Labour Code comparison |

## Features

### Home Page
- **Search Bar**: Instantly filter and find any calculator
- **Card Grid**: Visual navigation with icons for all 16 calculators
- **VittWise Logo**: Hidden on home page; shown on calculator pages as a back-to-home button

### Interactive Pie Charts
- **Donut charts** on 9 calculators (loans, SIP, FD/RD, PPF, Lumpsum, EPF, NPS)
- **3D hover effect**: Slices explode outward with shadow on hover
- **Center tooltip**: Shows value and percentage on hover
- **Unique color schemes**: Each calculator has its own distinct color palette
- Built with pure Canvas 2D API — no external chart library

### Tax Calculator
- **Multi-FY Support**: Switch between FY 2026-27, FY 2025-26, FY 2024-25, and FY 2023-24
- **Compare Tax Regimes**: Instantly see which regime saves you more tax
- **Age Group Aware**: Correct slabs for Below 60 / Senior Citizen (60-79) / Super Senior Citizen (80+)
- **All Major Deductions**: HRA, 80C, 80D, 80CCD(1B), 80CCD(2), 24(b), 80E, 80G
- **Employer Type**: Separate 80CCD(2) limits — 10% (Private/PSU) vs 14% (Govt) in old regime; 14% for all in new regime
- **Surcharge Calculation**: Full surcharge with marginal relief at ₹50L, ₹1Cr, ₹2Cr, ₹5Cr thresholds

### General
- **CSV Export**: Download results as Excel-compatible CSV (UTF-8 with BOM)
- **Decimal Inputs**: Supports paisa-level precision in all fields
- **Privacy Popup**: Bottom popup on first visit confirming no data is tracked (dismissible, remembered via localStorage)
- **Real-time Calculations**: No server required — 100% client-side
- **Mobile Responsive**: Works on all devices

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
├── index.html      # Home page + all 16 calculator panels
├── styles.css      # Styling (home grid, pie charts, popups, responsive)
├── script.js       # All calculator logic, pie charts, panel switching
├── assets/         # Icons and images
└── README.md       # This file
```

## Disclaimer

This calculator is for **informational and educational purposes only**. Tax laws are subject to change. Please consult a qualified tax professional or Chartered Accountant for accurate tax planning and filing.

## License

MIT License - Feel free to use and modify.

