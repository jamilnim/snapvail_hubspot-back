import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ENV VARIABLES
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// ✅ REQUIRED SCOPES (MATCH HUBSPOT)
const SCOPES = [
  "crm.objects.contacts.read",
  "crm.objects.contacts.write"
].join(" ");

// 👉 INSTALL URL
app.get("/oauth/install", (req, res) => {
  const authUrl =
    "https://app.hubspot.com/oauth/authorize" +
    `?client_id=${CLIENT_ID}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  console.log("AUTH URL:", authUrl);

  res.redirect(authUrl);
});

// 👉 CALLBACK
app.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("No code received");
  }

  try {
    const response = await axios.post(
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

    console.log("TOKEN SUCCESS");

    // ✅ REDIRECT TO YOUR REAL DASHBOARD
    res.redirect("https://app.snapvalid.com/user/dashboard");

  } catch (error) {
    console.error("TOKEN ERROR:", error.response?.data || error.message);
    res.send("OAuth failed");
  }
});

// ✅ FIX FOR RENDER (CRITICAL)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});