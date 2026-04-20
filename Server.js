import express from "express";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

const app = express();
app.use(express.json());

let sock;

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false // ❌ QR OFF
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (u) => {
    if (u.connection === "open") {
      console.log("✅ ACTIVE-MD Connected");
    }
  });
}

start();

app.post("/pair", async (req, res) => {
  const { number } = req.body;

  if (!number) return res.json({ error: "Enter number" });

  try {
    const code = await sock.requestPairingCode(number);
    
    res.json({
      status: "success",
      pairingCode: code
    });

  } catch (err) {
    res.json({
      status: "error",
      message: "Pairing failed"
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 ACTIVE-MD Pairing API running");
});
