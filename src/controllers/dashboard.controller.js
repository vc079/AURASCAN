const dashboardRepo = require('../repositories/dashboard.repository');

async function getDashboardData(req, res, next) {
    try {
        const stats = await dashboardRepo.getSummaryStats();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
}

async function renderDashboard(req, res) {
    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>InspiroLog Telemetry</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                :root { 
                    --bg-dark: #050505; 
                    --bg-card: #111216; 
                    --text-main: #f3f4f6; 
                    --text-muted: #8b949e; 
                    --accent-neon: #00e676; 
                    --border-color: #1f2328;
                }
                body { 
                    font-family: 'Inter', system-ui, -apple-system, sans-serif; 
                    background: var(--bg-dark); 
                    color: var(--text-main); 
                    padding: 2.5rem; 
                    margin: 0; 
                }
                .container { max-width: 1300px; margin: 0 auto; }
                
                /* Header */
                .header { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem; }
                .header-indicator { width: 12px; height: 12px; background: var(--accent-neon); border-radius: 2px; box-shadow: 0 0 8px rgba(0, 230, 118, 0.4); }
                h1 { margin: 0; font-size: 1.25rem; font-weight: 500; letter-spacing: 0.5px; }
                
                /* Grid Layouts */
                .grid-kpi { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem; }
                .grid-charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem; }
                
                /* Flat Cards */
                .card { 
                    background: var(--bg-card); 
                    border: 1px solid var(--border-color); 
                    border-radius: 6px; 
                    padding: 1.5rem; 
                }
                .card-header { 
                    font-size: 0.75rem; 
                    text-transform: uppercase; 
                    letter-spacing: 1px; 
                    color: var(--text-muted); 
                    margin-top: 0; 
                    margin-bottom: 1.25rem; 
                    font-weight: 600; 
                }
                
                /* KPI Values */
                .kpi-value { font-size: 2.25rem; font-weight: 400; color: var(--text-main); line-height: 1; }
                .kpi-label { font-size: 0.85rem; color: var(--accent-neon); margin-top: 0.5rem; display: block; }
                
                /* Minimalist Table */
                table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
                th { color: var(--text-muted); font-weight: 500; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
                td { padding: 1rem 0; border-bottom: 1px solid var(--border-color); color: var(--text-main); }
                tr:last-child td { border-bottom: none; padding-bottom: 0; }
                
                /* Styling specific cells */
                .mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; color: var(--text-muted); }
                .badge { 
                    background: rgba(0, 230, 118, 0.1); 
                    color: var(--accent-neon); 
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    font-size: 0.75rem; 
                    border: 1px solid rgba(0, 230, 118, 0.2); 
                }
                
                .chart-wrapper { position: relative; height: 260px; width: 100%; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="header-indicator"></div>
                    <h1>Infrastructure Overview</h1>
                </div>
                
                <div class="grid-kpi">
                    <div class="card">
                        <h2 class="card-header">Request Volume</h2>
                        <div class="kpi-value" id="totalScans">0</div>
                        <span class="kpi-label">Total Lifetime Scans</span>
                    </div>
                    <div class="card">
                        <h2 class="card-header">Primary Environment</h2>
                        <div class="kpi-value" id="topOs">--</div>
                        <span class="kpi-label">Top Operating System</span>
                    </div>
                    <div class="card">
                        <h2 class="card-header">Client Gateway</h2>
                        <div class="kpi-value" id="topBrowser">--</div>
                        <span class="kpi-label">Top Browser</span>
                    </div>
                </div>

                <div class="grid-charts">
                    <div class="card">
                        <h2 class="card-header">OS Distribution</h2>
                        <div class="chart-wrapper">
                            <canvas id="osChart"></canvas>
                        </div>
                    </div>
                    <div class="card">
                        <h2 class="card-header">Browser Metrics</h2>
                        <div class="chart-wrapper">
                            <canvas id="browserChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h2 class="card-header">Live Telemetry Logs</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>IP Address</th>
                                <th>ISP Network</th>
                                <th>Geolocation</th>
                                <th>Client Profile</th>
                            </tr>
                        </thead>
                        <tbody id="recentTable"></tbody>
                    </table>
                </div>
            </div>

           <script>
                // Chart.js Global Settings for Dark Minimalist Theme
                Chart.defaults.color = '#8b949e';
                Chart.defaults.borderColor = '#1f2328';
                Chart.defaults.font.family = "system-ui, sans-serif";

                async function loadData() {
                    try {
                        const response = await fetch('/dashboard/data');
                        const json = await response.json();
                        const stats = json.data;

                        // 1. Update KPIs
                        document.getElementById('totalScans').innerText = stats.totalScans;
                        document.getElementById('topOs').innerText = stats.operatingSystems.length > 0 ? stats.operatingSystems[0].os : 'N/A';
                        document.getElementById('topBrowser').innerText = stats.browsers.length > 0 ? stats.browsers[0].browser : 'N/A';

                        // 2. Populate Table
                        const table = document.getElementById('recentTable');
                        stats.recentActivity.forEach(scan => {
                            const row = document.createElement('tr');
                            const date = new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            
                            row.innerHTML = \`
                                <td class="mono">\${date}</td>
                                <td class="mono" style="color: #f3f4f6;">\${scan.ip_address}</td>
                                <td>\${scan.isp || 'Unknown'}</td>
                                <td>\${scan.city || 'Unknown'}, \${scan.country || 'Unknown'}</td>
                                <td><span class="badge">\${scan.os || 'Unknown'} / \${scan.browser || 'Unknown'}</span></td>
                            \`;
                            table.appendChild(row);
                        });

                        // 3. Render OS Donut Chart
                        new Chart(document.getElementById('osChart'), {
                            type: 'doughnut',
                            data: {
                                labels: stats.operatingSystems.map(item => item.os),
                                datasets: [{
                                    data: stats.operatingSystems.map(item => item.count),
                                    // UPDATED: High-contrast distinct colors
                                    backgroundColor: ['#00e676', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'],
                                    borderWidth: 2,
                                    borderColor: '#111216',
                                }]
                            },
                            options: { 
                                responsive: true, 
                                maintainAspectRatio: false, 
                                cutout: '75%', 
                                plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } } },
                                layout: { padding: 10 }
                            }
                        });

                        // 4. Render Browser Bar Chart
                        new Chart(document.getElementById('browserChart'), {
                            type: 'bar',
                            data: {
                                labels: stats.browsers.map(item => item.browser),
                                datasets: [{
                                    label: 'Total Requests',
                                    data: stats.browsers.map(item => item.count),
                                    // UPDATED: Passes an array of distinct colors to the bars
                                    backgroundColor: ['#3b82f6', '#00e676', '#f59e0b', '#a855f7', '#ef4444'],
                                    borderRadius: 3,
                                    barPercentage: 0.6
                                }]
                            },
                            options: { 
                                responsive: true, 
                                maintainAspectRatio: false, 
                                plugins: { legend: { display: false } }, 
                                scales: { 
                                    y: { beginAtZero: true, grid: { color: '#1f2328' } },
                                    x: { grid: { display: false } }
                                } 
                            }
                        });
                    } catch (err) {
                        console.error('Failed to load dashboard data:', err);
                    }
                }
                
                loadData();
            </script>
        </body>
        </html>
    `);
}

module.exports = { getDashboardData, renderDashboard };