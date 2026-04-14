// Tax Regime Calculator - FY 2026-27
// SECURITY_NOTE: All calculations are performed client-side. No sensitive data is transmitted.

// ============ FY CONFIGURATION ============
const FY_CONFIG = {
    fy2026: {
        label: 'FY 2026-27', ayLabel: 'AY 2027-28',
        stdDeductionNew: 75000,
        rebate87ANew: { limit: 1200000, max: 60000 },
        newSlabs: [
            { upper: 400000,  rate: 0.00, label: '0 – 4L' },
            { upper: 800000,  rate: 0.05, label: '4L – 8L' },
            { upper: 1200000, rate: 0.10, label: '8L – 12L' },
            { upper: 1600000, rate: 0.15, label: '12L – 16L' },
            { upper: 2000000, rate: 0.20, label: '16L – 20L' },
            { upper: 2400000, rate: 0.25, label: '20L – 24L' },
            { upper: Infinity, rate: 0.30, label: 'Above 24L' }
        ]
    },
    fy2025: {
        label: 'FY 2025-26', ayLabel: 'AY 2026-27',
        stdDeductionNew: 75000,
        rebate87ANew: { limit: 1200000, max: 60000 },
        newSlabs: [
            { upper: 400000,  rate: 0.00, label: '0 – 4L' },
            { upper: 800000,  rate: 0.05, label: '4L – 8L' },
            { upper: 1200000, rate: 0.10, label: '8L – 12L' },
            { upper: 1600000, rate: 0.15, label: '12L – 16L' },
            { upper: 2000000, rate: 0.20, label: '16L – 20L' },
            { upper: 2400000, rate: 0.25, label: '20L – 24L' },
            { upper: Infinity, rate: 0.30, label: 'Above 24L' }
        ]
    },
    fy2024: {
        label: 'FY 2024-25', ayLabel: 'AY 2025-26',
        stdDeductionNew: 75000,
        rebate87ANew: { limit: 700000, max: 25000 },
        newSlabs: [
            { upper: 300000,  rate: 0.00, label: '0 – 3L' },
            { upper: 700000,  rate: 0.05, label: '3L – 7L' },
            { upper: 1000000, rate: 0.10, label: '7L – 10L' },
            { upper: 1200000, rate: 0.15, label: '10L – 12L' },
            { upper: 1500000, rate: 0.20, label: '12L – 15L' },
            { upper: Infinity, rate: 0.30, label: 'Above 15L' }
        ]
    },
    fy2023: {
        label: 'FY 2023-24', ayLabel: 'AY 2024-25',
        stdDeductionNew: 50000,
        rebate87ANew: { limit: 700000, max: 25000 },
        newSlabs: [
            { upper: 300000,  rate: 0.00, label: '0 – 3L' },
            { upper: 600000,  rate: 0.05, label: '3L – 6L' },
            { upper: 900000,  rate: 0.10, label: '6L – 9L' },
            { upper: 1200000, rate: 0.15, label: '9L – 12L' },
            { upper: 1500000, rate: 0.20, label: '12L – 15L' },
            { upper: Infinity, rate: 0.30, label: 'Above 15L' }
        ]
    }
};

let selectedFY = 'fy2026';

function switchFY(fyKey) {
    selectedFY = fyKey;
    const cfg = FY_CONFIG[fyKey];
    document.querySelectorAll('.fy-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-fy="${fyKey}"]`).classList.add('active');
    document.getElementById('fySubtitle').textContent =
        `Smart Tax Regime Comparison for ${cfg.label} (${cfg.ayLabel})`;
    document.getElementById('ageGroupFYLabel').textContent = cfg.label;
    // hide results when switching FY
    document.getElementById('results').style.display = 'none';
}

// Close announcement bar
function closeAnnouncement() {
    document.getElementById('announcementBar').classList.add('hidden');
}

// Tab Switching Function
function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabId).classList.add('active');
    
    // Add active class to clicked button
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('taxForm');
    const hraInput = document.getElementById('hra');
    const hraSection = document.getElementById('hraSection');
    
    // Show/hide HRA section based on HRA input
    hraInput.addEventListener('input', function() {
        const hraValue = parseFloat(this.value) || 0;
        hraSection.style.display = hraValue > 0 ? 'block' : 'none';
        updateTotalCtc();
    });
    
    // Update Total CTC in real-time
    const ctcInputs = ['basicSalary', 'hra', 'allowances', 'otherIncome', 'employerPf', 'gratuity', 'employerNps'];
    ctcInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', updateTotalCtc);
    });
    
    // Update 80C total in real-time
    const section80CInputs = ['epf', 'ppf', 'childEducation', 'homeLoanPrincipal'];
    section80CInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', update80CTotal);
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateTax();
    });
});

function updateTotalCtc() {
    const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
    const hra = parseFloat(document.getElementById('hra').value) || 0;
    const allowances = parseFloat(document.getElementById('allowances').value) || 0;
    const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;
    const employerPf = parseFloat(document.getElementById('employerPf').value) || 0;
    const gratuity = parseFloat(document.getElementById('gratuity').value) || 0;
    const employerNps = parseFloat(document.getElementById('employerNps').value) || 0;
    
    const totalCtc = basicSalary + hra + allowances + otherIncome + employerPf + gratuity + employerNps;
    
    document.getElementById('totalCtc').textContent = `Total CTC: ₹${formatNumber(totalCtc)}`;
}

function update80CTotal() {
    const epf = parseFloat(document.getElementById('epf').value) || 0;
    const ppf = parseFloat(document.getElementById('ppf').value) || 0;
    const childEdu = parseFloat(document.getElementById('childEducation').value) || 0;
    const homeLoanPrincipal = parseFloat(document.getElementById('homeLoanPrincipal').value) || 0;
    
    const total = epf + ppf + childEdu + homeLoanPrincipal;
    const eligible = Math.min(total, 150000);
    
    document.getElementById('total80c').textContent = 
        `Total 80C: ₹${formatNumber(total)} (Eligible: ₹${formatNumber(eligible)})`;
}

function getInputValue(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}

function formatNumber(num) {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatCurrency(num) {
    return '₹' + formatNumber(num);
}

function calculateTax() {
    // Get all input values
    const basicSalary = getInputValue('basicSalary');
    const hra = getInputValue('hra');
    const allowances = getInputValue('allowances');
    const otherIncome = getInputValue('otherIncome');
    const employerNps = getInputValue('employerNps');
    
    // HRA details
    const rentPaid = getInputValue('rentPaid');
    const isMetro = document.getElementById('metroCity').value === 'yes';
    
    // Section 80C
    const epf = getInputValue('epf');
    const ppf = getInputValue('ppf');
    const childEducation = getInputValue('childEducation');
    const homeLoanPrincipal = getInputValue('homeLoanPrincipal');
    
    // Age group and 80D self limit
    const ageGroup = document.getElementById('ageGroup').value;
    
    // Other deductions
    const homeLoanInterest = getInputValue('homeLoanInterest');
    const selfNps = getInputValue('selfNps');
    const healthInsuranceSelf = getInputValue('healthInsuranceSelf');
    const healthInsuranceParents = getInputValue('healthInsuranceParents');
    const parentsSenior = document.getElementById('parentsSenior').checked;
    const section80E = getInputValue('section80E');
    const section80G = getInputValue('section80G');
    
    // Calculate Gross Income
    const grossIncome = basicSalary + hra + allowances + otherIncome;
    
    // Calculate HRA Exemption (Old Regime only)
    let hraExemption = 0;
    if (hra > 0 && rentPaid > 0) {
        const hraReceived = hra;
        const rentMinus10Basic = rentPaid - (0.10 * basicSalary);
        const percentOfBasic = isMetro ? (0.50 * basicSalary) : (0.40 * basicSalary);
        hraExemption = Math.max(0, Math.min(hraReceived, rentMinus10Basic, percentOfBasic));
    }
    
    // Calculate Section 80C (capped at 1.5L)
    const total80C = epf + ppf + childEducation + homeLoanPrincipal;
    const eligible80C = Math.min(total80C, 150000);
    
    // Section 24(b) - Home Loan Interest (capped at 2L)
    const eligible24b = Math.min(homeLoanInterest, 200000);
    
    // Section 80CCD(1B) - Self NPS (capped at 50K)
    const eligible80CCD1B = Math.min(selfNps, 50000);
    
    // Section 80CCD(2) - Employer NPS
    // OLD REGIME: 10% of Basic for Private/PSU, 14% for Central/State Govt
    // NEW REGIME: 14% for ALL employer types (per official IT rules AY 2026-27)
    const employerType = document.getElementById('employerType').value;
    const npsCapRateOld = employerType === 'govt' ? 0.14 : 0.10;
    const eligible80CCD2Old = Math.min(employerNps, basicSalary * npsCapRateOld);
    const eligible80CCD2New = Math.min(employerNps, basicSalary * 0.14);
    
    // Section 80D - Health Insurance
    // Self/family limit: ₹50,000 if taxpayer is Senior Citizen (60+), else ₹25,000
    const maxSelf80D = (ageGroup === 'senior' || ageGroup === 'super_senior') ? 50000 : 25000;
    const eligible80DSelf = Math.min(healthInsuranceSelf, maxSelf80D);
    const maxParents = parentsSenior ? 50000 : 25000;
    const eligible80DParents = Math.min(healthInsuranceParents, maxParents);
    const eligible80D = eligible80DSelf + eligible80DParents;
    
    // Standard Deduction — use FY config for new regime
    const fyConfig = FY_CONFIG[selectedFY];
    const stdDeductionOld = 50000;
    const stdDeductionNew = fyConfig.stdDeductionNew;
    
    // ============ OLD REGIME CALCULATION ============
    const totalDeductionsOld = stdDeductionOld + hraExemption + eligible80C + eligible24b + 
                               eligible80CCD1B + eligible80CCD2Old + eligible80D + section80E + section80G;
    
    const taxableIncomeOld = Math.max(0, grossIncome - totalDeductionsOld);
    const taxOld = calculateOldRegimeTax(taxableIncomeOld, ageGroup);
    const surchargeOld = calculateSurcharge(taxableIncomeOld, taxOld, 'old', ageGroup);
    const cessOld = (taxOld + surchargeOld) * 0.04;
    const totalTaxOld = taxOld + surchargeOld + cessOld;
    
    // ============ NEW REGIME CALCULATION ============
    // 80CCD(2) employer NPS allowed in new regime at 14% for all employer types
    const totalDeductionsNew = stdDeductionNew + eligible80CCD2New;
    const taxableIncomeNew = Math.max(0, grossIncome - totalDeductionsNew);
    const taxNew = calculateNewRegimeTax(taxableIncomeNew, fyConfig);
    const surchargeNew = calculateSurcharge(taxableIncomeNew, taxNew, 'new', ageGroup);
    const cessNew = (taxNew + surchargeNew) * 0.04;
    const totalTaxNew = taxNew + surchargeNew + cessNew;
    
    // ============ DISPLAY RESULTS ============
    displayResults({
        grossIncome,
        totalDeductionsOld,
        taxableIncomeOld,
        taxOld,
        surchargeOld,
        cessOld,
        totalTaxOld,
        taxableIncomeNew,
        taxNew,
        surchargeNew,
        cessNew,
        totalTaxNew,
        stdDeductionNew,
        ageGroup,
        fyLabel: fyConfig.label,
        ayLabel: fyConfig.ayLabel,
        fyConfig,
        newRegimeNps: eligible80CCD2New,
        deductions: {
            stdDeduction: stdDeductionOld,
            hraExemption,
            eligible80C,
            eligible24b,
            eligible80CCD1B,
            eligible80CCD2: eligible80CCD2Old,
            eligible80D,
            section80E,
            section80G
        }
    });
}

function calculateOldRegimeTax(income, ageGroup) {
    // Old Regime Slabs FY 2026-27 per official IT dept (AY 2026-27)
    let tax = 0;
    
    if (ageGroup === 'super_senior') {
        // Super Senior Citizen (80+ years): Nil up to ₹5L, 20% ₹5L-10L, 30% above ₹10L
        if (income <= 500000) {
            tax = 0;
        } else if (income <= 1000000) {
            tax = (income - 500000) * 0.20;
        } else {
            tax = 100000 + (income - 1000000) * 0.30;
        }
        // No 87A needed — slab itself gives 0% up to ₹5L
    } else if (ageGroup === 'senior') {
        // Senior Citizen (60-79 years): Nil up to ₹3L, 5% ₹3L-5L, 20% ₹5L-10L, 30% above ₹10L
        if (income <= 300000) {
            tax = 0;
        } else if (income <= 500000) {
            tax = (income - 300000) * 0.05;
        } else if (income <= 1000000) {
            tax = 10000 + (income - 500000) * 0.20;
        } else {
            tax = 10000 + 100000 + (income - 1000000) * 0.30;
        }
        // 87A rebate: tax ₹0 if income ≤ ₹5L (computed tax ≤ ₹10,000 < ₹12,500 limit)
        if (income <= 500000) tax = 0;
    } else {
        // Below 60 years: Nil up to ₹2.5L, 5% ₹2.5L-5L, 20% ₹5L-10L, 30% above ₹10L
        if (income <= 250000) {
            tax = 0;
        } else if (income <= 500000) {
            tax = (income - 250000) * 0.05;
        } else if (income <= 1000000) {
            tax = 12500 + (income - 500000) * 0.20;
        } else {
            tax = 12500 + 100000 + (income - 1000000) * 0.30;
        }
        // 87A rebate: tax ₹0 if income ≤ ₹5L (max rebate ₹12,500)
        if (income <= 500000) tax = 0;
    }
    
    return tax;
}

function calculateSurcharge(taxableIncome, baseTax, regime, ageGroup) {
    // Surcharge rates per official IT rules AY 2026-27
    // Both regimes: 0% up to ₹50L, 10% (₹50L-1Cr), 15% (1Cr-2Cr), 25% (2Cr-5Cr)
    // New regime: max 25% above ₹5Cr | Old regime: 37% above ₹5Cr
    // With marginal relief at each surcharge threshold.
    
    if (taxableIncome <= 5000000) return 0;
    
    let surchargeRate, lowerBoundary, lowerSurchargeRate;
    
    if (taxableIncome <= 10000000) {           // ₹50L – ₹1Cr
        surchargeRate = 0.10;
        lowerBoundary = 5000000;
        lowerSurchargeRate = 0;
    } else if (taxableIncome <= 20000000) {    // ₹1Cr – ₹2Cr
        surchargeRate = 0.15;
        lowerBoundary = 10000000;
        lowerSurchargeRate = 0.10;
    } else if (taxableIncome <= 50000000) {    // ₹2Cr – ₹5Cr
        surchargeRate = 0.25;
        lowerBoundary = 20000000;
        lowerSurchargeRate = 0.15;
    } else {                                    // Above ₹5Cr
        surchargeRate = regime === 'old' ? 0.37 : 0.25;
        lowerBoundary = 50000000;
        lowerSurchargeRate = 0.25;
    }
    
    let surcharge = baseTax * surchargeRate;
    
    // Marginal relief: (tax + surcharge) must not exceed
    // (tax_at_boundary + surcharge_at_boundary) + (income - boundary)
    const taxAtBoundary = regime === 'new'
        ? calculateNewRegimeTax(lowerBoundary, FY_CONFIG[selectedFY])
        : calculateOldRegimeTax(lowerBoundary, ageGroup);
    
    const taxPlusSurchargeAtBoundary = taxAtBoundary * (1 + lowerSurchargeRate);
    const maxAllowed = taxPlusSurchargeAtBoundary + (taxableIncome - lowerBoundary);
    
    if (baseTax + surcharge > maxAllowed) {
        surcharge = Math.max(0, maxAllowed - baseTax);
    }
    
    return surcharge;
}

function calculateNewRegimeTax(income, fyConfig) {
    // New regime slab computation using FY config
    // 87A rebate: full rebate up to the FY-specific threshold
    const slabs = fyConfig ? fyConfig.newSlabs : FY_CONFIG.fy2026.newSlabs;
    const rebate = fyConfig ? fyConfig.rebate87ANew : FY_CONFIG.fy2026.rebate87ANew;
    
    let tax = 0;
    let prev = 0;
    for (const slab of slabs) {
        if (income <= prev) break;
        const taxableInSlab = Math.min(income, slab.upper === Infinity ? income : slab.upper) - prev;
        tax += taxableInSlab * slab.rate;
        prev = slab.upper === Infinity ? income : slab.upper;
    }
    
    // 87A rebate
    if (income <= rebate.limit) tax = 0;
    
    return tax;
}

function displayResults(data) {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Old Regime Card
    document.getElementById('oldTaxAmount').textContent = formatCurrency(data.totalTaxOld);
    document.getElementById('oldGross').textContent = formatCurrency(data.grossIncome);
    document.getElementById('oldDeductions').textContent = formatCurrency(data.totalDeductionsOld);
    document.getElementById('oldTaxable').textContent = formatCurrency(data.taxableIncomeOld);
    document.getElementById('oldBaseTax').textContent = formatCurrency(data.taxOld);
    document.getElementById('oldSurcharge').textContent = formatCurrency(data.surchargeOld);
    document.getElementById('oldSurchargeRow').style.display = data.surchargeOld > 0 ? 'block' : 'none';
    document.getElementById('oldCess').textContent = formatCurrency(data.cessOld);
    document.getElementById('oldTaxCess').textContent = formatCurrency(data.totalTaxOld);
    
    // New Regime Card
    document.getElementById('newTaxAmount').textContent = formatCurrency(data.totalTaxNew);
    document.getElementById('newGross').textContent = formatCurrency(data.grossIncome);
    document.getElementById('newStdDed').textContent = formatCurrency(data.stdDeductionNew);
    document.getElementById('newNpsDed').textContent = formatCurrency(data.newRegimeNps);
    document.getElementById('newTaxable').textContent = formatCurrency(data.taxableIncomeNew);
    document.getElementById('newBaseTax').textContent = formatCurrency(data.taxNew);
    document.getElementById('newSurcharge').textContent = formatCurrency(data.surchargeNew);
    document.getElementById('newSurchargeRow').style.display = data.surchargeNew > 0 ? 'block' : 'none';
    document.getElementById('newCess').textContent = formatCurrency(data.cessNew);
    document.getElementById('newTaxCess').textContent = formatCurrency(data.totalTaxNew);
    
    // Recommendation
    const savings = Math.abs(data.totalTaxNew - data.totalTaxOld);
    const oldIsBetter = data.totalTaxOld < data.totalTaxNew;
    const recommendedRegime = oldIsBetter ? 'Old Tax Regime' : 'New Tax Regime';
    
    const recommendationBox = document.getElementById('recommendation');
    const oldCard = document.querySelector('.old-regime');
    const newCard = document.querySelector('.new-regime');
    
    // Remove previous winner class
    oldCard.classList.remove('winner');
    newCard.classList.remove('winner');
    
    if (oldIsBetter) {
        oldCard.classList.add('winner');
        recommendationBox.classList.remove('loss');
    } else {
        newCard.classList.add('winner');
        recommendationBox.classList.remove('loss');
    }
    
    document.getElementById('badgeText').textContent = 'RECOMMENDED';
    document.getElementById('recommendedRegime').textContent = recommendedRegime;
    document.getElementById('savingsText').textContent = `You save ${formatCurrency(savings)} annually`;
    document.getElementById('monthlySavings').textContent = `Monthly savings: ${formatCurrency(Math.round(savings / 12))}`;
    
    // Populate Old Regime Slabs Table
    const oldSlabData = getOldSlabBreakdown(data.taxableIncomeOld, data.ageGroup);
    populateSlabTable('oldSlabTable', oldSlabData);
    
    // Populate New Regime Slabs Table
    const newSlabData = getNewSlabBreakdown(data.taxableIncomeNew, data.fyConfig);
    populateSlabTable('newSlabTable', newSlabData);
    
    // Populate Deductions Table
    populateDeductionsTable(data.deductions);
}

function getOldSlabBreakdown(income, ageGroup) {
    const slabs = [];
    let remaining = income;
    
    if (ageGroup === 'super_senior') {
        // 0 - 5L: 0%
        const s1 = Math.min(remaining, 500000);
        slabs.push({ slab: '0 – 5L', rate: '0%', tax: 0 });
        remaining -= s1;
        // 5L - 10L: 20%
        if (remaining > 0) {
            const s2 = Math.min(remaining, 500000);
            slabs.push({ slab: '5L – 10L', rate: '20%', tax: s2 * 0.20 });
            remaining -= s2;
        }
    } else if (ageGroup === 'senior') {
        // 0 - 3L: 0%
        const s1 = Math.min(remaining, 300000);
        slabs.push({ slab: '0 – 3L', rate: '0%', tax: 0 });
        remaining -= s1;
        // 3L - 5L: 5%
        if (remaining > 0) {
            const s2 = Math.min(remaining, 200000);
            slabs.push({ slab: '3L – 5L', rate: '5%', tax: s2 * 0.05 });
            remaining -= s2;
        }
        // 5L - 10L: 20%
        if (remaining > 0) {
            const s3 = Math.min(remaining, 500000);
            slabs.push({ slab: '5L – 10L', rate: '20%', tax: s3 * 0.20 });
            remaining -= s3;
        }
    } else {
        // 0 - 2.5L: 0%
        const s1 = Math.min(remaining, 250000);
        slabs.push({ slab: '0 – 2.5L', rate: '0%', tax: 0 });
        remaining -= s1;
        // 2.5L - 5L: 5%
        if (remaining > 0) {
            const s2 = Math.min(remaining, 250000);
            slabs.push({ slab: '2.5L – 5L', rate: '5%', tax: s2 * 0.05 });
            remaining -= s2;
        }
        // 5L - 10L: 20%
        if (remaining > 0) {
            const s3 = Math.min(remaining, 500000);
            slabs.push({ slab: '5L – 10L', rate: '20%', tax: s3 * 0.20 });
            remaining -= s3;
        }
    }
    
    // Above 10L: 30% (all age groups)
    if (remaining > 0) {
        slabs.push({ slab: 'Above 10L', rate: '30%', tax: remaining * 0.30 });
    }
    
    return slabs;
}

// ============ GRATUITY CALCULATOR ============
function calculateGratuity() {
    const monthlyBasic = getInputValue('gratuityBasic');
    const cashAllowance = getInputValue('cashAllowance');
    const yearsOfService = parseFloat(document.getElementById('yearsOfService').value) || 0;
    
    if (monthlyBasic <= 0 || yearsOfService <= 0) {
        alert('Please enter valid Monthly Basic and Years of Service');
        return;
    }
    
    // Calculate Wages (Basic + Cash Allowance)
    const wages = monthlyBasic + cashAllowance;
    
    // Gratuity Formula: (15/26) × Monthly Salary × Years of Service
    const gratuityFactor = 15 / 26;
    
    // Old Structure: Based on Basic
    const oldGratuity = gratuityFactor * monthlyBasic * yearsOfService;
    
    // New Structure: Based on Wages
    const newGratuity = gratuityFactor * wages * yearsOfService;
    
    // Difference
    const difference = newGratuity - oldGratuity;
    
    // Display Results
    displayGratuityResults({
        monthlyBasic,
        cashAllowance,
        wages,
        yearsOfService,
        oldGratuity,
        newGratuity,
        difference
    });
}

function displayGratuityResults(data) {
    const resultsDiv = document.getElementById('gratuityResults');
    resultsDiv.style.display = 'block';
    
    // Old Structure
    document.getElementById('oldGratuityAmount').textContent = formatCurrency(Math.round(data.oldGratuity * 100) / 100);
    document.getElementById('oldGratuityCalc').textContent = 
        `15/26 × ${formatCurrency(data.monthlyBasic)} × ${data.yearsOfService} = ${formatCurrency(Math.round(data.oldGratuity * 100) / 100)}`;
    
    // New Structure
    document.getElementById('newGratuityAmount').textContent = formatCurrency(Math.round(data.newGratuity * 100) / 100);
    document.getElementById('newGratuityCalc').textContent = 
        `15/26 × ${formatCurrency(data.wages)} × ${data.yearsOfService} = ${formatCurrency(Math.round(data.newGratuity * 100) / 100)}`;
    
    // Difference
    const diffElement = document.getElementById('gratuityDifference');
    const benefitBox = document.getElementById('gratuityBenefit');
    diffElement.textContent = formatCurrency(Math.round(data.difference * 100) / 100);
    
    if (data.difference > 0) {
        benefitBox.classList.add('positive');
        benefitBox.classList.remove('negative');
    } else {
        benefitBox.classList.remove('positive');
        benefitBox.classList.add('negative');
    }
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

function getNewSlabBreakdown(income, fyConfig) {
    const slabs = fyConfig ? fyConfig.newSlabs : FY_CONFIG.fy2026.newSlabs;
    const result = [];
    let prev = 0;
    let remaining = income;
    
    for (const slab of slabs) {
        if (remaining <= 0) break;
        const upper = slab.upper === Infinity ? income : slab.upper;
        const chunk = Math.min(remaining, upper - prev);
        result.push({ slab: slab.label, rate: `${(slab.rate * 100).toFixed(0)}%`, tax: chunk * slab.rate });
        remaining -= chunk;
        prev = upper;
        if (slab.upper === Infinity) break;
    }
    return result;
}

function populateSlabTable(tableId, slabData) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
    
    slabData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.slab}</td>
            <td>${row.rate}</td>
            <td>${formatCurrency(row.tax)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function populateDeductionsTable(deductions) {
    const tbody = document.querySelector('#deductionsTable tbody');
    tbody.innerHTML = '';
    
    const deductionRows = [
        { section: 'Std Ded', desc: 'Standard Deduction', amount: deductions.stdDeduction },
        { section: 'HRA', desc: 'HRA Exemption', amount: deductions.hraExemption },
        { section: '80C', desc: 'EPF/PPF/ELSS/LIC/Education', amount: deductions.eligible80C },
        { section: '24(b)', desc: 'Home Loan Interest', amount: deductions.eligible24b },
        { section: '80CCD(1B)', desc: 'Self NPS Contribution', amount: deductions.eligible80CCD1B },
        { section: '80CCD(2)', desc: 'Employer NPS', amount: deductions.eligible80CCD2 },
        { section: '80D', desc: 'Health Insurance', amount: deductions.eligible80D },
        { section: '80E', desc: 'Education Loan Interest', amount: deductions.section80E },
        { section: '80G', desc: 'Donations', amount: deductions.section80G }
    ];
    
    deductionRows.forEach(row => {
        if (row.amount > 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.section}</td>
                <td>${row.desc}</td>
                <td>${formatCurrency(row.amount)}</td>
            `;
            tbody.appendChild(tr);
        }
    });
    
    // Add total row
    const total = deductionRows.reduce((sum, row) => sum + row.amount, 0);
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td><strong>Total</strong></td>
        <td></td>
        <td><strong>${formatCurrency(total)}</strong></td>
    `;
    tbody.appendChild(totalRow);
}

function resetForm() {
    document.getElementById('taxForm').reset();
    document.getElementById('results').style.display = 'none';
    document.getElementById('hraSection').style.display = 'none';
    document.getElementById('total80c').textContent = 'Total 80C: ₹0 (Eligible: ₹0)';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ EXPORT FUNCTIONS ============
function csvRow(...fields) {
    return fields.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',');
}

function exportTaxResults() {
    const cfg = FY_CONFIG[selectedFY];
    const grossIncome   = document.getElementById('oldGross').textContent;
    const oldDeductions = document.getElementById('oldDeductions').textContent;
    const oldTaxable    = document.getElementById('oldTaxable').textContent;
    const oldBaseTax    = document.getElementById('oldBaseTax').textContent;
    const oldSurcharge  = document.getElementById('oldSurcharge').textContent;
    const oldCess       = document.getElementById('oldCess').textContent;
    const oldTax        = document.getElementById('oldTaxAmount').textContent;
    const newStdDed     = document.getElementById('newStdDed').textContent;
    const newNpsDed     = document.getElementById('newNpsDed').textContent;
    const newTaxable    = document.getElementById('newTaxable').textContent;
    const newBaseTax    = document.getElementById('newBaseTax').textContent;
    const newSurcharge  = document.getElementById('newSurcharge').textContent;
    const newCess       = document.getElementById('newCess').textContent;
    const newTax        = document.getElementById('newTaxAmount').textContent;
    const recommendation = document.getElementById('recommendedRegime').textContent;
    const savings       = document.getElementById('savingsText').textContent;
    const monthlySavings = document.getElementById('monthlySavings').textContent;
    
    const rows = [
        csvRow('VittWise Tax Calculation Report'),
        csvRow(`${cfg.label} (${cfg.ayLabel})`),
        csvRow('Generated on', new Date().toLocaleString('en-IN')),
        '',
        csvRow('Particulars', 'Old Regime', 'New Regime'),
        csvRow('Gross Income', grossIncome, grossIncome),
        csvRow('Standard Deduction', '(50,000)', newStdDed),
        csvRow('Employer NPS 80CCD(2)', '', newNpsDed),
        csvRow('Total Deductions', oldDeductions, ''),
        csvRow('Taxable Income', oldTaxable, newTaxable),
        csvRow('Income Tax', oldBaseTax, newBaseTax),
        csvRow('Surcharge', oldSurcharge, newSurcharge),
        csvRow('Health & Education Cess (4%)', oldCess, newCess),
        csvRow('Total Tax Payable', oldTax, newTax),
        '',
        csvRow('Recommendation', recommendation),
        csvRow('Annual Savings', savings),
        csvRow('Monthly Savings', monthlySavings),
        '',
        csvRow('Generated by VittWise India', 'https://devopsarts.github.io/VittWise/')
    ];
    
    downloadFile('﻿' + rows.join('\n'), `VittWise_Tax_${cfg.label.replace(' ', '_')}.csv`, 'text/csv;charset=utf-8;');
}

function exportGratuityResults() {
    const oldGratuity   = document.getElementById('oldGratuityAmount').textContent;
    const newGratuity   = document.getElementById('newGratuityAmount').textContent;
    const oldCalc       = document.getElementById('oldGratuityCalc').textContent;
    const newCalc       = document.getElementById('newGratuityCalc').textContent;
    const benefit       = document.getElementById('gratuityDifference').textContent;
    const monthlyBasic  = document.getElementById('gratuityBasic').value || '0';
    const cashAllowance = document.getElementById('cashAllowance').value || '0';
    const yearsOfService = document.getElementById('yearsOfService').value || '0';
    
    const rows = [
        csvRow('VittWise Gratuity Calculation Report'),
        csvRow('New Labour Laws'),
        csvRow('Generated on', new Date().toLocaleString('en-IN')),
        '',
        csvRow('Particulars', 'Old Structure', 'New Structure'),
        csvRow('Monthly Basic', `₹${formatNumber(parseFloat(monthlyBasic))}`, ''),
        csvRow('Monthly Cash Allowance', '', `₹${formatNumber(parseFloat(cashAllowance))}`),
        csvRow('Years of Service', yearsOfService, yearsOfService),
        csvRow('Formula', '15/26 × Basic × Years', '15/26 × Wages × Years'),
        csvRow('Calculation', oldCalc, newCalc),
        csvRow('Gratuity Amount', oldGratuity, newGratuity),
        '',
        csvRow('Additional Benefit (New Structure)', benefit),
        '',
        csvRow('Generated by VittWise India', 'https://devopsarts.github.io/VittWise/')
    ];
    
    downloadFile('﻿' + rows.join('\n'), 'VittWise_Gratuity_Calculation.csv', 'text/csv;charset=utf-8;');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
