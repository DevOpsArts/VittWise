// Tax Regime Calculator - FY 2025-26
// SECURITY_NOTE: All calculations are performed client-side. No sensitive data is transmitted.

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
    
    // Section 80CCD(2) - Employer NPS (capped at 10% of Basic)
    const eligible80CCD2 = Math.min(employerNps, basicSalary * 0.10);
    
    // Section 80D - Health Insurance
    const eligible80DSelf = Math.min(healthInsuranceSelf, 25000);
    const maxParents = parentsSenior ? 50000 : 25000;
    const eligible80DParents = Math.min(healthInsuranceParents, maxParents);
    const eligible80D = eligible80DSelf + eligible80DParents;
    
    // Standard Deduction
    const stdDeductionOld = 50000;
    const stdDeductionNew = 75000;
    
    // ============ OLD REGIME CALCULATION ============
    const totalDeductionsOld = stdDeductionOld + hraExemption + eligible80C + eligible24b + 
                               eligible80CCD1B + eligible80CCD2 + eligible80D + section80E + section80G;
    
    const taxableIncomeOld = Math.max(0, grossIncome - totalDeductionsOld);
    const taxOld = calculateOldRegimeTax(taxableIncomeOld);
    const cessOld = taxOld * 0.04;
    const totalTaxOld = taxOld + cessOld;
    
    // ============ NEW REGIME CALCULATION ============
    const taxableIncomeNew = Math.max(0, grossIncome - stdDeductionNew);
    const taxNew = calculateNewRegimeTax(taxableIncomeNew);
    const cessNew = taxNew * 0.04;
    const totalTaxNew = taxNew + cessNew;
    
    // ============ DISPLAY RESULTS ============
    displayResults({
        grossIncome,
        totalDeductionsOld,
        taxableIncomeOld,
        taxOld,
        cessOld,
        totalTaxOld,
        taxableIncomeNew,
        taxNew,
        cessNew,
        totalTaxNew,
        stdDeductionNew,
        deductions: {
            stdDeduction: stdDeductionOld,
            hraExemption,
            eligible80C,
            eligible24b,
            eligible80CCD1B,
            eligible80CCD2,
            eligible80D,
            section80E,
            section80G
        }
    });
}

function calculateOldRegimeTax(income) {
    // Old Regime Slabs FY 2025-26
    // 0 - 2.5L: 0%
    // 2.5L - 5L: 5%
    // 5L - 10L: 20%
    // Above 10L: 30%
    
    let tax = 0;
    
    if (income <= 250000) {
        tax = 0;
    } else if (income <= 500000) {
        tax = (income - 250000) * 0.05;
    } else if (income <= 1000000) {
        tax = 12500 + (income - 500000) * 0.20;
    } else {
        tax = 12500 + 100000 + (income - 1000000) * 0.30;
    }
    
    // Rebate u/s 87A (if taxable income <= 5L, no tax)
    if (income <= 500000) {
        tax = 0;
    }
    
    return tax;
}

function calculateNewRegimeTax(income) {
    // New Regime Slabs FY 2025-26 (as per Budget 2025)
    // 0 - 3L: 0%
    // 3L - 7L: 5%
    // 7L - 10L: 10%
    // 10L - 12L: 15%
    // 12L - 15L: 20%
    // Above 15L: 30%
    
    let tax = 0;
    
    if (income <= 300000) {
        tax = 0;
    } else if (income <= 700000) {
        tax = (income - 300000) * 0.05;
    } else if (income <= 1000000) {
        tax = 20000 + (income - 700000) * 0.10;
    } else if (income <= 1200000) {
        tax = 20000 + 30000 + (income - 1000000) * 0.15;
    } else if (income <= 1500000) {
        tax = 20000 + 30000 + 30000 + (income - 1200000) * 0.20;
    } else {
        tax = 20000 + 30000 + 30000 + 60000 + (income - 1500000) * 0.30;
    }
    
    // Rebate u/s 87A (if taxable income <= 7L, no tax in new regime)
    if (income <= 700000) {
        tax = 0;
    }
    
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
    document.getElementById('oldTaxCess').textContent = formatCurrency(data.totalTaxOld);
    
    // New Regime Card
    document.getElementById('newTaxAmount').textContent = formatCurrency(data.totalTaxNew);
    document.getElementById('newGross').textContent = formatCurrency(data.grossIncome);
    document.getElementById('newStdDed').textContent = formatCurrency(data.stdDeductionNew);
    document.getElementById('newTaxable').textContent = formatCurrency(data.taxableIncomeNew);
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
    const oldSlabData = getOldSlabBreakdown(data.taxableIncomeOld);
    populateSlabTable('oldSlabTable', oldSlabData);
    
    // Populate New Regime Slabs Table
    const newSlabData = getNewSlabBreakdown(data.taxableIncomeNew);
    populateSlabTable('newSlabTable', newSlabData);
    
    // Populate Deductions Table
    populateDeductionsTable(data.deductions);
}

function getOldSlabBreakdown(income) {
    const slabs = [];
    let remaining = income;
    
    // 0 - 2.5L
    const slab1 = Math.min(remaining, 250000);
    slabs.push({ slab: '0 - 2.5L', rate: '0%', tax: 0 });
    remaining -= slab1;
    
    // 2.5L - 5L
    if (remaining > 0) {
        const slab2 = Math.min(remaining, 250000);
        slabs.push({ slab: '2.5L - 5L', rate: '5%', tax: slab2 * 0.05 });
        remaining -= slab2;
    }
    
    // 5L - 10L
    if (remaining > 0) {
        const slab3 = Math.min(remaining, 500000);
        slabs.push({ slab: '5L - 10L', rate: '20%', tax: slab3 * 0.20 });
        remaining -= slab3;
    }
    
    // Above 10L
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

function getNewSlabBreakdown(income) {
    const slabs = [];
    let remaining = income;
    
    // 0 - 3L
    const slab1 = Math.min(remaining, 300000);
    slabs.push({ slab: '0 - 3L', rate: '0%', tax: 0 });
    remaining -= slab1;
    
    // 3L - 7L
    if (remaining > 0) {
        const slab2 = Math.min(remaining, 400000);
        slabs.push({ slab: '3L - 7L', rate: '5%', tax: slab2 * 0.05 });
        remaining -= slab2;
    }
    
    // 7L - 10L
    if (remaining > 0) {
        const slab3 = Math.min(remaining, 300000);
        slabs.push({ slab: '7L - 10L', rate: '10%', tax: slab3 * 0.10 });
        remaining -= slab3;
    }
    
    // 10L - 12L
    if (remaining > 0) {
        const slab4 = Math.min(remaining, 200000);
        slabs.push({ slab: '10L - 12L', rate: '15%', tax: slab4 * 0.15 });
        remaining -= slab4;
    }
    
    // 12L - 15L
    if (remaining > 0) {
        const slab5 = Math.min(remaining, 300000);
        slabs.push({ slab: '12L - 15L', rate: '20%', tax: slab5 * 0.20 });
        remaining -= slab5;
    }
    
    // Above 15L
    if (remaining > 0) {
        slabs.push({ slab: 'Above 15L', rate: '30%', tax: remaining * 0.30 });
    }
    
    return slabs;
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
function exportTaxResults() {
    const oldTax = document.getElementById('oldTaxAmount').textContent;
    const newTax = document.getElementById('newTaxAmount').textContent;
    const grossIncome = document.getElementById('oldGross').textContent;
    const oldDeductions = document.getElementById('oldDeductions').textContent;
    const oldTaxable = document.getElementById('oldTaxable').textContent;
    const newTaxable = document.getElementById('newTaxable').textContent;
    const recommendation = document.getElementById('recommendedRegime').textContent;
    const savings = document.getElementById('savingsText').textContent;
    
    const content = `
=====================================
    VITTWISE TAX CALCULATION REPORT
         FY 2025-26 (AY 2026-27)
=====================================

Generated on: ${new Date().toLocaleString('en-IN')}

--- INCOME SUMMARY ---
Gross Income: ${grossIncome}

--- OLD TAX REGIME ---
Total Deductions: ${oldDeductions}
Taxable Income: ${oldTaxable}
Total Tax (incl. Cess): ${oldTax}

--- NEW TAX REGIME ---
Standard Deduction: ₹75,000
Taxable Income: ${newTaxable}
Total Tax (incl. Cess): ${newTax}

--- RECOMMENDATION ---
${recommendation}
${savings}

=====================================
    Generated by VittWise India
   https://devopsarts.github.io/VittWise/
=====================================
`;

    downloadFile(content, 'VittWise_Tax_Calculation.txt', 'text/plain');
}

function exportGratuityResults() {
    const oldGratuity = document.getElementById('oldGratuityAmount').textContent;
    const newGratuity = document.getElementById('newGratuityAmount').textContent;
    const oldCalc = document.getElementById('oldGratuityCalc').textContent;
    const newCalc = document.getElementById('newGratuityCalc').textContent;
    const benefit = document.getElementById('gratuityDifference').textContent;
    
    const monthlyBasic = document.getElementById('gratuityBasic').value || '0';
    const cashAllowance = document.getElementById('cashAllowance').value || '0';
    const yearsOfService = document.getElementById('yearsOfService').value || '0';
    
    const content = `
=====================================
   VITTWISE GRATUITY CALCULATION
         New Labour Laws
=====================================

Generated on: ${new Date().toLocaleString('en-IN')}

--- INPUT DETAILS ---
Monthly Basic: ₹${formatNumber(parseFloat(monthlyBasic))}
Cash Allowance: ₹${formatNumber(parseFloat(cashAllowance))}
Years of Service: ${yearsOfService}

--- OLD STRUCTURE ---
Formula: 15/26 × Basic × Years
Calculation: ${oldCalc}
Amount: ${oldGratuity}

--- NEW STRUCTURE ---
Formula: 15/26 × Wages × Years
(Wages = Basic + Cash Allowance)
Calculation: ${newCalc}
Amount: ${newGratuity}

--- BENEFIT ---
Additional Amount under New Structure: ${benefit}

=====================================
    Generated by VittWise India
   https://devopsarts.github.io/VittWise/
=====================================
`;

    downloadFile(content, 'VittWise_Gratuity_Calculation.txt', 'text/plain');
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
