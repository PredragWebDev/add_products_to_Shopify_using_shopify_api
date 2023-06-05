const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express()
const scrapingbee = require('scrapingbee'); // Import ScrapingBee's SDK
const fs = require('fs');
const path = require('path');
const {getProductFromPOS} = require('./class/getProduct');
const {get_list_from_shopify} = require('./class/setProductToShopify');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
 
app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})
 
app.post('/', async function (req, res) {

  get_list_from_shopify();

  let postproducts = [];
  for (let i = 0; i< 1; i++) {
    const products = await getProductFromPOS(i)
    // const products = [];
    postproducts.push(products);
    console.log("products>>>>", products);
  }

  
  const jsonData = JSON.stringify(postproducts, null, 2);
  fs.writeFileSync('products.json', jsonData);
  const url = "https://lightningpos.com/POSLogin.aspx?flag=1&enabletouch=%27true%27%3fHg%3d1080&Wg=1920"

})
 
app.listen(3000, function () {
  console.log('Weatherly app listening on port 3000!')
})