require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});
const Url = mongoose.model('Url', urlSchema);
app.post('/api/shorturl', async(req, res) => {
  const url = req.body.url;
  if (!url) {
    return res.status(400).json({ error: 'URL is required'});
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')){
    return res.status(400).json({ error: 'Invalid URL format'});
  }
  const shortUrl = Math.floor(Math.random() * 1000000);
  const newUrl = new Url({
    original_url: url,
    short_url: shortUrl
  });
  await newUrl.save();
  res.json({ originalUrl: url, shortUrl: shortUrl});
});
app.get('/api/shorturl/:short_url', async (req, res) => {
  const shortUrl = req.params.short_url;
  const urlDoc = await Url.findOne({ short_url: shortUrl});
  if (urlDoc) {
    return res.redirect(urlDoc.original_url);
  }
  else {
    return res.status(404).json({ error: 'No short URL found for given input'});
  }
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
