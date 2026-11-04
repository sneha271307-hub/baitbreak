"""Generates data/seed_indian.csv (template-based Hindi/Hinglish/English Indian
scam + legitimate messages) and data/unseen_test.csv (hand-written, NEVER used
for training).  The seed set stands in for the Hinglish / Indian datasets when
Hugging Face is not reachable; real data from fetch_external.py is merged on top.
"""
import itertools, random
import pandas as pd

random.seed(42)
BANKS = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "PNB", "Bank of Baroda", "Kotak Bank"]
BANKS_HI = ["एसबीआई", "एचडीएफसी बैंक", "आईसीआईसी आई बैंक", "एक्सिस बैंक", "पीएनबी", "बैंक ऑफ बड़ौदा", "कोटक बैंक"]
URLS = ["bit.ly/kyc-upd8", "sbi-kyc-update.in/login", "tinyurl.com/claim-now", "hdfc-verify.co/secure",
        "bit.ly/3xYzAb", "paytm-reward.top/claim", "jio-offer.xyz/win", "http://upi-refund.site/get", "www.aadhaar-link.online/verify"]
AMTS = ["5,000", "10,000", "25,000", "50,000", "1,00,000", "2,50,000", "12,500", "7,500"]
PHONES = ["9876501234", "8800123456", "+91 9123456780", "7011223344", "9999000111"]
NAMES = ["Rahul", "Priya", "Amit", "Neha", "Sneha", "Vikram", "Pooja", "Rohan"]
NAMES_HI = ["राहुल", "प्रिया", "अमित", "नेहा", "स्नेहा", "विक्रम", "पूजा", "रोहन"]
TIMES = ["6 baje", "7:30 baje", "kal subah", "shaam ko"]
TIMES_EN = ["at 6 pm", "at 7:30", "tomorrow morning", "this evening"]
TIMES_HI = ["6 बजे", "7:30 बजे", "कल सुबह", "शाम को"]

def slot_sets():
    for i in range(10):
        yield dict(
            bank=BANKS[i % 7], bankhi=BANKS_HI[i % 7], url=random.choice(URLS), amt=random.choice(AMTS),
            phone=random.choice(PHONES), name=NAMES[i % 8], namehi=NAMES_HI[i % 8],
            time=TIMES[i % 4], timeen=TIMES_EN[i % 4], timehi=TIMES_HI[i % 4],
            n4=random.randint(1000, 9999), ref=random.randint(100000, 999999),
            otp=random.randint(100000, 999999), pnr=random.randint(1000000000, 9999999999))

EN_SCAM = [
 "Dear customer, your {bank} account will be blocked today. Update KYC immediately at {url}",
 "URGENT: Your {bank} account has been suspended. Share OTP to reactivate within 2 hours.",
 "Congratulations! You have won Rs {amt} in the Jio lucky draw. Click {url} to claim your prize.",
 "Your PAN card will be deactivated. Verify your Aadhaar and PAN now at {url} to avoid penalty.",
 "You are eligible for a pre-approved personal loan of Rs {amt}. Pay processing fee Rs 999 to receive money instantly. Call {phone}",
 "Work from home job! Earn Rs {amt} per month. Pay registration fee of Rs 500 to start. WhatsApp {phone}",
 "Your electricity connection will be disconnected tonight at 9:30 pm due to unpaid bill. Call {phone} immediately.",
 "Income tax refund of Rs {amt} is pending. Submit your bank details at {url} to receive it.",
 "Your SIM will be blocked in 24 hours. Complete KYC verification at {url}",
 "Rs {amt} debited from your account via UPI. If not you, share OTP/PIN to cancel the transaction.",
 "Your parcel is held at customs. Pay Rs 1,500 clearance fee at {url} to release it.",
 "Cashback of Rs {amt} credited. Click {url} and enter your UPI PIN to receive the amount.",
 "Hi, I am calling from {bank} credit card department. Your card limit is increased, share the card number and CVV to confirm.",
 "Earn guaranteed daily profit by investing in our crypto trading group. Min deposit Rs 5,000. Join now {url}",
 "Your {bank} net banking password expires today. Re-login at {url} to continue services.",
 "Mom, I lost my phone, this is my new number. Please send Rs {amt} urgently, I will return tomorrow.",
 "You have been selected for KBC lottery prize of Rs {amt}. Send Rs 2,000 as tax to claim. Contact {phone}",
 "FINAL NOTICE: Your Aadhaar is linked to illegal activity. Contact CBI officer at {phone} or face arrest.",
 "Free recharge of Rs 599 on your Jio number! Click {url} before the offer ends.",
 "Gas subsidy of Rs {amt} awaiting. Update bank account at {url} to get it credited.",
]
EN_LEGIT = [
 "Rs {amt} debited from A/c XX{n4} via UPI. Ref no {ref}. If not you, call the bank helpline. - {bank}",
 "{otp} is your OTP for login. Do not share it with anyone. Valid for 10 minutes. - {bank}",
 "Your order #{ref} has been shipped and will be delivered by tomorrow. Track it in the app.",
 "Hi {name}, are we meeting {timeen}? Let me know.",
 "Your {bank} statement for October is ready. Login to the official app to view it.",
 "Reminder: your appointment with Dr. Sharma is on Friday at 5 pm.",
 "Thanks for paying your electricity bill of Rs {amt}. Receipt number {ref}.",
 "Happy birthday {name}! Have a great year ahead.",
 "Please submit the assignment before Monday 10 am. - Prof. Gupta",
 "Your train PNR {pnr} is confirmed. Coach S4, berth 23. Happy journey.",
 "Mom said dinner is ready, come home soon.",
 "Salary of Rs {amt} credited to your account XX{n4} on 01-Nov.",
 "Your cylinder booking is confirmed. Delivery expected within 2 days.",
 "Meeting rescheduled to 4 pm tomorrow in conference room B.",
 "Can you send me the notes from today's class?",
 "Your Amazon package was delivered. Rate your experience in the app.",
 "Your credit card bill of Rs {amt} is due on 10-Nov. Pay via the official app to avoid late fee.",
 "Congratulations on your promotion {name}! Well deserved.",
 "Your Jio recharge of Rs 299 is successful. Validity 28 days.",
 "Bhai I'll be late, traffic is heavy.",
]
HG_SCAM = [
 "Aapka {bank} account aaj block ho jayega. Turant KYC update karein {url}",
 "URGENT: Aapka account band ho gaya hai. Dobara chalu karne ke liye abhi OTP share karein.",
 "Badhai ho! Aapne Rs {amt} ka lucky draw jeeta hai. Inaam lene ke liye {url} par click karein.",
 "Aapka PAN card band hone wala hai. Abhi Aadhaar aur PAN verify karein {url}",
 "Aapko Rs {amt} ka instant loan mil sakta hai bina documents ke. Processing fee Rs 999 abhi bhejein. Call {phone}",
 "Ghar baithe kamayein Rs {amt} mahina. Registration fee Rs 500 bhejein aur kaam shuru karein. WhatsApp {phone}",
 "Aapka bijli connection aaj raat 9:30 baje kat jayega kyunki bill pending hai. Abhi {phone} par call karein.",
 "Income tax refund Rs {amt} pending hai. Apni bank details {url} par bhejein.",
 "Aapka SIM 24 ghante mein band ho jayega. KYC complete karne ke liye {url} par jayein.",
 "Aapke account se Rs {amt} UPI se kat gaye. Agar aapne nahi kiya to cancel karne ke liye OTP ya PIN bhejein.",
 "Aapka parcel customs mein ruka hai. Rs 1,500 clearance fee {url} par bhar dein.",
 "Cashback Rs {amt} aaya hai. Paisa lene ke liye {url} par apna UPI PIN daalein.",
 "Main {bank} credit card department se bol raha hoon. Card limit badh gayi hai, confirm karne ke liye card number aur CVV batayein.",
 "Crypto trading group join karein, roz guaranteed profit. Minimum deposit Rs 5,000. {url}",
 "Papa mera phone kho gaya hai, yeh mera naya number hai. Turant Rs {amt} bhej do, kal wapas kar dunga.",
 "KBC lottery mein aapka Rs {amt} ka inaam nikla hai. Tax ke liye Rs 2,000 bhejein. Contact {phone}",
 "Aapka Aadhaar illegal activity se juda hai. Abhi CBI officer ko {phone} par call karein warna arrest hoga.",
 "Free recharge Rs 599 aapke Jio number par! Offer khatam hone se pehle {url} par click karein.",
 "Gas subsidy Rs {amt} aapka wait kar rahi hai. Bank account update karein {url}",
 "Aapka {bank} net banking password aaj expire ho raha hai. Naya login karein {url}",
]
HG_LEGIT = [
 "Rs {amt} aapke account XX{n4} se UPI dwara debit hue. Ref {ref}. - {bank}",
 "{otp} aapka login OTP hai. Kisi ke saath share na karein. 10 minute tak valid. - {bank}",
 "Aapka order #{ref} ship ho gaya hai, kal tak deliver ho jayega.",
 "Hi {name}, kya hum {time} milenge? Bata dena.",
 "Aapka {bank} October statement ready hai. Official app mein login karke dekh lein.",
 "Reminder: Dr. Sharma ke saath aapka appointment Friday shaam 5 baje hai.",
 "Bijli bill Rs {amt} ka payment ho gaya, shukriya. Receipt no {ref}.",
 "Janamdin mubarak ho {name}! Aapka saal shandaar rahe.",
 "Assignment Monday subah 10 baje tak jama kar dena. - Prof. Gupta",
 "Aapki train PNR {pnr} confirm hai. Coach S4, berth 23. Shubh yatra.",
 "Mummy ne kaha khana ready hai, jaldi ghar aao.",
 "Aapke account XX{n4} mein Rs {amt} salary credit hui hai 01-Nov ko.",
 "Gas cylinder booking confirm ho gayi hai. 2 din mein delivery hogi.",
 "Meeting kal shaam 4 baje conference room B mein shift ho gayi hai.",
 "Bhai aaj ki class ke notes bhej dena please.",
 "Aapka credit card bill Rs {amt} 10-Nov tak due hai. Late fee se bachne ke liye official app se pay karein.",
 "Yaar traffic bahut hai, main thoda late aaunga.",
 "Promotion ki badhai ho {name}! Tum iske hakdar the.",
 "Aapka Jio recharge Rs 299 successful raha. Validity 28 din.",
 "Kal ka match dekhne chalein? Main tickets le leta hoon.",
]
HI_SCAM = [
 "आपका {bankhi} खाता आज ब्लॉक हो जाएगा। तुरंत KYC अपडेट करें {url}",
 "जरूरी: आपका खाता बंद हो गया है। दोबारा चालू करने के लिए अभी OTP शेयर करें।",
 "बधाई हो! आपने Rs {amt} की लकी ड्रॉ जीती है। इनाम पाने के लिए {url} पर क्लिक करें।",
 "आपका पैन कार्ड बंद होने वाला है। अभी आधार और पैन वेरिफाई करें {url}",
 "आपको Rs {amt} का तुरंत लोन मिल सकता है बिना दस्तावेज़ के। प्रोसेसिंग फीस Rs 999 अभी भेजें। कॉल करें {phone}",
 "घर बैठे कमाएं Rs {amt} महीना। रजिस्ट्रेशन फीस Rs 500 भेजें और काम शुरू करें। व्हाट्सएप {phone}",
 "आपका बिजली कनेक्शन आज रात 9:30 बजे कट जाएगा क्योंकि बिल बकाया है। अभी {phone} पर कॉल करें।",
 "इनकम टैक्स रिफंड Rs {amt} बाकी है। अपनी बैंक डिटेल {url} पर भेजें।",
 "आपका सिम 24 घंटे में बंद हो जाएगा। केवाईसी पूरा करने के लिए {url} पर जाएं।",
 "आपके खाते से Rs {amt} यूपीआई से कट गए हैं। अगर आपने नहीं किया तो रद्द करने के लिए OTP या पिन भेजें।",
 "आपका पार्सल कस्टम में रुका है। Rs 1,500 क्लियरेंस फीस {url} पर जमा करें।",
 "कैशबैक Rs {amt} आया है। पैसे पाने के लिए {url} पर अपना यूपीआई पिन डालें।",
 "मैं {bankhi} क्रेडिट कार्ड विभाग से बोल रहा हूं। कार्ड लिमिट बढ़ गई है, कन्फर्म करने के लिए कार्ड नंबर और सीवीवी बताएं।",
 "पापा मेरा फोन खो गया है, यह मेरा नया नंबर है। तुरंत Rs {amt} भेज दो, कल वापस कर दूंगा।",
 "केबीसी लॉटरी में आपका Rs {amt} का इनाम निकला है। टैक्स के लिए Rs 2,000 भेजें। संपर्क करें {phone}",
 "आपका आधार अवैध गतिविधि से जुड़ा है। अभी सीबीआई अधिकारी को {phone} पर कॉल करें वरना गिरफ्तारी होगी।",
 "आपके जियो नंबर पर Rs 599 का फ्री रिचार्ज! ऑफर खत्म होने से पहले {url} पर क्लिक करें।",
 "गैस सब्सिडी Rs {amt} आपका इंतज़ार कर रही है। बैंक खाता अपडेट करें {url}",
 "आपका {bankhi} नेट बैंकिंग पासवर्ड आज एक्सपायर हो रहा है। नया लॉगिन करें {url}",
 "क्रिप्टो ट्रेडिंग ग्रुप जॉइन करें, रोज़ पक्का मुनाफ़ा। न्यूनतम जमा Rs 5,000। {url}",
]
HI_LEGIT = [
 "आपके खाते XX{n4} से Rs {amt} यूपीआई द्वारा डेबिट हुए। रेफ {ref}। - {bankhi}",
 "{otp} आपका लॉगिन OTP है। इसे किसी के साथ शेयर न करें। 10 मिनट तक मान्य। - {bankhi}",
 "आपका ऑर्डर #{ref} भेज दिया गया है, कल तक पहुंच जाएगा।",
 "नमस्ते {namehi}, क्या हम {timehi} मिल रहे हैं? बता देना।",
 "आपका अक्टूबर का स्टेटमेंट तैयार है। आधिकारिक ऐप में लॉगिन करके देखें।",
 "याद दिलाना: डॉ. शर्मा के साथ आपका अपॉइंटमेंट शुक्रवार शाम 5 बजे है।",
 "बिजली बिल Rs {amt} का भुगतान हो गया, धन्यवाद। रसीद संख्या {ref}।",
 "जन्मदिन मुबारक हो {namehi}! आपका साल शानदार रहे।",
 "असाइनमेंट सोमवार सुबह 10 बजे तक जमा कर देना। - प्रो. गुप्ता",
 "आपकी ट्रेन पीएनआर {pnr} कन्फर्म है। कोच S4, बर्थ 23। शुभ यात्रा।",
 "मम्मी ने कहा खाना तैयार है, जल्दी घर आओ।",
 "आपके खाते XX{n4} में 01-नवंबर को Rs {amt} वेतन जमा हुआ है।",
 "गैस सिलेंडर की बुकिंग कन्फर्म हो गई है। 2 दिन में डिलीवरी होगी।",
 "मीटिंग कल शाम 4 बजे कॉन्फ्रेंस रूम बी में शिफ्ट हो गई है।",
 "भाई आज की क्लास के नोट्स भेज देना प्लीज़।",
 "आपका क्रेडिट कार्ड बिल Rs {amt} 10 नवंबर तक देय है। लेट फीस से बचने के लिए आधिकारिक ऐप से भुगतान करें।",
 "यार ट्रैफिक बहुत है, मैं थोड़ा लेट आऊंगा।",
 "प्रमोशन की बधाई हो {namehi}! तुम इसके हकदार थे।",
 "आपका जियो रिचार्ज Rs 299 सफल रहा। वैधता 28 दिन।",
 "कल का मैच देखने चलें? मैं टिकट ले लेता हूं।",
]

EN_SCAM += [
 "Your {bank} debit card has been blocked due to suspicious activity. Call {phone} now to unblock.",
 "Dear customer, update your PAN details today else your {bank} account will be frozen. {url}",
 "Win an iPhone 15 absolutely free! Just pay Rs 99 delivery charges. Order now {url}",
 "Investment offer: double your money in 30 days. Limited seats. Contact {phone} on WhatsApp.",
 "Your courier could not be delivered. Confirm address and pay Rs 49 re-delivery fee at {url}",
 "Dear user, your UPI ID will be deactivated. Verify with your PIN at {url} immediately.",
 "Government scheme: Rs {amt} free to all women. Apply now at {url} with your Aadhaar and bank details.",
 "I am an army officer posted in Kashmir selling my car cheap. Send advance Rs {amt} to book. Urgent.",
 "Your Netflix subscription failed. Update payment details at {url} or account will be closed.",
 "Hot girls in your city waiting to chat. Pay Rs 500 membership. Call {phone}",
]
EN_LEGIT += [
 "Your {bank} debit card ending {n4} has been dispatched and will reach you in 5 working days.",
 "Class timing changed: tomorrow's lecture will start at 9 am instead of 10.",
 "Hi {name}, thanks for your help yesterday. Really appreciate it.",
 "Your Ola ride is arriving in 3 minutes. Driver: Suresh, vehicle number DL 3C 4521.",
 "Water supply will be interrupted tomorrow from 10 am to 2 pm for maintenance.",
 "Your exam hall ticket is available for download on the university website.",
 "Reminder: parent teacher meeting this Saturday at 11 am.",
 "Rs {amt} has been credited to your Paytm wallet by {name}.",
 "Your Airtel postpaid bill for October is Rs {amt}. Due date 15-Nov.",
 "Dinner at 8? I'll book a table at the usual place.",
]
HG_SCAM += [
 "Aapka {bank} debit card suspicious activity ki wajah se block ho gaya hai. Unblock ke liye abhi {phone} par call karein.",
 "Aaj hi PAN details update karein warna aapka {bank} account freeze ho jayega. {url}",
 "iPhone 15 bilkul free jeetein! Bas Rs 99 delivery charge dein. Abhi order karein {url}",
 "Investment offer: 30 din mein paisa double. Limited seats. WhatsApp par contact karein {phone}",
 "Aapka courier deliver nahi ho paya. Address confirm karein aur Rs 49 re-delivery fee {url} par bharein.",
 "Aapki UPI ID band hone wali hai. Turant {url} par apna PIN daal kar verify karein.",
 "Sarkari yojana: sabhi mahilaon ko Rs {amt} free. Aadhaar aur bank details ke saath {url} par apply karein.",
 "Main army officer hoon Kashmir mein, apni car sasti bech raha hoon. Booking ke liye Rs {amt} advance bhejein.",
 "Aapka Netflix subscription fail ho gaya. {url} par payment details update karein warna account band.",
 "Aapke shehar ki girls aapse chat karna chahti hain. Rs 500 membership bharein. Call {phone}",
]
HG_LEGIT += [
 "Aapka {bank} debit card ending {n4} dispatch ho gaya hai, 5 working days mein pahunch jayega.",
 "Class ka time badal gaya hai: kal ka lecture 10 ke bajay 9 baje shuru hoga.",
 "Hi {name}, kal ki madad ke liye thanks. Bahut accha laga.",
 "Aapki Ola ride 3 minute mein aa rahi hai. Driver: Suresh, gaadi number DL 3C 4521.",
 "Kal subah 10 se dopahar 2 baje tak maintenance ke liye paani ki supply band rahegi.",
 "Aapka exam hall ticket university website par download ke liye available hai.",
 "Reminder: is Saturday 11 baje parent teacher meeting hai.",
 "Aapke Paytm wallet mein {name} ne Rs {amt} bheje hain.",
 "Aapka Airtel postpaid bill October ka Rs {amt} hai. Due date 15-Nov.",
 "Raat 8 baje dinner? Main usual jagah par table book kar leta hoon.",
]
HI_SCAM += [
 "संदिग्ध गतिविधि के कारण आपका {bankhi} डेबिट कार्ड ब्लॉक हो गया है। अनब्लॉक के लिए अभी {phone} पर कॉल करें।",
 "आज ही पैन विवरण अपडेट करें वरना आपका {bankhi} खाता फ्रीज हो जाएगा। {url}",
 "आईफोन 15 बिल्कुल मुफ्त जीतें! बस Rs 99 डिलीवरी शुल्क दें। अभी ऑर्डर करें {url}",
 "निवेश ऑफर: 30 दिन में पैसा दोगुना। सीमित सीटें। व्हाट्सएप पर संपर्क करें {phone}",
 "आपका कूरियर डिलीवर नहीं हो पाया। पता कन्फर्म करें और Rs 49 री-डिलीवरी शुल्क {url} पर भरें।",
 "आपकी यूपीआई आईडी बंद होने वाली है। तुरंत {url} पर अपना पिन डालकर वेरिफाई करें।",
 "सरकारी योजना: सभी महिलाओं को Rs {amt} मुफ्त। आधार और बैंक विवरण के साथ {url} पर आवेदन करें।",
 "मैं सेना का अधिकारी हूं कश्मीर में, अपनी कार सस्ती बेच रहा हूं। बुकिंग के लिए Rs {amt} एडवांस भेजें।",
 "आपका नेटफ्लिक्स सब्सक्रिप्शन फेल हो गया। {url} पर पेमेंट विवरण अपडेट करें वरना खाता बंद।",
 "आपके शहर की लड़कियां आपसे चैट करना चाहती हैं। Rs 500 सदस्यता भरें। कॉल करें {phone}",
]
HI_LEGIT += [
 "आपका {bankhi} डेबिट कार्ड ({n4}) भेज दिया गया है, 5 कार्य दिवस में पहुंच जाएगा।",
 "क्लास का समय बदल गया है: कल का लेक्चर 10 की जगह 9 बजे शुरू होगा।",
 "नमस्ते {namehi}, कल की मदद के लिए धन्यवाद। बहुत अच्छा लगा।",
 "आपकी ओला राइड 3 मिनट में आ रही है। ड्राइवर: सुरेश, गाड़ी नंबर DL 3C 4521।",
 "कल सुबह 10 से दोपहर 2 बजे तक रखरखाव के लिए पानी की आपूर्ति बंद रहेगी।",
 "आपका परीक्षा प्रवेश पत्र विश्वविद्यालय की वेबसाइट पर डाउनलोड के लिए उपलब्ध है।",
 "याद दिलाना: इस शनिवार 11 बजे अभिभावक शिक्षक बैठक है।",
 "आपके पेटीएम वॉलेट में {namehi} ने Rs {amt} भेजे हैं।",
 "आपका एयरटेल पोस्टपेड बिल अक्टूबर का Rs {amt} है। अंतिम तिथि 15 नवंबर।",
 "रात 8 बजे डिनर? मैं हमेशा वाली जगह पर टेबल बुक कर लेता हूं।",
]

rows = []
for lang, scam, legit in [("en", EN_SCAM, EN_LEGIT), ("hg", HG_SCAM, HG_LEGIT), ("hi", HI_SCAM, HI_LEGIT)]:
    for label, tpls, tag in [(1, scam, "s"), (0, legit, "l")]:
        for ti, tpl in enumerate(tpls):
            for slots in slot_sets():
                rows.append(dict(message=tpl.format(**slots), label=label,
                                 source="synthetic_seed", group=f"seed_{lang}_{tag}_{ti:02d}"))
seed = pd.DataFrame(rows).drop_duplicates("message")
seed.to_csv("data/seed_indian.csv", index=False)
print("seed rows:", len(seed), seed.label.value_counts().to_dict())

# ---------------------------------------------------------------- unseen hand-written test set
U = {
 "english": ([
  "Your bank account will be blocked. Share OTP immediately.",
  "Sir your ATM card is expired, to get new card please confirm your card number and PIN on this call 9876501234",
  "You have received a gift voucher worth Rs 5000 from Amazon. Claim here: amzn-gift.top/c1",
  "Hello, I'm from Microsoft support. Your laptop has virus, give us remote access and pay Rs 3000 to fix.",
  "Dear customer your FASTag is suspended. Recharge via http://fastag-help.in/pay now or vehicle will be penalized",
  "Make Rs 40,000 weekly from home, no experience needed. Pay Rs 1,000 refundable deposit and message us on Telegram.",
  "Last chance! Your HDFC reward points worth Rs 9,980 expire today. Redeem now: hdfc-points.co/redeem",
  "Hi dear, I am stuck at the airport and my card is not working. Please transfer Rs 15000 to this UPI id, will pay back.",
  "Your WhatsApp will be deactivated in 1 hour. Forward the 6-digit code you just received to verify.",
  "Police case registered against your Aadhaar number. Pay fine of Rs 20,000 online to avoid arrest. Call 9123400000.",
  "Congratulations you are shortlisted for a Rs 25 lakh lottery by Reliance. Send processing charge to claim.",
  "Dear user your Paytm KYC is pending. Account will be frozen. Click kyc-paytm.live/now"],
  ["Hey, are you coming to the party on Saturday? Let me know by tonight.",
  "Your OTP for Swiggy login is 482913. Do not share this code with anyone.",
  "Rs 1,250 spent on your HDFC card ending 4521 at Big Bazaar on 02-Nov. Not you? Call the number on the back of your card.",
  "Your flight 6E-204 to Delhi departs at 7:45 am tomorrow. Web check-in is now open.",
  "Your Zomato order is on its way and will arrive in 20 minutes.",
  "Dear parents, school will remain closed on Monday due to Diwali holidays.",
  "Can you please review the pull request before lunch?",
  "Thank you for visiting Apollo Pharmacy. Your bill of Rs 340 has been paid.",
  "Your LIC premium of Rs 5,000 is due on 15 Nov. Pay through the official website or app.",
  "I'll call you after the meeting ends, around 3.",
  "Your library book is due for return on Thursday.",
  "Electricity bill for October is generated. Amount due Rs 1,430. Last date 12-Nov."]),
 "hinglish": ([
  "Sir aapka ATM card block ho gaya hai, unblock karne ke liye card number aur PIN abhi is number par batayein 9876501234",
  "Aapko Amazon se Rs 5000 ka gift voucher mila hai. Yahan claim karo: amzn-gift.top/c1",
  "Mai Microsoft support se bol raha hu, aapke laptop mein virus hai. Remote access do aur Rs 3000 pay karo.",
  "Aapka FASTag band ho gaya hai. Abhi http://fastag-help.in/pay se recharge karein warna jurmana lagega",
  "Bina experience ke ghar se hafte ke Rs 40,000 kamao. Rs 1,000 deposit bhejo aur Telegram par msg karo.",
  "Aakhri mauka! HDFC reward points Rs 9,980 aaj expire ho rahe hain. Abhi redeem karo hdfc-points.co/redeem",
  "Dost mai airport pe phasa hu, card chal nahi raha. Is UPI id par Rs 15000 bhej do, wapas kar dunga.",
  "Aapka WhatsApp 1 ghante mein band ho jayega. Abhi aaye 6 digit code ko hume forward karo.",
  "Aapke Aadhaar par police case darj hua hai. Giraftari se bachne ke liye Rs 20,000 fine online bharo. Call 9123400000",
  "Mubarak ho! Reliance ki taraf se 25 lakh ki lottery mein aapka naam aaya hai. Claim karne ke liye processing charge bhejo.",
  "Paytm KYC pending hai bhai, account freeze ho jayega. Click karo kyc-paytm.live/now",
  "Aapki SBI YONO app block ho gayi hai, reactivate karne ke liye apna net banking password aur OTP bhejiye."],
  ["Bhai Saturday ko party me aa raha hai na? Aaj raat tak bata dena.",
  "Aapka Swiggy login OTP 482913 hai. Ise kisi ke saath share mat karna.",
  "Aapke HDFC card ending 4521 se Big Bazaar mein Rs 1,250 kharch hue 02-Nov ko. Aapne nahi kiya? Card ke peeche diye number par call karein.",
  "Aapki flight 6E-204 kal subah 7:45 baje Delhi ke liye nikalegi. Web check-in shuru ho gaya hai.",
  "Aapka Zomato order raste mein hai, 20 minute mein pahunch jayega.",
  "Dear parents, Diwali ki chhutti ki wajah se Monday ko school band rahega.",
  "Lunch se pehle ek baar pull request dekh lena please.",
  "Apollo Pharmacy aane ka shukriya. Aapka Rs 340 ka bill pay ho gaya hai.",
  "Aapka LIC premium Rs 5,000 15 Nov ko due hai. Official website ya app se pay karein.",
  "Meeting khatam hone ke baad call karta hoon, 3 baje ke aas paas.",
  "Library ki kitab Thursday tak wapas karni hai.",
  "Oct ka bijli bill ban gaya hai. Rs 1,430 baaki hain, last date 12-Nov."]),
 "hindi": ([
  "आपका बैंक खाता ब्लॉक हो जाएगा। तुरंत OTP शेयर करें।",
  "सर आपका एटीएम कार्ड एक्सपायर हो गया है, नया कार्ड पाने के लिए कार्ड नंबर और पिन इस नंबर पर बताएं 9876501234",
  "आपको अमेज़न की तरफ से 5000 रुपये का गिफ्ट वाउचर मिला है। यहां क्लेम करें amzn-gift.top/c1",
  "मैं माइक्रोसॉफ्ट सपोर्ट से बोल रहा हूं, आपके लैपटॉप में वायरस है। रिमोट एक्सेस दें और 3000 रुपये दें।",
  "आपका फास्टैग बंद हो गया है। अभी http://fastag-help.in/pay पर रिचार्ज करें वरना जुर्माना लगेगा।",
  "बिना अनुभव के घर बैठे हफ्ते के 40,000 रुपये कमाएं। 1,000 रुपये जमा करें और टेलीग्राम पर मैसेज करें।",
  "आखिरी मौका! आपके एचडीएफसी रिवॉर्ड पॉइंट्स 9,980 रुपये के आज खत्म हो रहे हैं। अभी रिडीम करें hdfc-points.co/redeem",
  "दोस्त मैं एयरपोर्ट पर फंस गया हूं, कार्ड काम नहीं कर रहा। इस यूपीआई आईडी पर 15000 रुपये भेज दो, लौटा दूंगा।",
  "आपका व्हाट्सएप 1 घंटे में बंद हो जाएगा। अभी आए 6 अंकों के कोड को हमें फॉरवर्ड करें।",
  "आपके आधार पर पुलिस केस दर्ज हुआ है। गिरफ्तारी से बचने के लिए 20,000 रुपये जुर्माना ऑनलाइन भरें। कॉल करें 9123400000",
  "बधाई हो! रिलायंस की ओर से 25 लाख की लॉटरी में आपका नाम आया है। इनाम पाने के लिए प्रोसेसिंग शुल्क भेजें।",
  "आपका पेटीएम केवाईसी बाकी है, खाता फ्रीज हो जाएगा। अभी क्लिक करें kyc-paytm.live/now"],
  ["भाई शनिवार को पार्टी में आ रहे हो न? आज रात तक बता देना।",
  "आपका स्विगी लॉगिन OTP 482913 है। इसे किसी के साथ साझा न करें।",
  "आपके एचडीएफसी कार्ड (4521) से 02 नवंबर को बिग बाजार में 1,250 रुपये खर्च हुए। आपने नहीं किया? कार्ड के पीछे दिए नंबर पर कॉल करें।",
  "आपकी फ्लाइट 6E-204 कल सुबह 7:45 बजे दिल्ली के लिए रवाना होगी। वेब चेक-इन शुरू हो गया है।",
  "आपका ज़ोमैटो ऑर्डर रास्ते में है, 20 मिनट में पहुंच जाएगा।",
  "प्रिय अभिभावक, दिवाली की छुट्टी के कारण सोमवार को स्कूल बंद रहेगा।",
  "लंच से पहले एक बार पुल रिक्वेस्ट देख लेना प्लीज़।",
  "अपोलो फार्मेसी आने के लिए धन्यवाद। आपका 340 रुपये का बिल चुका दिया गया है।",
  "आपका एलआईसी प्रीमियम 5,000 रुपये 15 नवंबर को देय है। आधिकारिक वेबसाइट या ऐप से भुगतान करें।",
  "मीटिंग खत्म होने के बाद फोन करता हूं, 3 बजे के आसपास।",
  "लाइब्रेरी की किताब गुरुवार तक वापस करनी है।",
  "अक्टूबर का बिजली बिल बन गया है। 1,430 रुपये बकाया हैं, अंतिम तिथि 12 नवंबर।"]),
}
u = []
for lang, (sc, lg) in U.items():
    u += [dict(message=m, label=1, language=lang) for m in sc]
    u += [dict(message=m, label=0, language=lang) for m in lg]
pd.DataFrame(u).to_csv("data/unseen_test.csv", index=False)
print("unseen rows:", len(u))
