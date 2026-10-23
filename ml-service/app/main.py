from fastapi import FastAPI, UploadFile, File
app = FastAPI(title="RoadLife AI - ML Microservice")

@app.get("/")
def health():
    return {"service": "ML Service", "status": "ready"}

@app.post("/predict/damage")
async def detect_damage(file: UploadFile = File(...)):
    return {"status": "success", "detections": []}

@app.post("/predict/material")
async def assess_material(file: UploadFile = File(...)):
    return {"status": "success", "assessment": "MATCH", "confidence": 0.0}
