require('dotenv').config({ path: "./sample.env" });
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use('/public', express.static(`${process.cwd()}/public`));

let urlDatabase = [];
let counter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req, res) => {
  const { url: original_url } = req.body;
  const regex = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

  if (!regex.test(original_url)) {
    return res.json({ error: "invalid url" });
  }

  const host = new URL(original_url).hostname;
  dns.lookup(host, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const newUrl = {
      original_url,
      short_url: counter++
    };

    urlDatabase.push(newUrl);

    res.json({
      original_url,
      short_url: newUrl.short_url
    });
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const { short_url } = req.params;

  const url = urlDatabase.find(entry => entry.short_url === parseInt(short_url));

  if (url) {
    res.redirect(url.original_url);
  } else {
    res.json({ error: "short url not found" });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
