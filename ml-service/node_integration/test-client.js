// node node_integration/test-client.js  (ML service must be running on :8000)
const { checkMessage } = require("./baitbreakClient");
(async () => {
  const samples = [
    "Your bank account will be blocked. Share OTP immediately.",
    "आपका खाता बंद हो जाएगा। अभी KYC अपडेट करें और OTP शेयर करें।",
    "Aapka account block ho jayega, turant OTP bhejein",
    "Bhai kal shaam 6 baje milte hain, late mat hona",
  ];
  for (const s of samples) console.log(JSON.stringify(await checkMessage(s)), "|", s);
})();
