import nbformat as nbf
nb = nbf.v4.new_notebook()
md = lambda s: nb.cells.append(nbf.v4.new_markdown_cell(s))
code = lambda s: nb.cells.append(nbf.v4.new_code_cell(s))

md("""# BaitBreak – Scam Message Detection: Training Notebook
**Pipeline:** `dataset.csv` → group-aware split → TF-IDF (word + character n-grams) → Logistic Regression vs Multinomial Naive Bayes → pick best by cross-validated F1 → evaluate on hold-out **and** on a separate hand-written unseen Hindi/Hinglish/English set → save `model.pkl` + `vectorizer.pkl`.

Labels: **0 = Legitimate, 1 = Scam**. Run `python build_dataset.py` first if `dataset.csv` is missing.""")

code("""import json, warnings, joblib, numpy as np, pandas as pd
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.base import clone
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import GroupShuffleSplit, GroupKFold, GridSearchCV
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score,
                             confusion_matrix, classification_report)
from preprocess import clean_text, detect_language
warnings.filterwarnings("ignore")
SEED = 42
df = pd.read_csv("dataset.csv")
df["clean"] = df["message"].map(clean_text)      # same cleaner the API uses
print(df.shape)
df.head()""")

md("## 1. Dataset overview")
code("""print(df.groupby(["language", "label"]).size().unstack(fill_value=0).rename(columns={0: "legit", 1: "scam"}))
print()
print(df.source.value_counts())""")

md("""## 2. Train / test split
Synthetic seed messages come from templates, so a plain random split would put near-identical sentences in both train and test and inflate scores. We split with `GroupShuffleSplit` so **every template family stays entirely on one side** (UCI rows are their own groups).""")
code("""gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED)
tr_idx, te_idx = next(gss.split(df, df.label, groups=df.group))
train, test = df.iloc[tr_idx].reset_index(drop=True), df.iloc[te_idx].reset_index(drop=True)
print("train", train.shape, "test", test.shape)
print(test.groupby(["language", "label"]).size().unstack(fill_value=0))""")

md("""## 3. TF-IDF + model comparison
The vectorizer combines **word 1-2-grams** (meaning) and **character 2-5-grams** (robust to Hinglish spelling variants such as *karein/karen/karo* and to Devanagari). Hyper-parameters are chosen by 5-fold `GroupKFold` cross-validation (F1 of the scam class) on the training split only.""")
code("""def make_vectorizer():
    return FeatureUnion([
        ("word", TfidfVectorizer(ngram_range=(1, 2), token_pattern=r"\\S+", sublinear_tf=True, min_df=1)),
        ("char", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), sublinear_tf=True, min_df=2)),
    ])

candidates = {
    "Logistic Regression": (LogisticRegression(max_iter=2000, class_weight="balanced", random_state=SEED),
                            {"clf__C": [1, 5, 20]}),
    "Multinomial Naive Bayes": (MultinomialNB(), {"clf__alpha": [0.05, 0.1, 0.5, 1.0]}),
}
cv = GroupKFold(n_splits=5)
searches = {}
for name, (clf, grid) in candidates.items():
    pipe = Pipeline([("vec", make_vectorizer()), ("clf", clf)])
    gs = GridSearchCV(pipe, grid, scoring="f1", cv=cv, n_jobs=-1)
    gs.fit(train.clean, train.label, groups=train.group)
    searches[name] = gs
    print(f"{name:25s} best params {gs.best_params_}  CV F1 = {gs.best_score_:.4f}")""")

md("## 4. Hold-out evaluation (accuracy, precision, recall, F1, confusion matrix)")
code("""def metrics(y, p):
    return dict(accuracy=accuracy_score(y, p), precision=precision_score(y, p, zero_division=0),
                recall=recall_score(y, p, zero_division=0), f1=f1_score(y, p, zero_division=0),
                confusion_matrix=confusion_matrix(y, p, labels=[0, 1]).tolist())

holdout = {}
for name, gs in searches.items():
    pred = gs.predict(test.clean)
    holdout[name] = metrics(test.label, pred)
    holdout[name].update(cv_f1=gs.best_score_, best_params=gs.best_params_)
    print("=" * 60, "\\n", name, "\\n", classification_report(test.label, pred, target_names=["Legitimate", "Scam"], digits=4))
pd.DataFrame(holdout).T[["accuracy", "precision", "recall", "f1", "cv_f1"]].round(4)""")

code("""best_name = max(searches, key=lambda n: searches[n].best_score_)   # chosen on CV only, never on the test set
print("Selected model:", best_name)
best_pred = searches[best_name].predict(test.clean)

# per-language and per-source hold-out performance of the selected model
rows = []
for lang, g in test.groupby("language"):
    p = best_pred[g.index]
    rows.append(dict(slice=f"language={lang}", n=len(g), **{k: v for k, v in metrics(g.label, p).items() if k != "confusion_matrix"}))
uci = test[test.source == "uci_sms"]
rows.append(dict(slice="source=uci_sms (real English SMS only)", n=len(uci),
                 **{k: v for k, v in metrics(uci.label, best_pred[uci.index]).items() if k != "confusion_matrix"}))
per_slice = pd.DataFrame(rows).round(4); per_slice""")

code("""fig, axes = plt.subplots(1, 2, figsize=(9, 3.6))
for ax, (name, gs) in zip(axes, searches.items()):
    cm = np.array(holdout[name]["confusion_matrix"])
    ax.imshow(cm, cmap="Blues")
    ax.set_xticks([0, 1], ["Legit", "Scam"]); ax.set_yticks([0, 1], ["Legit", "Scam"])
    ax.set_xlabel("Predicted"); ax.set_ylabel("Actual"); ax.set_title(name, fontsize=10)
    for i in range(2):
        for j in range(2):
            ax.text(j, i, cm[i, j], ha="center", va="center", color="white" if cm[i, j] > cm.max() / 2 else "black", fontsize=13)
plt.tight_layout(); plt.savefig("reports/confusion_holdout.png", dpi=160); plt.show()""")

md("""## 5. Final model
The selected configuration is **re-fitted on all of `dataset.csv`** (train + hold-out) so the shipped model uses as much Hindi/Hinglish data as possible. The hold-out numbers above come from the train-only model; the truly independent check of the *shipped* model is the unseen set in section 6.""")
code("""best_pipe = searches[best_name].best_estimator_
vec = clone(best_pipe.named_steps["vec"]); clf = clone(best_pipe.named_steps["clf"])
X_all = vec.fit_transform(df.clean)
clf.fit(X_all, df.label)
joblib.dump(clf, "model.pkl"); joblib.dump(vec, "vectorizer.pkl")
print("saved model.pkl / vectorizer.pkl ->", type(clf).__name__, "| features:", X_all.shape[1])""")

md("""## 6. Unseen Hindi / Hinglish / English messages
`data/unseen_test.csv` – 72 hand-written messages (12 scam + 12 legitimate per language) that are **not** in `dataset.csv` and were never used for training or model selection. It includes tricky legitimate bank/OTP messages ("Do not share OTP") that resemble scams.""")
code("""un = pd.read_csv("data/unseen_test.csv")
m = joblib.load("model.pkl"); v = joblib.load("vectorizer.pkl")
proba = m.predict_proba(v.transform(un.message.map(clean_text)))
un["pred"] = proba.argmax(1); un["confidence"] = proba.max(1).round(3)
unseen = {"overall": metrics(un.label, un.pred), "per_language": {}}
for lang, g in un.groupby("language"):
    unseen["per_language"][lang] = {k: v_ for k, v_ in metrics(g.label, g.pred).items() if k != "confusion_matrix"}
    unseen["per_language"][lang]["n"] = len(g)
print({k: round(v_, 4) for k, v_ in unseen["overall"].items() if k != "confusion_matrix"})
pd.DataFrame(unseen["per_language"]).T.round(4)""")
code("""wrong = un[un.label != un.pred][["language", "label", "pred", "confidence", "message"]]
unseen["errors"] = wrong.assign(message=wrong.message).to_dict("records")
print(f"{len(wrong)} / {len(un)} unseen messages misclassified")
wrong""")
code("""cm = np.array(unseen["overall"]["confusion_matrix"])
fig, ax = plt.subplots(figsize=(4, 3.6)); ax.imshow(cm, cmap="Blues")
ax.set_xticks([0, 1], ["Legit", "Scam"]); ax.set_yticks([0, 1], ["Legit", "Scam"])
ax.set_xlabel("Predicted"); ax.set_ylabel("Actual"); ax.set_title("Unseen set (n=72)", fontsize=10)
for i in range(2):
    for j in range(2):
        ax.text(j, i, cm[i, j], ha="center", va="center", color="white" if cm[i, j] > cm.max() / 2 else "black", fontsize=13)
plt.tight_layout(); plt.savefig("reports/confusion_unseen.png", dpi=160); plt.show()""")

md("## 7. Save metrics (used to build `evaluation_report.pdf`) and smoke-test")
code("""out = dict(
    selected_model=best_name,
    n_total=len(df), n_train=len(train), n_test=len(test),
    dataset_by_language=df.groupby(["language", "label"]).size().unstack(fill_value=0).rename(columns={0: "legit", 1: "scam"}).to_dict("index"),
    dataset_by_source=df.source.value_counts().to_dict(),
    holdout=holdout, holdout_per_slice=per_slice.to_dict("records"), unseen=unseen)
json.dump(out, open("reports/metrics.json", "w", encoding="utf-8"), indent=2, ensure_ascii=False, default=float)

for msg in ["Your bank account will be blocked. Share OTP immediately.",
            "आपका खाता ब्लॉक हो जाएगा, तुरंत OTP भेजें",
            "Bhai kal 6 baje milte hain, late mat hona"]:
    p = m.predict_proba(v.transform([clean_text(msg)]))[0]
    print(("scam" if p[1] >= .5 else "legitimate"), round(float(p.max()), 3), "|", msg)""")

nbf.write(nb, "train_model.ipynb")
