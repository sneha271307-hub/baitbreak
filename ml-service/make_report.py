import json
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether

m = json.load(open("reports/metrics.json", encoding="utf-8"))
ss = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=ss["Heading1"], fontSize=15, spaceBefore=10, spaceAfter=6, textColor=colors.HexColor("#1f3a5f"))
H2 = ParagraphStyle("H2", parent=ss["Heading2"], fontSize=11.5, spaceBefore=8, spaceAfter=4, textColor=colors.HexColor("#1f3a5f"))
B = ParagraphStyle("B", parent=ss["BodyText"], fontSize=9.5, leading=13.5)
S = ParagraphStyle("S", parent=B, fontSize=8.3, leading=11, textColor=colors.HexColor("#444444"))
CELL = ParagraphStyle("C", parent=B, fontSize=8.3, leading=10.5)
f4 = lambda x: f"{x:.4f}"
pct = lambda x: f"{100 * x:.1f}%"

def table(data, widths=None, header=True, align_right_from=1):
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    st = [("FONTSIZE", (0, 0), (-1, -1), 8.5), ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#b8c2cc")),
          ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f4f7fa")])]
    if header:
        st += [("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f3a5f")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
               ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold")]
    if align_right_from is not None:
        st.append(("ALIGN", (align_right_from, 1), (-1, -1), "RIGHT"))
    t.setStyle(TableStyle(st)); return t

ho, un = m["holdout"], m["unseen"]
sel = m["selected_model"]
story = []
story += [Paragraph("BaitBreak - Scam Message Detection", ParagraphStyle("T", parent=ss["Title"], fontSize=21, spaceAfter=2)),
          Paragraph("Model Evaluation Report (Hindi / Hinglish / English)", ParagraphStyle("ST", parent=B, fontSize=12, textColor=colors.HexColor("#555555"))),
          Spacer(1, 8)]

story += [Paragraph("1. Summary", H1),
 Paragraph(f"A TF-IDF (word 1-2 grams + character 2-5 grams) text classifier was trained to label messages as <b>Legitimate (0)</b> or <b>Scam (1)</b>. "
           f"Logistic Regression and Multinomial Naive Bayes were compared with 5-fold grouped cross-validation; <b>{sel}</b> was selected "
           f"(CV F1 {f4(ho[sel]['cv_f1'])}). On the held-out test split it reached accuracy {pct(ho[sel]['accuracy'])}, scam-class precision {pct(ho[sel]['precision'])}, "
           f"recall {pct(ho[sel]['recall'])} and F1 {pct(ho[sel]['f1'])}. On a separate set of 72 unseen, hand-written Hindi/Hinglish/English messages the shipped model reached "
           f"accuracy {pct(un['overall']['accuracy'])} and scam F1 {pct(un['overall']['f1'])}.", B),
 Spacer(1, 4),
 Paragraph("<b>Important caveat (read before relying on these numbers):</b> the Hindi and Hinglish portions of the training data in this build are "
           "<b>template-based synthetic messages</b> written for this project, because the two Hugging Face datasets could not be downloaded in the build environment. "
           "English performance on the real UCI SMS data is a trustworthy estimate; Hindi/Hinglish figures are encouraging but come from small samples and should be "
           "re-measured after retraining with the real datasets (<font face='Courier'>fetch_external.py</font> then <font face='Courier'>build_dataset.py</font>) and with real BaitBreak user messages.", B)]

story += [Paragraph("2. Dataset", H1),
 Paragraph(f"Final cleaned dataset: <b>{m['n_total']:,}</b> unique messages (label 0 = Legitimate, 1 = Scam). Hindi (Devanagari), Hinglish (Roman-script Hindi) and English text are all preserved.", B)]
rows = [["Language", "Legitimate", "Scam", "Total"]]
for lang in ["english", "hinglish", "hindi"]:
    d = m["dataset_by_language"][lang]; rows.append([lang.capitalize(), f"{d['legit']:,}", f"{d['scam']:,}", f"{d['legit'] + d['scam']:,}"])
story += [Spacer(1, 4), table(rows, [5 * cm, 3.2 * cm, 3.2 * cm, 3.2 * cm])]
src = m["dataset_by_source"]
rows = [["Source", "Rows", "Notes"],
        ["UCI SMS Spam Collection", f"{src.get('uci_sms', 0):,}", Paragraph("Real English SMS (ham/spam). Loaded from a GitHub mirror of the UCI file (5,574 raw rows).", CELL)],
        ["Synthetic seed set", f"{src.get('synthetic_seed', 0):,}", Paragraph("Hand-authored Indian-style scam/legit templates in Hindi, Hinglish and English (KYC, OTP, UPI, lottery, loan, job, customs, impersonation scams and genuine bank/OTP/delivery/personal messages).", CELL)],
        ["Hinglish and English Financial Scam (HF)", "0", Paragraph("Not included in this build (network blocked). Supported by build_dataset.py.", CELL)],
        ["Indian Multilingual Scam (HF)", "0", Paragraph("Not included in this build (network blocked). Supported by build_dataset.py.", CELL)]]
story += [Spacer(1, 6), table(rows, [5.3 * cm, 1.8 * cm, 9.6 * cm], align_right_from=None)]
story += [Paragraph("Preparation steps", H2),
 Paragraph("(1) Combine all sources; (2) drop empty / unlabelled rows; (3) clean text - Unicode NFC normalisation, remove zero-width characters, lower-case, mask URLs, e-mails, phone numbers and long digit strings "
           "with placeholder tokens, strip punctuation while keeping the whole Devanagari block; (4) remove duplicates on the cleaned text (and drop any text that appeared with both labels); "
           "(5) standardise labels to 0 = Legitimate, 1 = Scam; (6) tag each row with a language (Devanagari = Hindi, Roman Hindi vocabulary = Hinglish, otherwise English).", B)]

story += [Paragraph("3. Method", H1),
 Paragraph("<b>Split.</b> 80/20 grouped split: all messages generated from the same template are kept on the same side, so the test set measures generalisation to new wording instead of memorisation. "
           f"Train = {m['n_train']:,}, test = {m['n_test']:,}.", B),
 Paragraph("<b>Features.</b> TF-IDF with sublinear term frequency: word 1-2 grams combined with character 2-5 grams (robust to Hinglish spelling variation and Devanagari).", B),
 Paragraph("<b>Models.</b> Logistic Regression (balanced class weights, C tuned over {1, 5, 20}) and Multinomial Naive Bayes (alpha tuned over {0.05, 0.1, 0.5, 1.0}). "
           "Selection used 5-fold GroupKFold F1 of the scam class on the training split only; the test set played no role in selection. "
           "The selected configuration was then re-fitted on the full dataset for deployment (model.pkl, vectorizer.pkl).", B)]

story += [Paragraph("4. Hold-out results", H1),
 Paragraph("Positive class = Scam. Because most test messages are legitimate, accuracy alone is flattering; precision, recall and F1 of the scam class are the headline numbers.", B), Spacer(1, 4)]
rows = [["Model", "CV F1", "Accuracy", "Precision", "Recall", "F1"]]
for n, v in ho.items():
    rows.append([n + ("  (selected)" if n == sel else ""), f4(v["cv_f1"]), f4(v["accuracy"]), f4(v["precision"]), f4(v["recall"]), f4(v["f1"])])
story += [table(rows, [5.2 * cm, 2.2 * cm, 2.3 * cm, 2.3 * cm, 2.3 * cm, 2.2 * cm])]
rows = [["Confusion matrix (test)", "TN (legit ok)", "FP (legit flagged)", "FN (scam missed)", "TP (scam caught)"]]
for n, v in ho.items():
    (tn, fp), (fn, tp) = v["confusion_matrix"]; rows.append([n, tn, fp, fn, tp])
story += [Spacer(1, 6), table(rows, [5.2 * cm, 2.7 * cm, 3.1 * cm, 3 * cm, 3 * cm]), Spacer(1, 6),
          Image("reports/confusion_holdout.png", width=13.5 * cm, height=13.5 * cm * 3.6 / 9)]
story += [Paragraph("Selected model by slice (hold-out)", H2)]
rows = [["Slice", "n", "Accuracy", "Precision", "Recall", "F1"]]
for r in m["holdout_per_slice"]:
    rows.append([r["slice"], r["n"], f4(r["accuracy"]), f4(r["precision"]), f4(r["recall"]), f4(r["f1"])])
story += [table(rows, [6.6 * cm, 1.4 * cm, 2.3 * cm, 2.3 * cm, 2.1 * cm, 2 * cm]),
          Paragraph("The Hindi and Hinglish slices contain only a few dozen messages, so their scores have wide error margins.", S)]

story += [PageBreak(), Paragraph("5. Unseen Hindi / Hinglish / English test", H1),
 Paragraph("72 hand-written messages (12 scam + 12 legitimate per language) that are not in the training dataset and were not used for model selection. "
           "They include realistic legitimate bank/OTP alerts (\"do not share OTP\") that look superficially like scams. "
           "Note: these were written by the same team that wrote the seed set, so they are not fully independent of it; messages collected from real users will be a tougher test.", B), Spacer(1, 4)]
o = un["overall"]; (tn, fp), (fn, tp) = o["confusion_matrix"]
rows = [["Subset", "n", "Accuracy", "Precision", "Recall", "F1"],
        ["Overall", 72, f4(o["accuracy"]), f4(o["precision"]), f4(o["recall"]), f4(o["f1"])]]
for lang in ["english", "hinglish", "hindi"]:
    v = un["per_language"][lang]; rows.append([lang.capitalize(), v["n"], f4(v["accuracy"]), f4(v["precision"]), f4(v["recall"]), f4(v["f1"])])
story += [table(rows, [4.5 * cm, 1.5 * cm, 2.6 * cm, 2.6 * cm, 2.6 * cm, 2.6 * cm]), Spacer(1, 6)]
story += [table([["Confusion matrix (unseen)", "TN", "FP", "FN", "TP"], ["Selected model", tn, fp, fn, tp]], [5.2 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm]),
          Spacer(1, 6), Image("reports/confusion_unseen.png", width=6.3 * cm, height=6.3 * cm * 3.6 / 4)]

gloss = {"आपके एचडीएफसी कार्ड": "[Hindi] Your HDFC card (4521) was charged Rs 1,250 at Big Bazaar on 02 Nov. Not you? Call the number on the back of the card."}
story += [Paragraph("Misclassified messages", H2)]
rows = [["Lang", "Actual", "Predicted", "Conf.", "Message"]]
for e in un["errors"]:
    txt = e["message"]
    for k, g in gloss.items():
        if txt.startswith(k): txt = g
    rows.append([e["language"], "scam" if e["label"] else "legit", "legit" if e["label"] else "scam", f"{e['confidence']:.2f}", Paragraph(txt.replace("&", "&amp;")[:170], CELL)])
story += [table(rows, [1.7 * cm, 1.5 * cm, 1.8 * cm, 1.3 * cm, 10.4 * cm], align_right_from=None),
          Paragraph("(Hindi text is shown as an English gloss because the PDF font cannot render Devanagari; see the notebook for the original.)", S)]
story += [Paragraph("Reading the errors", H2),
 Paragraph("Two patterns dominate. (a) <b>Genuine bank debit alerts</b> that say \"Not you? Call...\" are flagged as scams because the wording overlaps with fake-debit scams; "
           "a genuine login-OTP message was also flagged, though only borderline (0.55). These are the most important things to fix with more real data, since false alarms on genuine bank/OTP messages hurt user trust. "
           "(b) <b>Novel scam stories</b> (stranded-friend money request, WhatsApp code forwarding) were caught only with low confidence or missed, as similar examples are scarce in training.", B)]

story += [Paragraph("6. Limitations and recommended next steps", H1),
 Paragraph("- <b>Data provenance:</b> Hindi/Hinglish training data is synthetic in this build. Run <font face='Courier'>python fetch_external.py</font> and rebuild/retrain with the real Hugging Face datasets, then re-run the notebook and regenerate this report.<br/>"
           "- <b>Add real examples:</b> collect and label real BaitBreak user messages (especially genuine bank alerts) and re-test; keep a frozen real-world test set.<br/>"
           "- <b>Confidence is a model probability</b>, not a guarantee. Treat 0.5-0.7 as 'uncertain' in the UI (e.g. show a softer warning). The threshold is configurable via SCAM_THRESHOLD.<br/>"
           "- <b>Scope:</b> classical bag-of-n-grams model; no URL reputation, sender, or conversation context. It should be one signal among several, not the only safeguard.<br/>"
           "- <b>Drift:</b> scam wording changes quickly; plan periodic retraining and monitoring of false positives/negatives.", B)]

doc = SimpleDocTemplate("evaluation_report.pdf", pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=1.8 * cm, bottomMargin=1.8 * cm,
                        title="BaitBreak - Model Evaluation Report", author="BaitBreak ML")
doc.build(story)
print("ok")
