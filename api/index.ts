const express = require("express");
const puppeteer = require("puppeteer");
const chromium = require("@sparticuz/chromium");

const app = express();
const port = process.env.PORT || 3000;

app.get("/screenshot", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send("Missing URL");
  }

  console.log("getting screenshots for ", url);

  let browser;
  try {
    if (process.env.VERCEL) {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    const screenshot = await page.screenshot({ fullPage: true });
    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(screenshot);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error capturing screenshot");
  }
});

app.listen(port, (err) => {
  if (err) {
    return console.error("Error starting server:", err);
  }
  console.log(`Screenshot API listening at http://localhost:${port}`);
});

module.exports = app; // Export the app for testing or other purposes
