import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// ✅ FIXED SCOPE HERE
const SCOPES = [
  "crm.objects.contacts.read",
  "crm.objects.contacts.write"
].join(" ");

app.get("/oauth/install", (req, res) => {
  const url =
    `https://app.hubspot.com/oauth/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  res.redirect(url);
});

app.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;

  try {
    await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code,
        },
      }
    );

    // 👉 redirect to your real dashboard
    res.redirect("https://app.snapvalid.com/user/dashboard");

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.send("OAuth failed");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));