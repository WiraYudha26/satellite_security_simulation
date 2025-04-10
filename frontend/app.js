// app.js

const apiBaseUrl = "http://localhost:8000";
let chart, shadowedChart, nakagamiChart;

// Universal fetch dengan error handling
async function fetchData(endpoint, params = {}) {
    try {
        const url = new URL(`${apiBaseUrl}/${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(`Fetch error for ${endpoint}:`, err);
        alert(`Error fetching data for ${endpoint}: ${err.message}`);
    }
}

// Render chart umum (satu canvas)
function renderChart(labels, datasets, labelX, labelY) {
    const ctx = document.querySelector("canvas").getContext("2d");
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: datasets.map(ds => ({
                label: ds.label,
                data: ds.data,
                fill: false,
                borderColor: getRandomColor(),
                tension: 0.3
            }))
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: labelY }
            },
            scales: {
                x: { title: { display: true, text: labelX } },
                y: { title: { display: true, text: labelY } }
            }
        }
    });
}

// Render chart per-canvas (untuk channel model)
function renderSingleChart(ctx, labels, data, label, color) {
    return new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label,
                data,
                fill: false,
                borderColor: color,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: label }
            },
            scales: {
                x: { title: { display: true, text: "SNR (dB)" } },
                y: { title: { display: true, text: "Capacity (bps/Hz)" } }
            }
        }
    });
}

function getRandomColor() {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
}

function getInputValue(id, fallback = 0) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) || fallback : fallback;
}

// === PoI Simulation ===
async function simulatePoI() {
    const snrMin = getInputValue("snrMin", 0);
    const snrMax = getInputValue("snrMax", 20);
    const snrStep = getInputValue("snrStep", 1);
    const data = await fetchData("poi", { snr_min: snrMin, snr_max: snrMax, snr_step: snrStep });
    if (data) renderChart(data.snr, [{ label: "Probability of Intercept", data: data.poi }], "SNR (dB)", "PoI");
}

// === Secrecy Capacity Simulation ===
async function simulateSecrecy() {
    const snrMin = getInputValue("snrMin", 0);
    const snrMax = getInputValue("snrMax", 20);
    const snrStep = getInputValue("snrStep", 1);
    const data = await fetchData("secrecy", { snr_min: snrMin, snr_max: snrMax, snr_step: snrStep });
    if (data) renderChart(data.snr, [{ label: "Secrecy Capacity", data: data.secrecy_capacity }], "SNR (dB)", "Capacity (bps/Hz)");
}

// === Friendly Jamming Simulation ===
async function simulateJamming() {
    const power = getInputValue("jammerPower", 1);
    const snrMin = getInputValue("snrMin", 0);
    const snrMax = getInputValue("snrMax", 20);
    const snrStep = getInputValue("snrStep", 1);

    const data = await fetchData("jamming", {
        jamming_power: power,
        snr_min: snrMin,
        snr_max: snrMax,
        snr_step: snrStep
    });

    if (data) {
        renderChart(data.snr, [{
            label: "Jamming Impact",
            data: data.impact
        }], "SNR (dB)", "Impact (dB)");
    }
}

// == Channel Model Simulation == //
function runChannelModelSimulation() {
    try {
        // Ambil input user
        const kFactor = parseFloat(document.getElementById('kFactor').value) || 3;
        const mParameter = parseFloat(document.getElementById('mParameter').value) || 2;
        const snrMin = parseFloat(document.getElementById('snrMin').value) || 0;
        const snrMax = parseFloat(document.getElementById('snrMax').value) || 30;
        const snrStep = parseFloat(document.getElementById('snrStep').value) || 1;

        // Validasi sederhana
        if (snrMin >= snrMax || snrStep <= 0) {
            alert('Periksa kembali nilai SNR Min, Max, dan Step!');
            return;
        }

        // Generate SNR array
        const snr_db = [];
        for (let snr = snrMin; snr <= snrMax; snr += snrStep) {
            snr_db.push(parseFloat(snr.toFixed(2))); // Fixed precision
        }

        // Kalkulasi Shadowed-Rician Capacity
        const shadowed_rician = snr_db.map(snr => {
            const snr_linear = Math.pow(10, snr / 10);
            const shadowing_factor = kFactor; // pakai input user
            return Math.log2(1 + shadowing_factor * snr_linear);
        });

        // Kalkulasi Nakagami-m Capacity
        const nakagami_m = snr_db.map(snr => {
            const snr_linear = Math.pow(10, snr / 10);
            const m = mParameter;
            return Math.log2(1 + (snr_linear * m / (m + 1)));
        });

        // Render Shadowed-Rician Chart
        const shadowedRicianCtx = document.getElementById('shadowedRicianChart').getContext('2d');
        if (window.shadowedRicianChart instanceof Chart) {
            window.shadowedRicianChart.destroy();
        }
        window.shadowedRicianChart = new Chart(shadowedRicianCtx, {
            type: 'line',
            data: {
                labels: snr_db,
                datasets: [{
                    label: `Shadowed-Rician Capacity (K=${kFactor})`,
                    data: shadowed_rician,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                }]
            },
            options: getChartOptions('Shadowed-Rician Channel Capacity')
        });

        // Render Nakagami-m Chart
        const nakagamiCtx = document.getElementById('nakagamiChart').getContext('2d');
        if (window.nakagamiChart instanceof Chart) {
            window.nakagamiChart.destroy();
        }
        window.nakagamiChart = new Chart(nakagamiCtx, {
            type: 'line',
            data: {
                labels: snr_db,
                datasets: [{
                    label: `Nakagami-m Capacity (m=${mParameter})`,
                    data: nakagami_m,
                    borderColor: 'rgb(255, 45, 45)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                }]
            },
            options: getChartOptions('Nakagami-m Channel Capacity')
        });

    } catch (error) {
        console.error('Error running channel model simulation:', error);
    }
}

// Function Chart Options biar clean
function getChartOptions(title) {
    return {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: 'white' }
            },
            title: {
                display: true,
                text: title,
                color: 'white'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'SNR (dB)',
                    color: 'white'
                },
                ticks: { color: 'white' }
            },
            y: {
                title: {
                    display: true,
                    text: 'Capacity (bps/Hz)',
                    color: 'white'
                },
                ticks: { color: 'white' }
            }
        }
    };
}

// === Fountain Code Simulation ===
async function simulateFountainCode() {
    const sourcePackets = document.getElementById("sourcePackets").value;
    if (!sourcePackets || sourcePackets <= 0) {
        alert("Please enter a valid number of source packets (K).");
        return;
    }

    const response = await fetch(`http://localhost:8000/fountain-code?source_packets=${sourcePackets}`);
    const data = await response.json();

    if (data) {
        renderFountainChart(
            data.received_packets,
            data.recovery_probability
        );
    }
}

let fountainChartInstance;
function renderFountainChart(labels, data) {
    const ctx = document.getElementById("fountainChart").getContext("2d");

    if (fountainChartInstance) {
        fountainChartInstance.destroy();
    }

    fountainChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Recovery Probability",
                data: data,
                borderColor: "rgba(75, 192, 192, 1)",
                fill: true,
                tension: 0.3,
                pointRadius: 2,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: "Received Packets (R)" },
                },
                y: {
                    title: { display: true, text: "Recovery Probability" },
                    min: 0,
                    max: 1,
                },
            },
        },
    });
}

// === SatNOGS Realtime Integration ===
async function simulateSatnogsRealtime() {
    const data = await fetchData("satnogs-realtime");
    if (data) renderChart(data.satellites, [
        { label: "Signal Strength (dBm)", data: data.signal_strength },
        { label: "SNR (dB)", data: data.snr_values }
    ], "Satellite", "Values");
}

// === Event Binding ===
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("simulate-poi")?.addEventListener("click", simulatePoI);
    document.getElementById("simulate-secrecy")?.addEventListener("click", simulateSecrecy);
    document.getElementById("simulate-jamming")?.addEventListener("click", simulateJamming);
    document.getElementById("simulate-channel-model")?.addEventListener("click", runChannelModelSimulation);
    document.getElementById("simulate-fountain")?.addEventListener("click", simulateFountainCode);
    document.getElementById("simulate-satnogs")?.addEventListener("click", simulateSatnogsRealtime);
});
