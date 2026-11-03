"""Text cleaning shared by training (notebook) and the FastAPI service.

IMPORTANT: training and serving MUST use the same function, otherwise the
model sees differently-formatted text in production than it was trained on.
Hindi (Devanagari), Hinglish (Roman Hindi) and English are all preserved.
"""
import re
import unicodedata

_ZERO_WIDTH = re.compile(r"[\u200b\u200c\u200d\u2060\ufeff]")
_EMAIL = re.compile(r"\b[\w.+-]+@[\w-]+(\.[\w-]+)+\b")
_URL = re.compile(
    r"(https?://\S+|www\.\S+|\b[\w-]+(?:\.[\w-]+)*\.(?:com|in|co|net|org|xyz|top|info|ly|me|live|site|online|link|cc)\b(?:/\S*)?)",
    re.I,
)
_PHONE = re.compile(r"(?<!\d)(?:\+?91[\s-]?)?[6-9]\d{9}(?!\d)")
_TOLLFREE = re.compile(r"(?<!\d)1800[\s-]?\d[\d\s-]{4,}")
_LONGNUM = re.compile(r"\d{4,}")
# keep letters, digits, whitespace and the whole Devanagari block (incl. vowel signs)
_PUNCT = re.compile(r"[^\w\s\u0900-\u0963\u0966-\u097F]")
_SPACES = re.compile(r"\s+")


def clean_text(text) -> str:
    """Lower-case, normalise unicode, mask URLs/phones/long numbers, strip punctuation."""
    if text is None:
        return ""
    t = unicodedata.normalize("NFC", str(text))
    t = _ZERO_WIDTH.sub("", t)
    t = t.replace("\u20b9", " rs ")            # rupee sign
    t = t.replace("\u0964", " ").replace("\u0965", " ")  # Devanagari danda
    t = _EMAIL.sub(" emailtoken ", t)
    t = _URL.sub(" urltoken ", t)
    t = _PHONE.sub(" phonetoken ", t)
    t = _TOLLFREE.sub(" phonetoken ", t)
    t = _LONGNUM.sub(" longnum ", t)
    t = t.lower()
    t = _PUNCT.sub(" ", t)
    return _SPACES.sub(" ", t).strip()


_DEVANAGARI = re.compile(r"[\u0900-\u097F]")
_HINGLISH_WORDS = set("""
aap aapka aapki aapke aapko hai hain ho hoga hogi karein karo kare karna kiya kal aaj abhi turant
nahi nahin bhai yaar mera meri mere tum tumhara bhejo bhejein bhej batayein bata dena dunga
kya kyun kyunki warna agar mein pe liye ghar paisa paise jaldi ka ki ke ko se
raha rahe rahi gaya gayi gaye jayega jayegi chalein chalo baje subah shaam raat kamao kamayein
badhai mubarak shukriya dhanyavaad inaam jeeta jeeti band chalu wapas phasa kho khana hum aapne
""".split())


def detect_language(text) -> str:
    """Cheap heuristic: 'hindi' (Devanagari), 'hinglish' (Roman Hindi) or 'english'."""
    s = str(text)
    if _DEVANAGARI.search(s):
        return "hindi"
    toks = re.findall(r"[a-z]+", s.lower())
    hits = sum(1 for w in toks if w in _HINGLISH_WORDS)
    if hits >= 2 or (hits == 1 and len(toks) <= 4):
        return "hinglish"
    return "english"
