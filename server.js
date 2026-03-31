import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server running");
});


// 👉 STEP 1: INSTALL (already working)
app.get("/oauth/install", (req, res) => {
  const url = `https://app.hubspot.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=crm.objects.contacts.read&redirect_uri=${process.env.REDIRECT_URI}`;

  res.redirect(url);
});


// 👉 STEP 2: CALLBACK (THIS WAS MISSING ❗)
app.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("No code received");
  }

  try {
    // Exchange code for access token
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

    console.log("Access Token:", response.data);

    // 👉 FINAL REDIRECT (YOUR GOAL)
    return res.redirect("https://app.snapvalid.com/user/dashboard");

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.send("OAuth failed");
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});