# VittWise 💰 - Smart Tax Regime Calculator

> **Vitt (वित्त)** = Finance in Hindi | **Wise** = Smart

A simple, client-side tax calculator to compare **Old vs New Tax Regime** for **Individual Salaried Employees** for Financial Year 2026-27 (Assessment Year 2027-28).

## Live Demo

🌐 **Visit: https://devopsarts.github.io/VittWise/**

## Features

- **Compare Tax Regimes**: Instantly see which regime saves you more tax
- **All Major Deductions**: Supports HRA, 80C, 80D, 80CCD, 24(b), 80E, 80G
- **80CCD(2) in New Regime**: Employer NPS contribution correctly deducted in both regimes
- **Real-time Calculations**: No server required - all calculations in browser
- **Detailed Breakdown**: View slab-wise tax calculation
- **Mobile Responsive**: Works on all devices
- **Privacy Focused**: No data is stored or transmitted

## Supported Deductions

### Old Tax Regime
| Section | Deduction | Max Limit |
|---------|-----------|-----------|
| Standard Deduction | Flat deduction | ₹50,000 |
| HRA | House Rent Allowance | As per rules |
| 80C | EPF, PPF, ELSS, LIC, etc. | ₹1,50,000 |
| 24(b) | Home Loan Interest | ₹2,00,000 |
| 80CCD(1B) | Self NPS Contribution | ₹50,000 |
| 80CCD(2) | Employer NPS | 10% of Basic |
| 80D | Health Insurance | ₹25,000 / ₹50,000 |
| 80E | Education Loan Interest | No limit |
| 80G | Donations | As per rules |

### New Tax Regime
| Section | Deduction | Max Limit |
|---------|-----------|-----------|
| Standard Deduction | Flat deduction | ₹75,000 |
| 80CCD(2) | Employer NPS | 10% of Basic |

## Tax Slabs FY 2026-27

### Old Regime
| Income Slab | Tax Rate |
|-------------|----------|
| Up to ₹2.5L | Nil |
| ₹2.5L - ₹5L | 5% |
| ₹5L - ₹10L | 20% |
| Above ₹10L | 30% |

> Rebate u/s 87A: No tax if taxable income ≤ ₹5L

### New Regime (Budget 2025)
| Income Slab | Tax Rate |
|-------------|----------|
| Up to ₹4L | Nil |
| ₹4L - ₹8L | 5% |
| ₹8L - ₹12L | 10% |
| ₹12L - ₹16L | 15% |
| ₹16L - ₹20L | 20% |
| ₹20L - ₹24L | 25% |
| Above ₹24L | 30% |

> Rebate u/s 87A: No tax if taxable income ≤ ₹12L

## How to Deploy on GitHub Pages

1. Create a new repository on GitHub
2. Push these files to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Tax Calculator"
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
└── README.md       # This file
```

## Disclaimer

This calculator is for **informational and educational purposes only**. Tax laws are subject to change. Please consult a qualified tax professional or Chartered Accountant for accurate tax planning and filing.

## License

MIT License - Feel free to use and modify.
