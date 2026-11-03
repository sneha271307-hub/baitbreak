# BaitBreak – Scam Message Detection (ML component)

Classifies a message (SMS / WhatsApp / email text) as **scam** or **legitimate**.
Works with **Hindi (Devanagari), Hinglish (Roman Hindi) and English**.

TF-IDF (word + character n-grams) → Logistic Regression (chosen over Multinomial Naive Bayes) → FastAPI service.

## What's in this folder

| File | Purpose |
|---|---|
| `model.pkl` | Trained Logistic Regression classifier |
| `vectorizer.pkl` | Fitted TF-IDF vectorizer (word + char n-grams) |
| `app.py` | FastAPI prediction service (`POST /predict`) |
| `preprocess.py` | Text cleaning – **required by `app.py`; keep it next to it** |
| `requirements.txt` | Packages needed to run the API (pinned) |
| `dataset.csv` | Final cleaned dataset (5,780 messages; `label` 0 = Legitimate, 1 = Scam) |
| `train_model.ipynb` | Training + evaluation notebook (already executed, outputs included) |
| `evaluation_report.pdf` | Accuracy, precision, recall, F1, confusion matrices |
| `test_api.py` | One-command smoke test of the running API |
| `node_integration/` | Ready-to-copy Node.js client + Express route example |
| `build_dataset.py`, `make_seed_data.py`, `fetch_external.py` | Dataset pipeline (see "Retraining") |
| `requirements-train.txt` | Extra packages for retraining / notebook |
| `data/` | Raw UCI file, seed data, and `unseen_test.csv` (never used for training) |

## 1. Run the API locally

Requires **Python 3.11+**.

```bash
# Windows (PowerShell / cmd)
python -m venv venv
venv\Scripts\activate
# macOS / Linux
# python3 -m venv venv && source venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

* **API URL:** `http://127.0.0.1:8000` (port **8000**; change with `--port`)
* **Predict endpoint:** `POST http://127.0.0.1:8000/predict`
* **Health check:** `GET http://127.0.0.1:8000/health`
* **Interactive docs (try it in the browser):** `http://127.0.0.1:8000/docs`

Test it (in a second terminal): `python test_api.py`

> The pickles were created with scikit-learn **1.8.0**. Install from `requirements.txt` (pinned) – a different scikit-learn version can fail to load or behave differently.

## 2. API reference

### `POST /predict`
Request (`Content-Type: application/json`):
```json
{"message": "Your bank account will be blocked. Share OTP immediately."}
```
Response `200`:
```json
{"success": true, "prediction": "scam", "confidence": 0.902}
```
* `prediction` – `"scam"` or `"legitimate"`
* `confidence` – probability (0–1) of the *predicted* class
* Optional env var `SCAM_THRESHOLD` (default `0.5`): messages with P(scam) ≥ threshold are `"scam"`. Lower it (e.g. `0.4`) to catch more scams at the cost of more false alarms.

Errors (always `{"success": false, "error": "..."}`):
* `400` – empty / whitespace-only message, message > 5,000 chars, or no readable text
* `422` – body is not `{"message": "<string>"}`

### Example requests and (real) responses

**English scam**
```bash
curl -X POST http://127.0.0.1:8000/predict -H "Content-Type: application/json" \
  -d '{"message": "Your bank account will be blocked. Share OTP immediately."}'
# {"success":true,"prediction":"scam","confidence":0.902}
```
**Hindi scam**
```bash
curl -X POST http://127.0.0.1:8000/predict -H "Content-Type: application/json" \
  -d '{"message": "आपका खाता बंद हो जाएगा। अभी KYC अपडेट करें और OTP शेयर करें।"}'
# {"success":true,"prediction":"scam","confidence":0.9597}
```
**Hinglish scam**
```bash
curl -X POST http://127.0.0.1:8000/predict -H "Content-Type: application/json" \
  -d '{"message": "Aapka account block ho jayega, turant OTP bhejein"}'
# {"success":true,"prediction":"scam","confidence":0.7756}
```
**Hinglish legitimate**
```bash
curl -X POST http://127.0.0.1:8000/predict -H "Content-Type: application/json" \
  -d '{"message": "Bhai kal shaam 6 baje milte hain, late mat hona"}'
# {"success":true,"prediction":"legitimate","confidence":0.9937}
```
**Empty message**
```bash
curl -X POST http://127.0.0.1:8000/predict -H "Content-Type: application/json" -d '{"message": "  "}'
# HTTP 400  {"success":false,"error":"message must be a non-empty string"}
```
> **Windows tip:** Hindi text in `cmd`/PowerShell `curl` often gets mangled by the console encoding. Test Hindi via `http://127.0.0.1:8000/docs`, `python test_api.py`, or the Node client below instead.

## 3. Integrate with the existing Node.js backend

Architecture: **browser → your Node backend → Python ML service**. The frontend never calls the Python service directly.

1. Start the Python service (above). Keep it running (see "Deployment").
2. Copy `node_integration/baitbreakClient.js` into your backend (Node 18+; uses built-in `fetch`, no new npm package).
3. Optionally set `BAITBREAK_ML_URL` (default `http://127.0.0.1:8000`) and `BAITBREAK_ML_TIMEOUT_MS` (default 5000) in your `.env`.
4. Add a route (full runnable example in `node_integration/server-example.js`):

```js
const { checkMessage } = require("./baitbreakClient");

app.post("/api/check-message", async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== "string" || !message.trim())
    return res.status(400).json({ success: false, error: "message is required" });

  const result = await checkMessage(message);   // {success, prediction, confidence}
  if (!result.success) return res.status(502).json(result);   // ML service down / bad input
  res.json(result);
});
```
5. From your React/HTML frontend call **your** route:
```js
const r = await fetch("/api/check-message", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: userText }),
});
const { success, prediction, confidence } = await r.json();
```
`checkMessage` never throws: if the Python service is down or slow it returns `{success:false, error:"ML service unavailable: ..."}` so your site can show a fallback instead of crashing. Quick test: `node node_integration/test-client.js`.

(If you use `axios`: `axios.post(process.env.BAITBREAK_ML_URL + "/predict", { message })` works the same way; the response body is `res.data`.)

## 4. Deployment notes
* **Same machine as the Node app:** start uvicorn with `--host 127.0.0.1` so it is not reachable from outside; Node talks to it on `127.0.0.1:8000`.
* **Separate server/container:** set `BAITBREAK_ML_URL=http://<ml-host>:8000` in the Node app and restrict access with a firewall / private network – the service has **no authentication**.
* Keep it alive with a process manager (PM2: `pm2 start "uvicorn app:app --port 8000" --name baitbreak-ml`, or systemd / Docker).
* The model loads once at startup; each prediction takes a few milliseconds.

## 5. Model performance (summary – full details in `evaluation_report.pdf`)

| | Accuracy | Precision (scam) | Recall (scam) | F1 (scam) |
|---|---|---|---|---|
| Hold-out test (1,154 msgs), Logistic Regression | 96.8% | 86.3% | 95.8% | 90.8% |
| Hold-out test, Multinomial Naive Bayes | 94.6% | 77.5% | 95.3% | 85.5% |
| Unseen Hindi/Hinglish/English set (72 msgs), final model | 90.3% | 89.2% | 91.7% | 90.4% |

Logistic Regression was selected on cross-validated F1 (0.898 vs 0.878).

### ⚠ Read this before relying on the numbers
1. **The two Hugging Face datasets are NOT in this build.** The environment that built this package could not reach Hugging Face/UCI servers. `dataset.csv` contains the real **UCI SMS Spam Collection** (English, 5,106 unique messages) plus **674 synthetic, template-based Hindi/Hinglish/English Indian-style messages** written for this project. English results on real UCI data are trustworthy; **Hindi/Hinglish results come from small, partly synthetic data** and will likely be lower on real-world messages.
2. The unseen test set was written by the same team as the seed data, so it is not fully independent.
3. Known weakness: genuine bank debit alerts ("Not you? Call…") and some genuine OTP messages can be flagged as scams; some novel scam stories are missed. See the error analysis in the report.
4. Use it as **one signal**, not the only safeguard (it has no URL reputation, sender or context checks). Treat confidence of ~0.5–0.7 as "uncertain" in your UI.

## 6. Retraining with the real datasets (recommended next step)
Run on a machine that can reach huggingface.co:
```bash
pip install -r requirements-train.txt
python fetch_external.py        # downloads the Hugging Face datasets into data/external/
python build_dataset.py         # combine, clean, de-duplicate, standardise labels -> dataset.csv
jupyter nbconvert --to notebook --execute --inplace train_model.ipynb   # retrains, rewrites model.pkl / vectorizer.pkl / reports/metrics.json
python make_report.py           # regenerates evaluation_report.pdf
```
`build_dataset.py` auto-detects text/label columns (`text`/`message`/…, `label`/`category`/…) and maps `ham/legit/benign → 0`, `spam/scam/fraud → 1`. If your team's "Indian Multilingual Scam Message Dataset" is a different repo, add its id to `DATASETS` in `fetch_external.py` (or drop its CSV/JSON into `data/external/`).
Adding real labelled BaitBreak messages to `data/external/` is the single biggest accuracy improvement available.
