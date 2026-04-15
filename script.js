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

// Close bottom popup & remember dismissal
function closePopup() {
    var popup = document.getElementById('bottomPopup');
    popup.classList.add('dismissed');
    setTimeout(function() { popup.style.display = 'none'; }, 300);
    try { localStorage.setItem('vittwise_popup_dismissed', '1'); } catch(e) {}
}

// Show popup only on first visit
(function() {
    try {
        if (localStorage.getItem('vittwise_popup_dismissed')) {
            var popup = document.getElementById('bottomPopup');
            if (popup) popup.style.display = 'none';
        }
    } catch(e) {}
})();

// ============ REUSABLE PIE CHART ============
function drawPieChart(canvasId, legendId, slices) {
    // slices: [{label, value, color}]
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2, radius = Math.min(W, H) / 2 - 16;

    var total = 0;
    slices.forEach(function(s) { total += s.value; });
    if (total === 0) return;

    // Compute angles once
    var angles = [];
    var startA = -Math.PI / 2;
    slices.forEach(function(s) {
        var sliceAngle = (s.value / total) * 2 * Math.PI;
        angles.push({ start: startA, end: startA + sliceAngle, mid: startA + sliceAngle / 2 });
        startA += sliceAngle;
    });

    // Render function
    function render(hoverIdx) {
        ctx.clearRect(0, 0, W, H);
        var explode = 14;
        var holeRadius = radius * 0.45;

        slices.forEach(function(s, i) {
            var a = angles[i];
            var isHover = i === hoverIdx;
            var ox = 0, oy = 0;
            if (isHover) {
                ox = explode * Math.cos(a.mid);
                oy = explode * Math.sin(a.mid);
            }
            var r = isHover ? radius + 4 : radius;

            // 3D shadow
            if (isHover) {
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,0.35)';
                ctx.shadowBlur = 18;
                ctx.shadowOffsetX = 4;
                ctx.shadowOffsetY = 6;
            }

            // Slice
            ctx.beginPath();
            ctx.moveTo(cx + ox, cy + oy);
            ctx.arc(cx + ox, cy + oy, r, a.start, a.end);
            ctx.closePath();
            ctx.fillStyle = s.color;
            ctx.fill();

            if (isHover) ctx.restore();

            // Percentage label
            var pct = Math.round((s.value / total) * 100);
            if (pct >= 5) {
                var lDist = isHover ? r * 0.62 : radius * 0.62;
                var lx = cx + ox + lDist * Math.cos(a.mid);
                var ly = cy + oy + lDist * Math.sin(a.mid);
                ctx.fillStyle = '#fff';
                ctx.font = (isHover ? 'bold 15px' : 'bold 13px') + ' Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(pct + '%', lx, ly);
            }
        });

        // Donut hole
        ctx.beginPath();
        ctx.arc(cx, cy, holeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Hover tooltip in center
        if (hoverIdx >= 0 && hoverIdx < slices.length) {
            var hs = slices[hoverIdx];
            ctx.fillStyle = '#1e3a5f';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(hs.label, cx, cy - 10);
            ctx.font = '13px Inter, sans-serif';
            ctx.fillStyle = '#4a5568';
            ctx.fillText(formatCurrency(Math.round(hs.value)), cx, cy + 10);
        }
    }

    // Initial render
    render(-1);

    // Hit detection
    function getSliceIndex(e) {
        var rect = canvas.getBoundingClientRect();
        var mx = (e.clientX - rect.left) * (W / rect.width);
        var my = (e.clientY - rect.top) * (H / rect.height);
        var dx = mx - cx, dy = my - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius + 14 || dist < radius * 0.45) return -1;
        var angle = Math.atan2(dy, dx);
        if (angle < -Math.PI / 2) angle += 2 * Math.PI;
        for (var i = 0; i < angles.length; i++) {
            var a = angles[i];
            var s = a.start, en = a.end;
            // Normalize
            if (angle >= s && angle < en) return i;
        }
        return -1;
    }

    // Remove old listeners
    var newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);
    canvas = newCanvas;
    ctx = canvas.getContext('2d');
    render(-1);

    canvas.addEventListener('mousemove', function(e) {
        var idx = getSliceIndex(e);
        canvas.style.cursor = idx >= 0 ? 'pointer' : 'default';
        render(idx);
    });
    canvas.addEventListener('mouseleave', function() {
        canvas.style.cursor = 'default';
        render(-1);
    });

    // Legend
    var legend = document.getElementById(legendId);
    if (legend) {
        legend.innerHTML = '';
        slices.forEach(function(s) {
            var item = document.createElement('div');
            item.className = 'pie-legend-item';
            item.innerHTML = '<span class="pie-legend-dot" style="background:' + s.color + '"></span>' +
                '<span class="pie-legend-label">' + s.label + '</span>' +
                '<span class="pie-legend-value">' + formatCurrency(Math.round(s.value)) + '</span>';
            legend.appendChild(item);
        });
    }
}

// Tab Switching Function (legacy - kept for compatibility)
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

// Panel Switching
function switchPanel(panelId) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');
    // Show/hide VittWise header logo (hide on home, show on calculators)
    var header = document.querySelector('.content-header');
    if (header) {
        if (panelId === 'homePanel') {
            header.classList.remove('visible');
        } else {
            header.classList.add('visible');
        }
    }
    // Clear search when navigating away from home
    var searchInput = document.getElementById('homeSearch');
    if (searchInput && panelId !== 'homePanel') searchInput.value = '';
    // Reset home grid visibility
    var homeCards = document.querySelectorAll('.home-card');
    homeCards.forEach(function(c) { c.style.display = ''; });
    // Scroll to top
    window.scrollTo(0, 0);
}

// Home search
function searchCalculators(query) {
    var cards = document.querySelectorAll('.home-card');
    var q = query.toLowerCase().trim();
    cards.forEach(function(card) {
        var label = card.querySelector('.home-card-label').textContent.toLowerCase();
        card.style.display = (!q || label.indexOf(q) !== -1) ? '' : 'none';
    });
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

// ============ LOAN EMI CALCULATOR (shared logic) ============
function calculateEMI(principal, annualRate, tenureMonths) {
    const r = annualRate / 12 / 100;
    if (r === 0) return principal / tenureMonths;
    return principal * r * Math.pow(1 + r, tenureMonths) / (Math.pow(1 + r, tenureMonths) - 1);
}

function computeLoanSchedule(principal, annualRate, tenureMonths, extraMonthly) {
    const r = annualRate / 12 / 100;
    const emi = calculateEMI(principal, annualRate, tenureMonths);
    let balance = principal;
    let totalInterest = 0;
    let totalPaid = 0;
    let month = 0;
    const yearlyData = [];
    let yearPrincipal = 0, yearInterest = 0;

    while (balance > 0.5 && month < tenureMonths * 2) {
        month++;
        const interestPart = balance * r;
        let principalPart = emi - interestPart + extraMonthly;
        if (principalPart > balance) principalPart = balance;
        const payment = interestPart + principalPart;

        totalInterest += interestPart;
        totalPaid += payment;
        yearPrincipal += principalPart;
        yearInterest += interestPart;
        balance -= principalPart;
        if (balance < 0.5) balance = 0;

        if (month % 12 === 0 || balance === 0) {
            yearlyData.push({
                year: Math.ceil(month / 12),
                principal: yearPrincipal,
                interest: yearInterest,
                balance: balance
            });
            yearPrincipal = 0;
            yearInterest = 0;
        }
    }

    return { emi, totalInterest, totalPaid, months: month, yearlyData };
}

function populateAmortTable(tableId, yearlyData) {
    const tbody = document.querySelector('#' + tableId + ' tbody');
    tbody.innerHTML = '';
    yearlyData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td>' + row.year + '</td><td>' + formatCurrency(Math.round(row.principal)) + '</td><td>' + formatCurrency(Math.round(row.interest)) + '</td><td>' + formatCurrency(Math.round(row.balance)) + '</td>';
        tbody.appendChild(tr);
    });
}

// ============ HOME LOAN CALCULATOR ============
function calculateHomeLoan() {
    const principal = getInputValue('hlLoanAmount');
    const rate = parseFloat(document.getElementById('hlInterestRate').value) || 0;
    const tenureYears = parseFloat(document.getElementById('hlTenure').value) || 0;
    const extra = getInputValue('hlExtraEmi');

    if (principal <= 0 || rate <= 0 || tenureYears <= 0) {
        alert('Please enter valid Loan Amount, Interest Rate and Tenure');
        return;
    }

    const tenureMonths = Math.round(tenureYears * 12);
    const normal = computeLoanSchedule(principal, rate, tenureMonths, 0);

    document.getElementById('hlResults').style.display = 'block';
    document.getElementById('hlEmi').textContent = formatCurrency(Math.round(normal.emi));
    document.getElementById('hlEmiVal').textContent = formatCurrency(Math.round(normal.emi));
    document.getElementById('hlTotalInterest').textContent = formatCurrency(Math.round(normal.totalInterest));
    document.getElementById('hlTotalPayment').textContent = formatCurrency(Math.round(normal.totalPaid));
    document.getElementById('hlTenureVal').textContent = normal.months + ' months (' + (normal.months / 12).toFixed(1) + ' yrs)';
    populateAmortTable('hlAmortTable', normal.yearlyData);

    if (extra > 0) {
        const prepay = computeLoanSchedule(principal, rate, tenureMonths, extra);
        document.getElementById('hlPrepayCard').style.display = 'block';
        document.getElementById('hlPrepayEmi').textContent = formatCurrency(Math.round(normal.emi + extra));
        document.getElementById('hlPrepayEmiVal').textContent = formatCurrency(Math.round(normal.emi + extra));
        document.getElementById('hlPrepayInterest').textContent = formatCurrency(Math.round(prepay.totalInterest));
        document.getElementById('hlPrepayTotal').textContent = formatCurrency(Math.round(prepay.totalPaid));
        document.getElementById('hlPrepayTenure').textContent = prepay.months + ' months (' + (prepay.months / 12).toFixed(1) + ' yrs)';

        const saved = Math.round(normal.totalInterest - prepay.totalInterest);
        const timeSaved = normal.months - prepay.months;
        document.getElementById('hlSavingsBox').style.display = 'block';
        document.getElementById('hlSavingsAmount').textContent = formatCurrency(saved);
        document.getElementById('hlSavingsText').textContent = 'Interest saved with prepayment';
        document.getElementById('hlTimeSaved').textContent = 'Time saved: ' + timeSaved + ' months (' + (timeSaved / 12).toFixed(1) + ' yrs)';
    } else {
        document.getElementById('hlPrepayCard').style.display = 'none';
        document.getElementById('hlSavingsBox').style.display = 'none';
    }

    drawPieChart('hlPieChart', 'hlPieLegend', [
        {label: 'Principal', value: principal, color: '#667eea'},
        {label: 'Interest', value: Math.round(normal.totalInterest), color: '#f093fb'}
    ]);
    document.getElementById('hlResults').scrollIntoView({ behavior: 'smooth' });
}

function exportHomeLoan() {
    const principal = getInputValue('hlLoanAmount');
    const rate = parseFloat(document.getElementById('hlInterestRate').value) || 0;
    const tenureYears = parseFloat(document.getElementById('hlTenure').value) || 0;
    const extra = getInputValue('hlExtraEmi');
    const tenureMonths = Math.round(tenureYears * 12);
    const normal = computeLoanSchedule(principal, rate, tenureMonths, 0);

    const rows = [
        csvRow('VittWise Home Loan Report'),
        csvRow('Generated on', new Date().toLocaleString('en-IN')),
        '',
        csvRow('Loan Amount', formatCurrency(principal)),
        csvRow('Interest Rate', rate + '%'),
        csvRow('Tenure', tenureYears + ' years'),
        csvRow('Monthly EMI', formatCurrency(Math.round(normal.emi))),
        csvRow('Total Interest', formatCurrency(Math.round(normal.totalInterest))),
        csvRow('Total Payment', formatCurrency(Math.round(normal.totalPaid))),
        ''
    ];

    if (extra > 0) {
        const prepay = computeLoanSchedule(principal, rate, tenureMonths, extra);
        const saved = Math.round(normal.totalInterest - prepay.totalInterest);
        rows.push(csvRow('--- With Prepayment ---'));
        rows.push(csvRow('Additional Monthly', formatCurrency(extra)));
        rows.push(csvRow('Total Interest (Prepay)', formatCurrency(Math.round(prepay.totalInterest))));
        rows.push(csvRow('Interest Saved', formatCurrency(saved)));
        rows.push(csvRow('Time Saved', (normal.months - prepay.months) + ' months'));
        rows.push('');
    }

    rows.push(csvRow('Year', 'Principal', 'Interest', 'Balance'));
    normal.yearlyData.forEach(function(r) {
        rows.push(csvRow(r.year, formatCurrency(Math.round(r.principal)), formatCurrency(Math.round(r.interest)), formatCurrency(Math.round(r.balance))));
    });
    rows.push('', csvRow('Generated by VittWise India', 'https://devopsarts.github.io/VittWise/'));

    downloadFile('\ufeff' + rows.join('\n'), 'VittWise_HomeLoan.csv', 'text/csv;charset=utf-8;');
}

// ============ PERSONAL LOAN CALCULATOR ============
function calculatePersonalLoan() {
    const principal = getInputValue('plLoanAmount');
    const rate = parseFloat(document.getElementById('plInterestRate').value) || 0;
    const tenureYears = parseFloat(document.getElementById('plTenure').value) || 0;
    const extra = getInputValue('plExtraEmi');

    if (principal <= 0 || rate <= 0 || tenureYears <= 0) {
        alert('Please enter valid Loan Amount, Interest Rate and Tenure');
        return;
    }

    const tenureMonths = Math.round(tenureYears * 12);
    const normal = computeLoanSchedule(principal, rate, tenureMonths, 0);

    document.getElementById('plResults').style.display = 'block';
    document.getElementById('plEmi').textContent = formatCurrency(Math.round(normal.emi));
    document.getElementById('plEmiVal').textContent = formatCurrency(Math.round(normal.emi));
    document.getElementById('plTotalInterest').textContent = formatCurrency(Math.round(normal.totalInterest));
    document.getElementById('plTotalPayment').textContent = formatCurrency(Math.round(normal.totalPaid));
    document.getElementById('plTenureVal').textContent = normal.months + ' months (' + (normal.months / 12).toFixed(1) + ' yrs)';
    populateAmortTable('plAmortTable', normal.yearlyData);

    if (extra > 0) {
        const prepay = computeLoanSchedule(principal, rate, tenureMonths, extra);
        document.getElementById('plPrepayCard').style.display = 'block';
        document.getElementById('plPrepayEmi').textContent = formatCurrency(Math.round(normal.emi + extra));
        document.getElementById('plPrepayEmiVal').textContent = formatCurrency(Math.round(normal.emi + extra));
        document.getElementById('plPrepayInterest').textContent = formatCurrency(Math.round(prepay.totalInterest));
        document.getElementById('plPrepayTotal').textContent = formatCurrency(Math.round(prepay.totalPaid));
        document.getElementById('plPrepayTenure').textContent = prepay.months + ' months (' + (prepay.months / 12).toFixed(1) + ' yrs)';

        const saved = Math.round(normal.totalInterest - prepay.totalInterest);
        const timeSaved = normal.months - prepay.months;
        document.getElementById('plSavingsBox').style.display = 'block';
        document.getElementById('plSavingsAmount').textContent = formatCurrency(saved);
        document.getElementById('plSavingsText').textContent = 'Interest saved with prepayment';
        document.getElementById('plTimeSaved').textContent = 'Time saved: ' + timeSaved + ' months (' + (timeSaved / 12).toFixed(1) + ' yrs)';
    } else {
        document.getElementById('plPrepayCard').style.display = 'none';
        document.getElementById('plSavingsBox').style.display = 'none';
    }

    drawPieChart('plPieChart', 'plPieLegend', [
        {label: 'Principal', value: principal, color: '#00b4d8'},
        {label: 'Interest', value: Math.round(normal.totalInterest), color: '#ff6b6b'}
    ]);
    document.getElementById('plResults').scrollIntoView({ behavior: 'smooth' });
}

function exportPersonalLoan() {
    const principal = getInputValue('plLoanAmount');
    const rate = parseFloat(document.getElementById('plInterestRate').value) || 0;
    const tenureYears = parseFloat(document.getElementById('plTenure').value) || 0;
    const extra = getInputValue('plExtraEmi');
    const tenureMonths = Math.round(tenureYears * 12);
    const normal = computeLoanSchedule(principal, rate, tenureMonths, 0);

    const rows = [
        csvRow('VittWise Personal Loan Report'),
        csvRow('Generated on', new Date().toLocaleString('en-IN')),
        '',
        csvRow('Loan Amount', formatCurrency(principal)),
        csvRow('Interest Rate', rate + '%'),
        csvRow('Tenure', tenureYears + ' years'),
        csvRow('Monthly EMI', formatCurrency(Math.round(normal.emi))),
        csvRow('Total Interest', formatCurrency(Math.round(normal.totalInterest))),
        csvRow('Total Payment', formatCurrency(Math.round(normal.totalPaid))),
        ''
    ];

    if (extra > 0) {
        const prepay = computeLoanSchedule(principal, rate, tenureMonths, extra);
        const saved = Math.round(normal.totalInterest - prepay.totalInterest);
        rows.push(csvRow('--- With Prepayment ---'));
        rows.push(csvRow('Additional Monthly', formatCurrency(extra)));
        rows.push(csvRow('Total Interest (Prepay)', formatCurrency(Math.round(prepay.totalInterest))));
        rows.push(csvRow('Interest Saved', formatCurrency(saved)));
        rows.push(csvRow('Time Saved', (normal.months - prepay.months) + ' months'));
        rows.push('');
    }

    rows.push(csvRow('Year', 'Principal', 'Interest', 'Balance'));
    normal.yearlyData.forEach(function(r) {
        rows.push(csvRow(r.year, formatCurrency(Math.round(r.principal)), formatCurrency(Math.round(r.interest)), formatCurrency(Math.round(r.balance))));
    });
    rows.push('', csvRow('Generated by VittWise India', 'https://devopsarts.github.io/VittWise/'));

    downloadFile('\ufeff' + rows.join('\n'), 'VittWise_PersonalLoan.csv', 'text/csv;charset=utf-8;');
}

// ============ SIP CALCULATOR ============
function calculateSIP() {
    var monthly = getInputValue('sipMonthly');
    var rate = parseFloat(document.getElementById('sipRate').value) || 0;
    var years = parseInt(document.getElementById('sipYears').value) || 0;
    var stepUp = parseFloat(document.getElementById('sipStepUp').value) || 0;
    if (!monthly || !rate || !years) { alert('Please fill all required SIP fields.'); return; }

    var monthlyRate = rate / 12 / 100;
    var totalMonths = years * 12;

    // Without step-up
    var fv = 0, totalInvested = 0;
    for (var m = 0; m < totalMonths; m++) {
        fv = (fv + monthly) * (1 + monthlyRate);
        totalInvested += monthly;
    }
    var gain = fv - totalInvested;

    document.getElementById('sipMaturity').textContent = formatCurrency(Math.round(fv));
    document.getElementById('sipInvested').textContent = formatCurrency(Math.round(totalInvested));
    document.getElementById('sipGain').textContent = formatCurrency(Math.round(gain));
    document.getElementById('sipMaturityVal').textContent = formatCurrency(Math.round(fv));

    // Year-wise table (without step-up)
    var tbody = document.querySelector('#sipTable tbody');
    tbody.innerHTML = '';
    var cumInvested = 0, cumValue = 0;
    for (var y = 1; y <= years; y++) {
        for (var mi = 0; mi < 12; mi++) {
            cumValue = (cumValue + monthly) * (1 + monthlyRate);
            cumInvested += monthly;
        }
        var row = document.createElement('tr');
        row.innerHTML = '<td>' + y + '</td><td>' + formatCurrency(Math.round(cumInvested)) +
            '</td><td>' + formatCurrency(Math.round(cumValue)) +
            '</td><td>' + formatCurrency(Math.round(cumValue - cumInvested)) + '</td>';
        tbody.appendChild(row);
    }

    // With step-up
    if (stepUp > 0) {
        var fvS = 0, totalInvS = 0, sipAmt = monthly;
        for (var y2 = 1; y2 <= years; y2++) {
            for (var mi2 = 0; mi2 < 12; mi2++) {
                fvS = (fvS + sipAmt) * (1 + monthlyRate);
                totalInvS += sipAmt;
            }
            sipAmt = sipAmt * (1 + stepUp / 100);
        }
        document.getElementById('sipStepMaturity').textContent = formatCurrency(Math.round(fvS));
        document.getElementById('sipStepInvested').textContent = formatCurrency(Math.round(totalInvS));
        document.getElementById('sipStepGain').textContent = formatCurrency(Math.round(fvS - totalInvS));
        document.getElementById('sipStepMaturityVal').textContent = formatCurrency(Math.round(fvS));
        document.getElementById('sipStepUpCard').style.display = '';
    } else {
        document.getElementById('sipStepUpCard').style.display = 'none';
    }

    drawPieChart('sipPieChart', 'sipPieLegend', [
        {label: 'Invested', value: Math.round(totalInvested), color: '#6c5ce7'},
        {label: 'Returns', value: Math.round(gain), color: '#00cec9'}
    ]);
    document.getElementById('sipResults').style.display = '';
    document.getElementById('sipResults').scrollIntoView({ behavior: 'smooth' });
}

function exportSIP() {
    var monthly = getInputValue('sipMonthly');
    var rate = parseFloat(document.getElementById('sipRate').value) || 0;
    var years = parseInt(document.getElementById('sipYears').value) || 0;
    var monthlyRate = rate / 12 / 100;
    var rows = [csvRow('VittWise SIP Report'), csvRow('Generated on', new Date().toLocaleString('en-IN')), '',
        csvRow('Monthly SIP', formatCurrency(monthly)), csvRow('Expected Return', rate + '%'), csvRow('Period', years + ' years'), ''];
    rows.push(csvRow('Year', 'Invested', 'Value', 'Gain'));
    var ci = 0, cv = 0;
    for (var y = 1; y <= years; y++) {
        for (var m = 0; m < 12; m++) { cv = (cv + monthly) * (1 + monthlyRate); ci += monthly; }
        rows.push(csvRow(y, formatCurrency(Math.round(ci)), formatCurrency(Math.round(cv)), formatCurrency(Math.round(cv - ci))));
    }
    rows.push('', csvRow('Generated by VittWise India', 'https://devopsarts.github.io/VittWise/'));
    downloadFile('\ufeff' + rows.join('\n'), 'VittWise_SIP.csv', 'text/csv;charset=utf-8;');
}

// ============ FD/RD CALCULATOR ============
function calculateFDRD() {
    var type = document.getElementById('fdrdType').value;
    var amount = getInputValue('fdrdAmount');
    var rate = parseFloat(document.getElementById('fdrdRate').value) || 0;
    var years = parseFloat(document.getElementById('fdrdTenure').value) || 0;
    var n = parseInt(document.getElementById('fdrdCompound').value);
    if (!amount || !rate || !years) { alert('Please fill all required fields.'); return; }

    var tbody = document.querySelector('#fdrdTable tbody');
    tbody.innerHTML = '';
    var totalDeposited = 0, balance = 0;

    if (type === 'fd') {
        // FD: A = P(1 + r/n)^(nt)
        totalDeposited = amount;
        balance = amount * Math.pow(1 + (rate / 100) / n, n * years);
        // Year-wise
        for (var y = 1; y <= Math.ceil(years); y++) {
            var yBal = amount * Math.pow(1 + (rate / 100) / n, n * Math.min(y, years));
            var yInt = yBal - amount;
            var row = document.createElement('tr');
            row.innerHTML = '<td>' + y + '</td><td>' + formatCurrency(Math.round(amount)) +
                '</td><td>' + formatCurrency(Math.round(yInt)) + '</td><td>' + formatCurrency(Math.round(yBal)) + '</td>';
            tbody.appendChild(row);
        }
    } else {
        // RD: Monthly deposit, quarterly compounding
        totalDeposited = amount * years * 12;
        balance = 0;
        var monthlyRate = (rate / 100) / 12;
        var totalMonths = Math.round(years * 12);
        for (var m = 1; m <= totalMonths; m++) {
            balance = (balance + amount) * (1 + monthlyRate);
        }
        // Year-wise
        var cumDep = 0, bal = 0;
        for (var y2 = 1; y2 <= Math.ceil(years); y2++) {
            var mEnd = Math.min(y2 * 12, totalMonths);
            var mStart = (y2 - 1) * 12;
            for (var m2 = mStart + 1; m2 <= mEnd; m2++) {
                bal = (bal + amount) * (1 + monthlyRate);
                cumDep += amount;
            }
            var row2 = document.createElement('tr');
            row2.innerHTML = '<td>' + y2 + '</td><td>' + formatCurrency(Math.round(cumDep)) +
                '</td><td>' + formatCurrency(Math.round(bal - cumDep)) + '</td><td>' + formatCurrency(Math.round(bal)) + '</td>';
            tbody.appendChild(row2);
        }
    }

    var interest = balance - totalDeposited;
    document.getElementById('fdrdResultTitle').textContent = type === 'fd' ? 'FD Maturity' : 'RD Maturity';
    document.getElementById('fdrdMaturity').textContent = formatCurrency(Math.round(balance));
    document.getElementById('fdrdDeposited').textContent = formatCurrency(Math.round(totalDeposited));
    document.getElementById('fdrdInterest').textContent = formatCurrency(Math.round(interest));
    document.getElementById('fdrdMaturityVal').textContent = formatCurrency(Math.round(balance));
    drawPieChart('fdrdPieChart', 'fdrdPieLegend', [
        {label: 'Deposited', value: Math.round(totalDeposited), color: '#0984e3'},
        {label: 'Interest', value: Math.round(interest), color: '#fdcb6e'}
    ]);
    document.getElementById('fdrdResults').style.display = '';
    document.getElementById('fdrdResults').scrollIntoView({ behavior: 'smooth' });
}

function exportFDRD() {
    var type = document.getElementById('fdrdType').value;
    var amount = getInputValue('fdrdAmount');
    var rate = parseFloat(document.getElementById('fdrdRate').value) || 0;
    var years = parseFloat(document.getElementById('fdrdTenure').value) || 0;
    var rows = [csvRow('VittWise ' + (type === 'fd' ? 'FD' : 'RD') + ' Report'),
        csvRow('Generated on', new Date().toLocaleString('en-IN')), '',
        csvRow('Type', type.toUpperCase()), csvRow('Amount', formatCurrency(amount)),
        csvRow('Rate', rate + '%'), csvRow('Tenure', years + ' years'), ''];
    rows.push('', csvRow('Generated by VittWise India', 'https://devopsarts.github.io/VittWise/'));
    downloadFile('\ufeff' + rows.join('\n'), 'VittWise_FDRD.csv', 'text/csv;charset=utf-8;');
}

// ============ PPF CALCULATOR ============
function calculatePPF() {
    var yearly = getInputValue('ppfYearly');
    var rate = parseFloat(document.getElementById('ppfRate').value) || 7.1;
    var tenure = parseInt(document.getElementById('ppfTenure').value) || 15;
    var existing = getInputValue('ppfExisting');
    if (!yearly) { alert('Please enter the yearly contribution.'); return; }
    yearly = Math.min(yearly, 150000); // PPF max ₹1.5L/year

    var balance = existing;
    var totalDeposited = existing;
    var tbody = document.querySelector('#ppfTable tbody');
    tbody.innerHTML = '';

    for (var y = 1; y <= tenure; y++) {
        balance += yearly;
        totalDeposited += yearly;
        var interest = balance * (rate / 100);
        balance += interest;
        var row = document.createElement('tr');
        row.innerHTML = '<td>' + y + '</td><td>' + formatCurrency(Math.round(yearly)) +
            '</td><td>' + formatCurrency(Math.round(interest)) + '</td><td>' + formatCurrency(Math.round(balance)) + '</td>';
        tbody.appendChild(row);
    }

    document.getElementById('ppfMaturity').textContent = formatCurrency(Math.round(balance));
    document.getElementById('ppfDeposited').textContent = formatCurrency(Math.round(totalDeposited));
    document.getElementById('ppfInterest').textContent = formatCurrency(Math.round(balance - totalDeposited));
    document.getElementById('ppfMaturityVal').textContent = formatCurrency(Math.round(balance));
    drawPieChart('ppfPieChart', 'ppfPieLegend', [
        {label: 'Deposited', value: Math.round(totalDeposited), color: '#2d3436'},
        {label: 'Interest', value: Math.round(balance - totalDeposited), color: '#55efc4'}
    ]);
    document.getElementById('ppfResults').style.display = '';
    document.getElementById('ppfResults').scrollIntoView({ behavior: 'smooth' });
}

function exportPPF() {
    var yearly = Math.min(getInputValue('ppfYearly'), 150000);
    var rate = parseFloat(document.getElementById('ppfRate').value) || 7.1;
    var tenure = parseInt(document.getElementById('ppfTenure').value) || 15;
    var existing = getInputValue('ppfExisting');
    var rows = [csvRow('VittWise PPF Report'), csvRow('Generated on', new Date().toLocaleString('en-IN')), '',
        csvRow('Yearly Contribution', formatCurrency(yearly)), csvRow('Rate', rate + '%'), csvRow('Tenure', tenure + ' years'), ''];
    rows.push(csvRow('Year', 'Deposit', 'Interest', 'Balance'));
    var bal = existing;
    for (var y = 1; y <= tenure; y++) {
        bal += yearly; var int = bal * (rate / 100); bal += int;
        rows.push(csvRow(y, formatCurrency(Math.round(yearly)), formatCurrency(Math.round(int)), formatCurrency(Math.round(bal))));
    }
    rows.push('', csvRow('Generated by VittWise India', 'https://devopsarts.github.io/VittWise/'));
    downloadFile('\ufeff' + rows.join('\n'), 'VittWise_PPF.csv', 'text/csv;charset=utf-8;');
}

// ============ HRA EXEMPTION CALCULATOR ============
function calculateHRA() {
    var basic = getInputValue('hraBasic');
    var da = getInputValue('hraDA');
    var hraRcvd = getInputValue('hraReceived');
    var rent = getInputValue('hraRent');
    var isMetro = document.getElementById('hraCity').value === 'metro';
    if (!basic || !hraRcvd || !rent) { alert('Please fill all required HRA fields.'); return; }

    var basicDA = basic + da;
    var a = hraRcvd; // Actual HRA received
    var b = (isMetro ? 0.50 : 0.40) * basicDA; // 50% (metro) or 40% (non-metro) of Basic+DA
    var c = rent - 0.10 * basicDA; // Rent paid minus 10% of Basic+DA
    if (c < 0) c = 0;

    var exempt = Math.min(a, b, c);
    var taxable = hraRcvd - exempt;

    document.getElementById('hraExempt').textContent = formatCurrency(Math.round(exempt));
    document.getElementById('hraActual').textContent = formatCurrency(Math.round(a));
    document.getElementById('hraPercent').textContent = formatCurrency(Math.round(b));
    document.getElementById('hraRentCalc').textContent = formatCurrency(Math.round(c));
    document.getElementById('hraExemptVal').textContent = formatCurrency(Math.round(exempt));
    document.getElementById('hraTaxable').textContent = formatCurrency(Math.round(taxable));
    document.getElementById('hraResults').style.display = '';
    document.getElementById('hraResults').scrollIntoView({ behavior: 'smooth' });
}

// ============ CAR LOAN CALCULATOR ============
function calculateCarLoan() {
    var principal = getInputValue('clLoanAmount');
    var rate = parseFloat(document.getElementById('clInterestRate').value) || 0;
    var tenureYears = parseFloat(document.getElementById('clTenure').value) || 0;
    var extra = getInputValue('clExtraEmi');
    if (!principal || !rate || !tenureYears) { alert('Please fill all required Car Loan fields.'); return; }
    var tenureMonths = Math.round(tenureYears * 12);
    var normal = computeLoanSchedule(principal, rate, tenureMonths, 0);

    document.getElementById('clEmi').textContent = formatCurrency(Math.round(normal.emi));
    document.getElementById('clEmiVal').textContent = formatCurrency(Math.round(normal.emi));
    document.getElementById('clTotalInterest').textContent = formatCurrency(Math.round(normal.totalInterest));
    document.getElementById('clTotalPayment').textContent = formatCurrency(Math.round(normal.totalPaid));
    document.getElementById('clTenureVal').textContent = normal.months + ' months';
    populateAmortTable('clAmortTable', normal.yearlyData);

    if (extra > 0) {
        var prepay = computeLoanSchedule(principal, rate, tenureMonths, extra);
        document.getElementById('clPrepayEmi').textContent = formatCurrency(Math.round(normal.emi + extra));
        document.getElementById('clPrepayEmiVal').textContent = formatCurrency(Math.round(normal.emi + extra));
        document.getElementById('clPrepayInterest').textContent = formatCurrency(Math.round(prepay.totalInterest));
        document.getElementById('clPrepayTotal').textContent = formatCurrency(Math.round(prepay.totalPaid));
        document.getElementById('clPrepayTenure').textContent = prepay.months + ' months';
        document.getElementById('clPrepayCard').style.display = '';
        var saved = Math.round(normal.totalInterest - prepay.totalInterest);
        document.getElementById('clSavingsAmount').textContent = formatCurrency(saved);
        document.getElementById('clTimeSaved').textContent = 'Time saved: ' + (normal.months - prepay.months) + ' months';
        document.getElementById('clSavingsBox').style.display = '';
    } else {
        document.getElementById('clPrepayCard').style.display = 'none';
        document.getElementById('clSavingsBox').style.display = 'none';
    }

    drawPieChart('clPieChart', 'clPieLegend', [
        {label: 'Principal', value: principal, color: '#e17055'},
        {label: 'Interest', value: Math.round(normal.totalInterest), color: '#636e72'}
    ]);
    document.getElementById('clResults').style.display = '';
    document.getElementById('clResults').scrollIntoView({ behavior: 'smooth' });
}

function exportCarLoan() {
    var principal = getInputValue('clLoanAmount');
    var rate = parseFloat(document.getElementById('clInterestRate').value) || 0;
    var tenureYears = parseFloat(document.getElementById('clTenure').value) || 0;
    var extra = getInputValue('clExtraEmi');
    var tenureMonths = Math.round(tenureYears * 12);
    var normal = computeLoanSchedule(principal, rate, tenureMonths, 0);
    var rows = [csvRow('VittWise Car Loan Report'), csvRow('Generated on', new Date().toLocaleString('en-IN')), '',
        csvRow('Loan Amount', formatCurrency(principal)), csvRow('Interest Rate', rate + '%'),
        csvRow('Tenure', tenureYears + ' years'), csvRow('Monthly EMI', formatCurrency(Math.round(normal.emi))),
        csvRow('Total Interest', formatCurrency(Math.round(normal.totalInterest))), ''];
    if (extra > 0) {
        var prepay = computeLoanSchedule(principal, rate, tenureMonths, extra);
        rows.push(csvRow('--- With Prepayment ---'), csvRow('Additional Monthly', formatCurrency(extra)),
            csvRow('Interest Saved', formatCurrency(Math.round(normal.totalInterest - prepay.totalInterest))),
            csvRow('Time Saved', (normal.months - prepay.months) + ' months'), '');
    }
    rows.push(csvRow('Year', 'Principal', 'Interest', 'Balance'));
    normal.yearlyData.forEach(function(r) {
        rows.push(csvRow(r.year, formatCurrency(Math.round(r.principal)), formatCurrency(Math.round(r.interest)), formatCurrency(Math.round(r.balance))));
    });
    rows.push('', csvRow('Generated by VittWise India', 'https://devopsarts.github.io/VittWise/'));
    downloadFile('\ufeff' + rows.join('\n'), 'VittWise_CarLoan.csv', 'text/csv;charset=utf-8;');
}

// ============ LUMPSUM CALCULATOR ============
function calculateLumpsum() {
    var amount = getInputValue('lsAmount');
    var rate = parseFloat(document.getElementById('lsRate').value) || 0;
    var years = parseInt(document.getElementById('lsYears').value) || 0;
    if (!amount || !rate || !years) { alert('Please fill all required fields.'); return; }

    var maturity = amount * Math.pow(1 + rate / 100, years);
    var gain = maturity - amount;

    document.getElementById('lsMaturity').textContent = formatCurrency(Math.round(maturity));
    document.getElementById('lsInvested').textContent = formatCurrency(Math.round(amount));
    document.getElementById('lsGain').textContent = formatCurrency(Math.round(gain));
    document.getElementById('lsCAGR').textContent = rate + '%';

    var tbody = document.querySelector('#lsTable tbody');
    tbody.innerHTML = '';
    for (var y = 1; y <= years; y++) {
        var val = amount * Math.pow(1 + rate / 100, y);
        var row = document.createElement('tr');
        row.innerHTML = '<td>' + y + '</td><td>' + formatCurrency(Math.round(val)) +
            '</td><td>' + formatCurrency(Math.round(val - amount)) + '</td>';
        tbody.appendChild(row);
    }

    drawPieChart('lsPieChart', 'lsPieLegend', [
        {label: 'Invested', value: Math.round(amount), color: '#a29bfe'},
        {label: 'Returns', value: Math.round(gain), color: '#ffeaa7'}
    ]);
    document.getElementById('lsResults').style.display = '';
    document.getElementById('lsResults').scrollIntoView({ behavior: 'smooth' });
}

function exportLumpsum() {
    var amount = getInputValue('lsAmount');
    var rate = parseFloat(document.getElementById('lsRate').value) || 0;
    var years = parseInt(document.getElementById('lsYears').value) || 0;
    var rows = [csvRow('VittWise Lumpsum Report'), csvRow('Generated on', new Date().toLocaleString('en-IN')), '',
        csvRow('Investment', formatCurrency(amount)), csvRow('Return', rate + '%'), csvRow('Period', years + ' years'), ''];
    rows.push(csvRow('Year', 'Value', 'Gain'));
    for (var y = 1; y <= years; y++) {
        var val = amount * Math.pow(1 + rate / 100, y);
        rows.push(csvRow(y, formatCurrency(Math.round(val)), formatCurrency(Math.round(val - amount))));
    }
    rows.push('', csvRow('Generated by VittWise India', 'https://devopsarts.github.io/VittWise/'));
    downloadFile('\ufeff' + rows.join('\n'), 'VittWise_Lumpsum.csv', 'text/csv;charset=utf-8;');
}

// ============ RENT VS BUY CALCULATOR ============
function calculateRentVsBuy() {
    var price = getInputValue('rbPropertyPrice');
    var downPct = parseFloat(document.getElementById('rbDownPayment').value) || 20;
    var loanRate = parseFloat(document.getElementById('rbLoanRate').value) || 0;
    var loanTenure = parseInt(document.getElementById('rbLoanTenure').value) || 20;
    var rent = getInputValue('rbRent');
    var rentInc = parseFloat(document.getElementById('rbRentIncrease').value) || 5;
    var appreciation = parseFloat(document.getElementById('rbAppreciation').value) || 5;
    var investReturn = parseFloat(document.getElementById('rbInvestReturn').value) || 10;
    var years = parseInt(document.getElementById('rbYears').value) || 20;
    if (!price || !loanRate || !rent) { alert('Please fill all required fields.'); return; }

    var downPayment = price * downPct / 100;
    var loanAmt = price - downPayment;
    var emi = calculateEMI(loanAmt, loanRate, loanTenure * 12);
    var totalEMI = emi * Math.min(loanTenure, years) * 12;
    var propValue = price * Math.pow(1 + appreciation / 100, years);
    var buyCost = downPayment + totalEMI - propValue;

    // Renting: pay rent (increasing), invest the difference
    var totalRent = 0, corpus = downPayment; // invest down payment if renting
    var monthlyRent = rent;
    var monthlyInvRate = investReturn / 12 / 100;
    for (var y = 0; y < years; y++) {
        for (var m = 0; m < 12; m++) {
            totalRent += monthlyRent;
            var diff = emi - monthlyRent;
            if (diff > 0) corpus = (corpus + diff) * (1 + monthlyInvRate);
            else corpus = corpus * (1 + monthlyInvRate);
        }
        monthlyRent = monthlyRent * (1 + rentInc / 100);
    }
    // Also grow existing corpus
    corpus = downPayment * Math.pow(1 + investReturn / 100, years);
    // Recalculate properly
    corpus = 0;
    var investCorpus = downPayment;
    monthlyRent = rent;
    totalRent = 0;
    for (var y2 = 0; y2 < years; y2++) {
        for (var m2 = 0; m2 < 12; m2++) {
            totalRent += monthlyRent;
            investCorpus = investCorpus * (1 + monthlyInvRate);
            if (y2 < loanTenure) {
                var surplus = emi - monthlyRent;
                if (surplus > 0) investCorpus += surplus;
            }
        }
        monthlyRent = monthlyRent * (1 + rentInc / 100);
    }
    var rentCost = totalRent - investCorpus;

    document.getElementById('rbDown').textContent = formatCurrency(Math.round(downPayment));
    document.getElementById('rbTotalEMI').textContent = formatCurrency(Math.round(totalEMI));
    document.getElementById('rbPropValue').textContent = formatCurrency(Math.round(propValue));
    document.getElementById('rbBuyCost').textContent = formatCurrency(Math.round(buyCost));
    document.getElementById('rbBuyNet').textContent = formatCurrency(Math.round(Math.abs(buyCost)));

    document.getElementById('rbTotalRent').textContent = formatCurrency(Math.round(totalRent));
    document.getElementById('rbCorpus').textContent = formatCurrency(Math.round(investCorpus));
    document.getElementById('rbRentCost').textContent = formatCurrency(Math.round(rentCost));
    document.getElementById('rbRentNet').textContent = formatCurrency(Math.round(Math.abs(rentCost)));

    var recBox = document.getElementById('rbRecommendation');
    if (buyCost < rentCost) {
        document.getElementById('rbVerdict').textContent = '🏠 Buying is Better';
        document.getElementById('rbSavings').textContent = 'You save ' + formatCurrency(Math.round(rentCost - buyCost)) + ' by buying over ' + years + ' years';
        recBox.className = 'recommendation-box';
    } else {
        document.getElementById('rbVerdict').textContent = '🏘️ Renting + Investing is Better';
        document.getElementById('rbSavings').textContent = 'You save ' + formatCurrency(Math.round(buyCost - rentCost)) + ' by renting over ' + years + ' years';
        recBox.className = 'recommendation-box';
    }

    document.getElementById('rbResults').style.display = '';
    document.getElementById('rbResults').scrollIntoView({ behavior: 'smooth' });
}

// ============ RETIREMENT CALCULATOR ============
function calculateRetirement() {
    var age = parseInt(document.getElementById('retAge').value) || 0;
    var retireAge = parseInt(document.getElementById('retRetireAge').value) || 60;
    var lifeExp = parseInt(document.getElementById('retLifeExp').value) || 85;
    var monthlyExp = getInputValue('retMonthlyExp');
    var inflation = parseFloat(document.getElementById('retInflation').value) || 6;
    var preReturn = parseFloat(document.getElementById('retPreReturn').value) || 12;
    var postReturn = parseFloat(document.getElementById('retPostReturn').value) || 8;
    var existing = getInputValue('retExisting');
    if (!age || !monthlyExp) { alert('Please fill all required fields.'); return; }

    var yearsToRetire = retireAge - age;
    var retirementYears = lifeExp - retireAge;
    if (yearsToRetire <= 0 || retirementYears <= 0) { alert('Please check your age inputs.'); return; }

    // Monthly expense at retirement (inflation-adjusted)
    var futureMonthlyExp = monthlyExp * Math.pow(1 + inflation / 100, yearsToRetire);
    var annualExpAtRetire = futureMonthlyExp * 12;

    // Corpus needed at retirement (PV of annuity with inflation during retirement)
    var realReturnPost = ((1 + postReturn / 100) / (1 + inflation / 100)) - 1;
    var corpus;
    if (realReturnPost <= 0) {
        corpus = annualExpAtRetire * retirementYears;
    } else {
        corpus = annualExpAtRetire * (1 - Math.pow(1 + realReturnPost, -retirementYears)) / realReturnPost;
    }

    // FV of existing savings
    var existingFV = existing * Math.pow(1 + preReturn / 100, yearsToRetire);
    var gap = corpus - existingFV;
    if (gap < 0) gap = 0;

    // Monthly SIP required to fill the gap
    var monthlyPreRate = preReturn / 12 / 100;
    var totalMonths = yearsToRetire * 12;
    var sip = 0;
    if (gap > 0 && totalMonths > 0) {
        sip = gap * monthlyPreRate / (Math.pow(1 + monthlyPreRate, totalMonths) - 1);
    }

    document.getElementById('retCorpus').textContent = formatCurrency(Math.round(corpus));
    document.getElementById('retFutureExp').textContent = formatCurrency(Math.round(futureMonthlyExp));
    document.getElementById('retYearsLeft').textContent = yearsToRetire + ' years';
    document.getElementById('retDuration').textContent = retirementYears + ' years';
    document.getElementById('retSIP').textContent = formatCurrency(Math.round(sip));
    document.getElementById('retExistingFV').textContent = formatCurrency(Math.round(existingFV));
    document.getElementById('retGap').textContent = formatCurrency(Math.round(gap));
    document.getElementById('retSIPDuration').textContent = yearsToRetire + ' years';

    document.getElementById('retResults').style.display = '';
    document.getElementById('retResults').scrollIntoView({ behavior: 'smooth' });
}

// ============ EPF CALCULATOR ============
function calculateEPF() {
    var basicDA = getInputValue('epfBasic');
    var age = parseInt(document.getElementById('epfAge').value) || 0;
    var retireAge = parseInt(document.getElementById('epfRetireAge').value) || 58;
    var empContrib = parseFloat(document.getElementById('epfContrib').value) || 12;
    var employerContrib = parseFloat(document.getElementById('epfEmployer').value) || 3.67;
    var epfRate = parseFloat(document.getElementById('epfInterestRate').value) || 8.25;
    var increment = parseFloat(document.getElementById('epfIncrement').value) || 5;
    var existing = getInputValue('epfExisting');
    if (!basicDA || !age) { alert('Please fill all required EPF fields.'); return; }

    var yearsLeft = retireAge - age;
    if (yearsLeft <= 0) { alert('Please check your age inputs.'); return; }

    var balance = existing;
    var totalEmp = 0, totalEmployer = 0, totalInterest = 0;
    var currentBasic = basicDA;
    var tbody = document.querySelector('#epfTable tbody');
    tbody.innerHTML = '';

    for (var y = 1; y <= yearsLeft; y++) {
        var yearlyEmp = currentBasic * 12 * empContrib / 100;
        var yearlyEmployer = currentBasic * 12 * employerContrib / 100;
        balance += yearlyEmp + yearlyEmployer;
        var interest = balance * epfRate / 100;
        balance += interest;
        totalEmp += yearlyEmp;
        totalEmployer += yearlyEmployer;
        totalInterest += interest;

        var row = document.createElement('tr');
        row.innerHTML = '<td>' + y + '</td><td>' + formatCurrency(Math.round(yearlyEmp)) +
            '</td><td>' + formatCurrency(Math.round(yearlyEmployer)) +
            '</td><td>' + formatCurrency(Math.round(interest)) +
            '</td><td>' + formatCurrency(Math.round(balance)) + '</td>';
        tbody.appendChild(row);

        currentBasic = currentBasic * (1 + increment / 100);
    }

    document.getElementById('epfCorpus').textContent = formatCurrency(Math.round(balance));
    document.getElementById('epfYourTotal').textContent = formatCurrency(Math.round(totalEmp));
    document.getElementById('epfEmployerTotal').textContent = formatCurrency(Math.round(totalEmployer));
    document.getElementById('epfTotalInterest').textContent = formatCurrency(Math.round(totalInterest));
    document.getElementById('epfYearsLeft').textContent = yearsLeft + ' years';

    drawPieChart('epfPieChart', 'epfPieLegend', [
        {label: 'Your Contribution', value: Math.round(totalEmp), color: '#0984e3'},
        {label: 'Employer', value: Math.round(totalEmployer), color: '#e17055'},
        {label: 'Interest', value: Math.round(totalInterest), color: '#00b894'}
    ]);
    document.getElementById('epfResults').style.display = '';
    document.getElementById('epfResults').scrollIntoView({ behavior: 'smooth' });
}

function exportEPF() {
    var basicDA = getInputValue('epfBasic');
    var age = parseInt(document.getElementById('epfAge').value) || 0;
    var retireAge = parseInt(document.getElementById('epfRetireAge').value) || 58;
    var empContrib = parseFloat(document.getElementById('epfContrib').value) || 12;
    var employerContrib = parseFloat(document.getElementById('epfEmployer').value) || 3.67;
    var epfRate = parseFloat(document.getElementById('epfInterestRate').value) || 8.25;
    var increment = parseFloat(document.getElementById('epfIncrement').value) || 5;
    var existing = getInputValue('epfExisting');
    var yearsLeft = retireAge - age;
    var rows = [csvRow('VittWise EPF Report'), csvRow('Generated on', new Date().toLocaleString('en-IN')), '',
        csvRow('Monthly Basic+DA', formatCurrency(basicDA)), csvRow('EPF Rate', epfRate + '%'), csvRow('Years to Retire', yearsLeft), ''];
    rows.push(csvRow('Year', 'Employee', 'Employer', 'Interest', 'Balance'));
    var bal = existing, cb = basicDA;
    for (var y = 1; y <= yearsLeft; y++) {
        var ye = cb * 12 * empContrib / 100, yr = cb * 12 * employerContrib / 100;
        bal += ye + yr; var int = bal * epfRate / 100; bal += int;
        rows.push(csvRow(y, formatCurrency(Math.round(ye)), formatCurrency(Math.round(yr)), formatCurrency(Math.round(int)), formatCurrency(Math.round(bal))));
        cb = cb * (1 + increment / 100);
    }
    rows.push('', csvRow('Generated by VittWise India', 'https://devopsarts.github.io/VittWise/'));
    downloadFile('\ufeff' + rows.join('\n'), 'VittWise_EPF.csv', 'text/csv;charset=utf-8;');
}

// ============ NPS CALCULATOR ============
function calculateNPS() {
    var monthly = getInputValue('npsMonthly');
    var age = parseInt(document.getElementById('npsAge').value) || 0;
    var retireAge = parseInt(document.getElementById('npsRetireAge').value) || 60;
    var returnRate = parseFloat(document.getElementById('npsReturn').value) || 10;
    var annuityPct = parseFloat(document.getElementById('npsAnnuity').value) || 40;
    var annuityReturn = parseFloat(document.getElementById('npsAnnuityReturn').value) || 6;
    if (!monthly || !age) { alert('Please fill all required NPS fields.'); return; }

    var years = retireAge - age;
    if (years <= 0) { alert('Please check your age inputs.'); return; }

    var monthlyRate = returnRate / 12 / 100;
    var totalMonths = years * 12;
    var totalInvested = monthly * totalMonths;

    var corpus = 0;
    for (var m = 0; m < totalMonths; m++) {
        corpus = (corpus + monthly) * (1 + monthlyRate);
    }

    var lumpsumPct = 100 - annuityPct;
    var lumpsum = corpus * lumpsumPct / 100;
    var annuityAmt = corpus * annuityPct / 100;
    var monthlyPension = annuityAmt * (annuityReturn / 100) / 12;

    document.getElementById('npsCorpus').textContent = formatCurrency(Math.round(corpus));
    document.getElementById('npsInvested').textContent = formatCurrency(Math.round(totalInvested));
    document.getElementById('npsGain').textContent = formatCurrency(Math.round(corpus - totalInvested));
    document.getElementById('npsPension').textContent = formatCurrency(Math.round(monthlyPension)) + '/mo';
    document.getElementById('npsLumpsum').textContent = formatCurrency(Math.round(lumpsum));
    document.getElementById('npsAnnuityAmt').textContent = formatCurrency(Math.round(annuityAmt));
    document.getElementById('npsPensionVal').textContent = formatCurrency(Math.round(monthlyPension));

    drawPieChart('npsPieChart', 'npsPieLegend', [
        {label: 'Invested', value: Math.round(totalInvested), color: '#d63031'},
        {label: 'Returns', value: Math.round(corpus - totalInvested), color: '#74b9ff'}
    ]);
    document.getElementById('npsResults').style.display = '';
    document.getElementById('npsResults').scrollIntoView({ behavior: 'smooth' });
}

// ============ INFLATION CALCULATOR ============
function calculateInflation() {
    var amount = getInputValue('infAmount');
    var rate = parseFloat(document.getElementById('infRate').value) || 6;
    var years = parseInt(document.getElementById('infYears').value) || 0;
    if (!amount || !years) { alert('Please fill all required fields.'); return; }

    var futureValue = amount * Math.pow(1 + rate / 100, years);
    var realValue = amount / Math.pow(1 + rate / 100, years);
    var lost = ((futureValue - amount) / futureValue) * 100;

    document.getElementById('infFuture').textContent = formatCurrency(Math.round(futureValue));
    document.getElementById('infToday').textContent = formatCurrency(Math.round(amount));
    document.getElementById('infYearsVal').textContent = years;
    document.getElementById('infFutureVal').textContent = formatCurrency(Math.round(futureValue));
    document.getElementById('infLost').textContent = Math.round(lost) + '%';
    document.getElementById('infReal').textContent = formatCurrency(Math.round(realValue));
    document.getElementById('infRealToday').textContent = Math.round(amount).toLocaleString('en-IN');
    document.getElementById('infRealFuture').textContent = formatCurrency(Math.round(realValue));
    document.getElementById('infRealYears').textContent = years;

    var tbody = document.querySelector('#infTable tbody');
    tbody.innerHTML = '';
    for (var y = 1; y <= years; y++) {
        var fv = amount * Math.pow(1 + rate / 100, y);
        var rv = amount / Math.pow(1 + rate / 100, y);
        var row = document.createElement('tr');
        row.innerHTML = '<td>' + y + '</td><td>' + formatCurrency(Math.round(fv)) +
            '</td><td>' + formatCurrency(Math.round(rv)) + '</td>';
        tbody.appendChild(row);
    }

    document.getElementById('infResults').style.display = '';
    document.getElementById('infResults').scrollIntoView({ behavior: 'smooth' });
}

// ============ CAPITAL GAINS TAX CALCULATOR ============
function calculateCapGains() {
    var assetType = document.getElementById('cgAssetType').value;
    var purchase = getInputValue('cgPurchasePrice');
    var sale = getInputValue('cgSalePrice');
    var holdingMonths = parseInt(document.getElementById('cgHoldingMonths').value) || 0;
    var expenses = getInputValue('cgExpenses');
    if (!purchase || !sale || !holdingMonths) { alert('Please fill all required fields.'); return; }

    var netGain = sale - purchase - expenses;
    if (netGain < 0) netGain = 0;

    // Determine STCG vs LTCG thresholds (post Budget 2024)
    var isLTCG = false;
    var ltcgThreshold, stcgRate, ltcgRate, exemption = 0;

    switch (assetType) {
        case 'equity':
            ltcgThreshold = 12; // 12 months for equity
            stcgRate = 20;      // STCG 20% (Budget 2024)
            ltcgRate = 12.5;    // LTCG 12.5% (Budget 2024)
            exemption = 125000; // ₹1.25L exemption on LTCG
            break;
        case 'debt':
            ltcgThreshold = 24;
            stcgRate = 30; // taxed at slab rate, assuming 30%
            ltcgRate = 12.5;
            exemption = 0;
            break;
        case 'property':
            ltcgThreshold = 24;
            stcgRate = 30;
            ltcgRate = 12.5;
            exemption = 0;
            break;
        case 'gold':
            ltcgThreshold = 24;
            stcgRate = 30;
            ltcgRate = 12.5;
            exemption = 0;
            break;
    }

    isLTCG = holdingMonths > ltcgThreshold;
    var taxRate = isLTCG ? ltcgRate : stcgRate;
    var taxableGain = isLTCG ? Math.max(0, netGain - exemption) : netGain;
    var tax = taxableGain * taxRate / 100;
    var cess = tax * 0.04;
    var totalTax = tax + cess;

    document.getElementById('cgGainType').textContent = isLTCG ? 'Long-Term Capital Gain (LTCG)' : 'Short-Term Capital Gain (STCG)';
    document.getElementById('cgGainAmount').textContent = formatCurrency(Math.round(netGain));
    document.getElementById('cgPurchase').textContent = formatCurrency(Math.round(purchase));
    document.getElementById('cgSale').textContent = formatCurrency(Math.round(sale));
    document.getElementById('cgExp').textContent = formatCurrency(Math.round(expenses));
    document.getElementById('cgNet').textContent = formatCurrency(Math.round(netGain));
    document.getElementById('cgTaxRate').textContent = taxRate + '%';
    document.getElementById('cgExemption').textContent = formatCurrency(Math.round(exemption));
    document.getElementById('cgTaxableGain').textContent = formatCurrency(Math.round(taxableGain));
    document.getElementById('cgTaxAmount').textContent = formatCurrency(Math.round(totalTax));
    document.getElementById('cgTaxCess').textContent = formatCurrency(Math.round(totalTax));

    document.getElementById('cgResults').style.display = '';
    document.getElementById('cgResults').scrollIntoView({ behavior: 'smooth' });
}

// ============ FD/RD TYPE LABEL UPDATE ============
document.addEventListener('DOMContentLoaded', function() {
    var fdrdType = document.getElementById('fdrdType');
    if (fdrdType) {
        fdrdType.addEventListener('change', function() {
            document.getElementById('fdrdAmountLabel').textContent =
                this.value === 'fd' ? 'Principal Amount *' : 'Monthly Deposit *';
        });
    }
});
