"""Download the public Hugging Face datasets into data/external/.

Run this on a machine with internet access to huggingface.co:
    pip install huggingface_hub
    python fetch_external.py
Then re-run:  python build_dataset.py   and re-run the notebook.

Add more repo ids to DATASETS if your team uses a different Indian multilingual
scam dataset (any .csv / .json / .jsonl / .parquet with a text column and a label column works).
"""
from pathlib import Path
from huggingface_hub import snapshot_download

DATASETS = [
    "bolewara/hinglish-scam-text-dataset",      # Hinglish & English financial scam dataset
    "Shade63/scam-classification-multiclass",   # Indian-context SMS/email scam messages
]
OUT = Path("data/external")
OUT.mkdir(parents=True, exist_ok=True)
for repo in DATASETS:
    dest = OUT / repo.replace("/", "__")
    snapshot_download(repo_id=repo, repo_type="dataset", local_dir=dest,
                      allow_patterns=["*.csv", "*.json", "*.jsonl", "*.parquet"])
    print("downloaded", repo, "->", dest)
