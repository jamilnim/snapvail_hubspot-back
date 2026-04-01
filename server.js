import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ENV
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// SCOPES
const SCOPES = [
  "crm.objects.contacts.read",
  "crm.objects.contacts.write"
].join(" ");

// ==============================
// 👉 INSTALL ROUTE
// ==============================
app.get("/oauth/install", (req, res) => {
  const authUrl =
    "https://app.hubspot.com/oauth/authorize" +
    `?client_id=${CLIENT_ID}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  console.log("AUTH URL:", authUrl);

  res.redirect(authUrl);
});

// ==============================
// 👉 CALLBACK ROUTE
// ==============================
app.get("/oauth/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.send("❌ No authorization code received");
  }

  try {
    // 🔥 EXCHANGE CODE FOR TOKEN
    const tokenRes = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code: code,
        },
      }
    );

    const data = tokenRes.data;

    console.log("✅ TOKEN SUCCESS");

    // 🔥 GET PORTAL ID (IMPORTANT)
    const portalId = data.hub_id;

    // 👉 (Optional) You can store tokens here in DB
    // access_token = data.access_token
    // refresh_token = data.refresh_token

    // ==============================
    // 👉 FINAL REDIRECT (IMPORTANT)
    // ==============================
    res.redirect(
      `https://app.snapvalid.com/user/dashboard?portal_id=${portalId}`
    );

  } catch (error) {
    console.error("❌ TOKEN ERROR:", error.response?.data || error.message);
    res.send("OAuth failed");
  }
});

// ==============================
// 👉 SERVER START
// ==============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});