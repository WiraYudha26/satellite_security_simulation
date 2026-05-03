# 🛰️ Satellite Security Simulation

A satellite security simulation project based on **FastAPI** (Backend) + a simple Frontend. This application simulates various aspects of satellite communication security, such as Probability of Interception (POI), Secrecy Capacity, Jamming Impact, Channel Model, Fountain Code, and real-time satellite monitoring.

---

## ✨ Features

- **POI Simulation** – Probability of Interception based on SNR
- **Secrecy Capacity** – Secrecy capacity using Shannon Capacity
- **Jamming Impact** – Effect of jamming on the signal
- **Channel Model** – Shadowed-Rician & Nakagami-m fading
- **Fountain Code** – Recovery probability simulation
- **SatNOGS Real-time Simulation** – Random satellite data (signal strength & SNR)
- CORS support (accessible from the frontend)

---

## 🛠️ Tools
**Backend:**
- FastAPI
- Uvicorn
- NumPy (simulation calculations)
- Python 3.9+

**Frontend:**
- HTML + JavaScript + Chart.js (Live Server)

---

## 📁 Project Structure
```bash
satellite-security-simulation/
├── backend/
│   └── main.py
├── frontend/
│   ├── index.html
    ├── jamming.html
    ├── poi.html
    ├── channel-model.html
    ├── fountain.html
    ├── satnogs.html
    ├── secrecy.html
│   ├── app.js
│   └── style.css
└── README.md
```

---

## 🚀 How to Run

### 1. Backend (FastAPI)

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install dependencies
pip install fastapi uvicorn numpy

The backend will run at: http://127.0.0.1:8000
Automatic API documentation is available at:
http://127.0.0.1:8000/docs

# 3. Run the server
uvicorn main:app --reload
```
### 2. Frontend
- Open the frontend folder
- Right-click on index.html
- Select ‘Open with Live Server’ (VS Code Extension)
- Open a browser and access the frontend

---

## 📡 API Endpoints
| Method | Endpoint                          | Description |
|--------|-----------------------------------|----------|
| GET  | `/`     | Server status |
| GET  | `/poi`     | Intercept probability |
| GET  | `/secrecy`     | Secrecy capacity |
| GET  | `/jamming`     | Jamming effect |
| GET  | `/channel_model`     | Shadowed-Rician & Nakagami-m |
| GET  | `/fountain-code`     | Fountain Code Recovery |
| GET  | `/satnogs-realtime`     | Simulated real-time satellite data |
