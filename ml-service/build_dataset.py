"""Combine all sources -> clean -> de-duplicate -> standardise labels -> dataset.csv

Sources (each optional except UCI):
  * UCI SMS Spam Collection        data/sms_raw.tsv          (English)
  * Hand-authored seed set         data/seed_indian.csv      (Hindi / Hinglish / English)
  * Any file in data/external/**   (downloaded by fetch_external.py)
Labels: 0 = Legitimate, 1 = Scam.   Hindi, Hinglish and English text is preserved.
"""
import json
from pathlib import Path
import pandas as pd
from preprocess import clean_text, detect_language

POS = {"1", "spam", "scam", "fraud", "phishing", "smishing", "malicious", "true", "yes"}
NEG = {"0", "ham", "legit", "legitimate", "benign", "safe", "normal", "not spam", "not scam", "false", "no"}
TEXT_COLS = ["text", "message", "Message", "sms", "SMS", "content", "body", "v2", "Text"]
LABEL_COLS = ["label", "Label", "category", "Category", "class", "target", "v1", "spam"]


def norm_label(v):
    s = str(v).strip().lower()
    if s in POS: return 1
    if s in NEG: return 0
    try:
        return 1 if float(s) >= 1 else 0
    except ValueError:
        return None


def load_any(path: Path) -> pd.DataFrame:
    suf = path.suffix.lower()
    if suf == ".csv":
        df = pd.read_csv(path, encoding="utf-8", on_bad_lines="skip")
    elif suf == ".parquet":
        df = pd.read_parquet(path)
    elif suf == ".jsonl":
        df = pd.read_json(path, lines=True)
    else:
        raw = json.loads(path.read_text(encoding="utf-8"))
        df = pd.DataFrame(raw if isinstance(raw, list) else raw.get("data", raw))
    tcol = next((c for c in TEXT_COLS if c in df.columns), None)
    lcol = next((c for c in LABEL_COLS if c in df.columns), None)
    if tcol is None or lcol is None:
        raise ValueError(f"{path}: cannot find text/label columns in {list(df.columns)}")
    out = pd.DataFrame({"message": df[tcol], "label": df[lcol].map(norm_label)})
    out["source"] = "ext:" + path.parent.name
    out["group"] = ""
    return out


def main():
    frames = []
    uci = pd.read_csv("data/sms_raw.tsv", sep="\t", header=None, names=["label", "message"], encoding="utf-8")
    uci["label"] = uci["label"].map({"ham": 0, "spam": 1})
    uci["source"], uci["group"] = "uci_sms", ""
    frames.append(uci)
    frames.append(pd.read_csv("data/seed_indian.csv"))
    for p in sorted(Path("data/external").rglob("*")):
        if p.suffix.lower() in {".csv", ".json", ".jsonl", ".parquet"}:
            try:
                frames.append(load_any(p)); print("loaded external:", p)
            except Exception as e:
                print("SKIPPED", p, "->", e)

    df = pd.concat(frames, ignore_index=True)
    n0 = len(df)
    df = df.dropna(subset=["label"])
    df["message"] = df["message"].astype(str).str.strip()
    df = df[df["message"].ne("") & df["message"].str.lower().ne("nan")]
    n_empty = n0 - len(df)
    df["clean"] = df["message"].map(clean_text)
    df = df[df["clean"].ne("")]
    before = len(df)
    # de-duplicate on cleaned text (catches case/punctuation/URL-only variants)
    conflict = df.groupby("clean")["label"].nunique()
    conflict = set(conflict[conflict > 1].index)
    df = df[~df["clean"].isin(conflict)]            # same text with both labels -> drop (label noise)
    df = df.drop_duplicates("clean", keep="first")
    df["label"] = df["label"].astype(int)
    df["language"] = df["message"].map(detect_language)
    # group id used for leakage-free splitting (templates / identical wording families)
    df["group"] = df["group"].where(df["group"].astype(str).ne("") & df["group"].notna(), "row_" + df.index.astype(str))
    df = df[["message", "clean", "label", "language", "source", "group"]].reset_index(drop=True)
    df.to_csv("dataset.csv", index=False, encoding="utf-8")
    print(f"raw rows {n0} | empty/unlabelled removed {n_empty} | label-conflicts removed {len(conflict)} "
          f"| duplicates removed {before - len(conflict) - len(df)}")
    print("final rows:", len(df))
    print(df.groupby(["language", "label"]).size().unstack(fill_value=0))
    print(df.source.value_counts())


if __name__ == "__main__":
    main()
