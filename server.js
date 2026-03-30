import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================
// INSTALL URL
// ==========================
app.get("/oauth/install", (req, res) => {
  const installUrl =
    "https://app.hubspot.com/oauth/authorize" +
    `?client_id=${process.env.CLIENT_ID}` +
    `&scope=crm.objects.contacts.read%20crm.objects.contacts.write` +
    `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`;

  res.redirect(installUrl);
});

// ==========================
// CALLBACK
// ==========================
app.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("No code received");
  }

  try {
    const response = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code: code,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const portalId = response.data.hub_id;

    console.log("CONNECTED PORTAL:", portalId);

    // ✅ FINAL REDIRECT
    res.redirect(
      `https://app.snapvalid.com/user/dashboard?portal_id=${portalId}`
    );

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.send("OAuth failed");
  }
});

// ==========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});