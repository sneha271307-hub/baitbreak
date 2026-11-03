"""Smoke test for the running API (no extra packages needed).
    python test_api.py                      # tests http://127.0.0.1:8000
    python test_api.py http://host:port
"""
import json, sys, urllib.request, urllib.error

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
CASES = [
    ("Your bank account will be blocked. Share OTP immediately.", "scam"),
    ("आपका खाता बंद हो जाएगा। अभी KYC अपडेट करें और OTP शेयर करें।", "scam"),
    ("Aapka account block ho jayega, turant OTP bhejein", "scam"),
    ("Congratulations! You won Rs 50,000 lottery. Click bit.ly/claim-now to claim your prize.", "scam"),
    ("Bhai kal shaam 6 baje milte hain, late mat hona", "legitimate"),
    ("Hey, lunch at 1 tomorrow? Let me know.", "legitimate"),
    ("मीटिंग कल शाम 4 बजे कॉन्फ्रेंस रूम बी में शिफ्ट हो गई है।", "legitimate"),
]

def post(body: bytes):
    req = urllib.request.Request(f"{BASE}/predict", data=body, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

ok = True
for text, expected in CASES:
    status, out = post(json.dumps({"message": text}).encode("utf-8"))
    good = status == 200 and out.get("success") and out["prediction"] == expected and 0 <= out["confidence"] <= 1
    ok &= bool(good)
    print("PASS" if good else "FAIL", status, out, "|", text[:60])
for label, body, want in [("empty message", b'{"message": "  "}', 400), ("missing field", b'{"msg": "x"}', 422)]:
    status, out = post(body); good = status == want and out.get("success") is False; ok &= good
    print("PASS" if good else "FAIL", status, out, "|", label)
print("\nALL PASSED" if ok else "\nSOME TESTS FAILED"); sys.exit(0 if ok else 1)
