const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/bmw", async (req, res) => {
  const { vin, pieza } = req.body;

  if (!vin || !pieza) {
    return res.status(400).json({ error: "VIN y pieza son requeridos" });
  }

  const vin7 = vin.slice(-7);
  const searchUrl = `https://www.realoem.com/bmw/enUS/partxref?q=${encodeURIComponent(pieza)}&series=${vin7}`;

  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    const partNumber = await page.evaluate(() => {
      const el = document.querySelector('.partxref__number');
      return el ? el.textContent.trim() : null;
    });

    await browser.close();

    if (partNumber) {
      res.json({ part_number: partNumber });
    } else {
      res.json({ part_number: "NO RESULT" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Agent Q Real BMW listening on port " + PORT);
});