document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const targetId = link.getAttribute('data-target');
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetId) {
                    view.classList.add('active');
                }
            });

            // Update title
            pageTitle.textContent = link.textContent.trim();
        });
    });

    // Avatar Click -> User Details
    const avatarBtn = document.getElementById('avatar-btn');
    if (avatarBtn) {
        avatarBtn.addEventListener('click', () => {
            const userDetailsLink = document.querySelector('[data-target="user-details-view"]');
            if (userDetailsLink) {
                userDetailsLink.click();
            }
        });
    }

    // Authentication Mock
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Hide currently active view
        const currentActive = document.querySelector('.view.active');
        if (currentActive) currentActive.classList.remove('active');
        
        // Show payment details view
        const paymentView = document.getElementById('payment-details-view');
        if (paymentView) {
            paymentView.classList.add('active');
            pageTitle.textContent = 'Payment Details';
            // Disable sidebar links so the user has to fill out the form
            // Or just update the active state (payment details might not be in sidebar)
            document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
            triggerAlert('System Access Granted', 'User authenticated successfully. Please provide payment details.', 'safe');
        } else {
            // Fallback
            document.querySelector('[data-target="user-dashboard-view"]').click();
            triggerAlert('System Access Granted', 'User authenticated successfully.', 'safe');
        }
    });

    const paymentDetailsForm = document.getElementById('payment-details-form');
    if (paymentDetailsForm) {
        paymentDetailsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show User Dashboard
            document.querySelector('[data-target="user-dashboard-view"]').click();
            triggerAlert('Details Verified', 'Payment details saved securely.', 'safe');
        });
    }

    // Global mock state
    let transactions = [];
    let isBackendConnected = false;

    // Fetch initial transactions from backend
    async function fetchTransactions() {
        try {
            const response = await fetch('http://localhost:8080/api/transactions');
            if (response.ok) {
                transactions = await response.json();
                isBackendConnected = true;
                
                // Keep the suspicious reports logic local based on fetched backend logic
                suspiciousReports = transactions
                    .filter(t => t.status === 'danger')
                    .map(t => ({
                        id: t.id,
                        threat: t.score > 90 ? 'Critical' : 'High',
                        rule: 'High Risk Detected',
                        loc: t.loc
                    }));
                
                // Update charts data with fetched data
                transactions.forEach(t => {
                    const timeLabel = t.time;
                    riskChart.data.labels.push(timeLabel);
                    riskChart.data.datasets[0].data.push(t.score);
                    
                    if (riskChart.data.labels.length > 10) {
                        riskChart.data.labels.shift();
                        riskChart.data.datasets[0].data.shift();
                    }

                    if (t.status === 'danger') {
                        // Assuming fake frequency 5 for backend loaded txns in graph
                        behaviorChart.data.datasets[1].data.push({x: 5, y: t.amt});
                        const el = document.getElementById('stat-fraud');
                        if(el && el.textContent) el.textContent = parseInt(el.textContent) + 1;
                    } else if (t.status === 'safe') {
                        behaviorChart.data.datasets[0].data.push({x: 2, y: t.amt});
                        const el = document.getElementById('stat-safe');
                        if (el && el.textContent) el.textContent = (parseInt(el.textContent.replace(',','')) + 1).toLocaleString();
                    } else {
                        const el = document.getElementById('stat-flagged');
                        if(el && el.textContent) el.textContent = parseInt(el.textContent) + 1;
                    }
                });

                riskChart.update();
                behaviorChart.update();
                renderTables();
            } else {
                console.warn('Backend returned non-OK status. Falling back to mock data.');
                loadMockTransactions();
            }
        } catch (error) {
            console.error('Failed to connect to Java backend. Using mock data.', error);
            loadMockTransactions();
        }
    }

    function loadMockTransactions() {
        transactions = [
            { id: 'TXN-001', time: '09:15', date: '2026-03-07', loc: 'Mumbai, IN', amt: 450.00, score: 5, status: 'safe' },
            { id: 'TXN-002', time: '10:23', date: '2026-03-07', loc: 'Toronto, CA', amt: 50.00, score: 8, status: 'safe' },
            { id: 'TXN-003', time: '11:05', date: '2026-03-07', loc: 'Delhi, IN', amt: 2500.00, score: 45, status: 'warning' },
            { id: 'TXN-004', time: '12:12', date: '2026-03-07', loc: 'Dubai, UAE', amt: 3000.00, score: 55, status: 'warning' },
            { id: 'TXN-005', time: '14:30', date: '2026-03-07', loc: 'Bangalore, IN', amt: 15000.00, score: 85, status: 'danger' },
            { id: 'TXN-006', time: '16:45', date: '2026-03-07', loc: 'Beijing, CN', amt: 20000.00, score: 95, status: 'danger' }
        ];
        renderTables();
    }

    let suspiciousReports = [
        { id: 'TXN-005', threat: 'High', rule: 'High Amount + Risk Location', loc: 'Bangalore, IN' },
        { id: 'TXN-006', threat: 'Critical', rule: 'Excessive Amount + International High Risk', loc: 'Beijing, CN' }
    ];

    // Chart.js Instances
    let riskChart, behaviorChart;

    function initCharts() {
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.font.family = "'Inter', sans-serif";

        const ctxRisk = document.getElementById('riskScoreChart').getContext('2d');
        riskChart = new Chart(ctxRisk, {
            type: 'line',
            data: {
                labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
                datasets: [{
                    label: 'Avg Risk Score',
                    data: [12, 18, 15, 22, 85, 30],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(55, 65, 81, 0.3)' } },
                    x: { grid: { color: 'rgba(55, 65, 81, 0.3)' } }
                }
            }
        });

        const ctxBehavior = document.getElementById('behaviorChart').getContext('2d');
        behaviorChart = new Chart(ctxBehavior, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Safe Txns',
                    data: [{x: 2, y: 500}, {x: 5, y: 150}, {x: 1, y: 1200}],
                    backgroundColor: '#10b981'
                }, {
                    label: 'Fraudulent Txns',
                    data: [{x: 15, y: 4500}, {x: 8, y: 8000}, {x: 20, y: 200}],
                    backgroundColor: '#ef4444'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Frequency (Txns/24h)' }, grid: { color: 'rgba(55, 65, 81, 0.3)' } },
                    y: { title: { display: true, text: 'Amount (USD)' }, grid: { color: 'rgba(55, 65, 81, 0.3)' } }
                }
            }
        });
    }

    // Render Tables
    function renderTables() {
        const historyBody = document.getElementById('history-tbody');
        historyBody.innerHTML = '';
        transactions.slice().reverse().forEach(txn => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${txn.id}</td>
                <td>${txn.date} ${txn.time}</td>
                <td>${txn.loc}</td>
                <td>$${txn.amt.toLocaleString()}</td>
                <td>${txn.score}/100</td>
                <td><span class="badge ${txn.status}">${txn.status.toUpperCase()}</span></td>
            `;
            historyBody.appendChild(tr);
        });

        const reportsBody = document.getElementById('reports-tbody');
        reportsBody.innerHTML = '';
        suspiciousReports.forEach(rep => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${rep.id}</td>
                <td><span class="badge danger">${rep.threat}</span></td>
                <td>${rep.rule}</td>
                <td>${rep.loc}</td>
                <td><button class="badge warning" style="border:none; cursor:pointer;">Investigate</button></td>
            `;
            reportsBody.appendChild(tr);
        });
    }

    // Notification / Alerts
    const alertsSidebar = document.getElementById('alerts-sidebar');
    const notifBtn = document.querySelector('.notification-icon');
    const alertList = document.getElementById('alert-list');

    notifBtn.addEventListener('click', () => {
        alertsSidebar.classList.toggle('open');
    });

    function triggerAlert(title, msg, type) {
        if(type === 'danger') {
            notifBtn.classList.add('active');
            notifBtn.classList.add('fa-shake');
            setTimeout(() => notifBtn.classList.remove('fa-shake'), 1000);
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert-item';
        if(type === 'safe') {
            alertDiv.style.borderLeftColor = 'var(--safe)';
            alertDiv.style.background = 'rgba(16, 185, 129, 0.1)';
            alertDiv.innerHTML = `<strong style="color:var(--safe)">${title}</strong><small>${msg}</small>`;
        } else {
            alertDiv.innerHTML = `<strong><i class="fa-solid fa-triangle-exclamation"></i> ${title}</strong><small>${msg} - ${new Date().toLocaleTimeString()}</small>`;
        }
        
        alertList.prepend(alertDiv);
    }

    // Risk Scoring Engine
    function calculateRiskScore(amt, loc, freq) {
        let score = 0;
        
        // Amount rule
        if (amt > 10000) score += 50;
        else if (amt > 5000) score += 30;
        else if (amt > 1000) score += 10;

        // Frequency rule
        if (freq > 10) score += 40;
        else if (freq > 5) score += 20;

        // Location mock rule (if contains certain keywords)
        const riskyLocs = ['unknown', 'proxy', 'vpn', 'ru', 'kp'];
        if (riskyLocs.some(r => loc.toLowerCase().includes(r))) {
            score += 35;
        }

        return Math.min(score, 100);
    }

    // Transaction Submission
    const txnForm = document.getElementById('transaction-form');
    txnForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amt = parseFloat(document.getElementById('txn-amount').value);
        const loc = document.getElementById('txn-location').value;
        const time = document.getElementById('txn-time').value;
        const freq = parseInt(document.getElementById('txn-frequency').value);

        // UI Reset status
        const statusIcon = document.getElementById('status-icon');
        const spinner = document.getElementById('status-spinner');
        const statusText = document.getElementById('status-text');
        const statusDesc = document.getElementById('status-desc');
        const meterBar = document.getElementById('risk-meter-bar');
        const scoreValue = document.getElementById('risk-score-value');

        statusIcon.style.display = 'none';
        spinner.style.display = 'block';
        statusText.textContent = 'Processing...';
        statusDesc.textContent = 'Analyzing transaction through Fraud Engine...';
        meterBar.style.width = '0%';
        scoreValue.textContent = 'Score: --';

        // Simulate network delay
        setTimeout(() => {
            const riskScore = calculateRiskScore(amt, loc, freq);
            let status = 'safe';
            let ruleTriggered = '';

            if (riskScore >= 75) {
                status = 'danger';
                ruleTriggered = 'High Risk Score threshold exceeded';
            } else if (riskScore >= 40) {
                status = 'warning';
            }

            // Update UI
            spinner.style.display = 'none';
            statusIcon.style.display = 'block';
            
            if (status === 'safe') {
                statusIcon.innerHTML = '<i class="fa-solid fa-shield"></i>';
                statusIcon.className = 'status-icon safe';
                statusText.textContent = 'Transaction Safe';
                meterBar.style.backgroundColor = 'var(--safe)';
            } else if (status === 'danger') {
                statusIcon.innerHTML = '<i class="fa-solid fa-hand"></i>';
                statusIcon.className = 'status-icon danger';
                statusText.textContent = 'Fraudulent Activity Blocked';
                meterBar.style.backgroundColor = 'var(--danger)';
                
                triggerAlert('Security Breach Attempt', `High risk transaction blocked from ${loc}`, 'danger');
                
                // Add to reports
                suspiciousReports.push({
                    id: `TXN-00${transactions.length + 1}`,
                    threat: 'Critical',
                    rule: ruleTriggered,
                    loc: loc
                });
            } else {
                statusIcon.innerHTML = '<i class="fa-solid fa-eye"></i>';
                statusIcon.className = 'status-icon warning';
                statusText.textContent = 'Flagged for Review';
                meterBar.style.backgroundColor = 'var(--warning)';
            }

            statusDesc.textContent = `Completed analysis at ${new Date().toLocaleTimeString()}`;
            meterBar.style.width = `${riskScore}%`;
            scoreValue.textContent = `Score: ${riskScore}/100`;

            const newTxn = {
                id: `TXN-00${transactions.length + 1}`,
                time: time || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                date: new Date().toISOString().split('T')[0],
                loc: loc,
                amt: amt,
                score: riskScore,
                status: status
            };

            // Post to backend
            if (isBackendConnected) {
                fetch('http://localhost:8080/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTxn)
                }).then(res => res.json())
                  .then(data => {
                      transactions.push(data);
                      updateUICharts(data, freq);
                      renderTables();
                  }).catch(e => {
                      console.error("Failed to save transaction to database: ", e);
                      // Fallback
                      transactions.push(newTxn);
                      updateUICharts(newTxn, freq);
                      renderTables();
                  });
            } else {
                transactions.push(newTxn);
                updateUICharts(newTxn, freq);
                renderTables();
            }

            function updateUICharts(txnObj, freqVal) {
                // Update charts dynamically
                const timeLabel = txnObj.time;
                riskChart.data.labels.push(timeLabel);
                riskChart.data.datasets[0].data.push(txnObj.score);
                // keep last 10
                if (riskChart.data.labels.length > 10) {
                    riskChart.data.labels.shift();
                    riskChart.data.datasets[0].data.shift();
                }
                riskChart.update();

                if (txnObj.status === 'danger') {
                    behaviorChart.data.datasets[1].data.push({x: freqVal, y: txnObj.amt});
                    document.getElementById('stat-fraud').textContent = parseInt(document.getElementById('stat-fraud').textContent) + 1;
                } else if (txnObj.status === 'safe') {
                    behaviorChart.data.datasets[0].data.push({x: freqVal, y: txnObj.amt});
                    document.getElementById('stat-safe').textContent = (parseInt(document.getElementById('stat-safe').textContent.replace(',','')) + 1).toLocaleString();
                } else {
                    document.getElementById('stat-flagged').textContent = parseInt(document.getElementById('stat-flagged').textContent) + 1;
                }
                behaviorChart.update();
            }

            txnForm.reset();

        }, 1500);
    });

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const html = document.documentElement;
            const icon = document.getElementById('theme-icon');
            if (html.getAttribute('data-theme') === 'dark') {
                html.setAttribute('data-theme', 'light');
                icon.className = 'fa-solid fa-moon';
                Chart.defaults.color = '#4b5563';
                if (riskChart) riskChart.update();
                if (behaviorChart) behaviorChart.update();
            } else {
                html.setAttribute('data-theme', 'dark');
                icon.className = 'fa-solid fa-sun';
                Chart.defaults.color = '#9ca3af';
                if (riskChart) riskChart.update();
                if (behaviorChart) behaviorChart.update();
            }
        });
    }

    // Init
    initCharts();
    fetchTransactions();
});
