from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import numpy as np
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Satellite Security Backend is running 🚀"}

@app.get("/poi")
def simulate_poi(snr_min: float, snr_max: float, snr_step: float):
    snr_range = np.arange(snr_min, snr_max + snr_step, snr_step)
    poi = 1 - np.exp(-0.1 * snr_range)
    return {"snr": snr_range.tolist(), "poi": poi.tolist()}

@app.get("/secrecy")
def simulate_secrecy(snr_min: float, snr_max: float, snr_step: float):
    snr_range = np.arange(snr_min, snr_max + snr_step, snr_step)
    secrecy_capacity = np.maximum(np.log2(1 + snr_range) - 0.5, 0)
    return {"snr": snr_range.tolist(), "secrecy_capacity": secrecy_capacity.tolist()}

@app.get("/jamming")
def simulate_jamming(jamming_power: float, snr_min: float, snr_max: float, snr_step: float):
    snr_range = np.arange(snr_min, snr_max + snr_step, snr_step)
    impact = 1 / (1 + jamming_power * snr_range)
    return {"snr": snr_range.tolist(), "impact": impact.tolist()}

@app.get("/channel_model")
def channel_model(snr_min: float = 0, snr_max: float = 20, snr_step: float = 1):
    snr_range = np.arange(snr_min, snr_max + snr_step, snr_step)
    snr_linear = 10 ** (snr_range / 10)

    # Shadowed-Rician (default param = 3)
    K = 3
    rician_capacity = np.log2(1 + (snr_linear * (K + 1)) / (K + 1 + snr_linear))

    # Nakagami-m (default param = 2)
    m = 2
    nakagami_capacity = np.log2(1 + (snr_linear * m) / (m + snr_linear))

    return {
        "snr_db": snr_range.tolist(),
        "shadowed_rician": rician_capacity.tolist(),
        "nakagami_m": nakagami_capacity.tolist()
    }

@app.get("/fountain-code")
def simulate_fountain_code(source_packets: int):
    if source_packets <= 0:
        return {"error": "Source packets (K) must be greater than zero."}

    K = source_packets
    R_range = np.arange(0, 3 * K + 1)  # Simulasikan sampai 3x sumber data

    # P_success = 1 - exp(-R / K)
    recovery_probability = 1 - np.exp(-R_range / K)

    return {
        "received_packets": R_range.tolist(),
        "recovery_probability": recovery_probability.tolist()
    }

@app.get("/satnogs-realtime")
def satnogs_realtime_simulation():
    satellite_names = ["Sat-A", "Sat-B", "Sat-C", "Sat-D"]
    signal_strength = np.random.uniform(-120, -40, size=len(satellite_names)).tolist()
    snr_values = np.random.uniform(10, 40, size=len(satellite_names)).tolist()
    return {
        "satellites": satellite_names,
        "signal_strength": signal_strength,
        "snr_values": snr_values
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
