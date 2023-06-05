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
const {setProduct} = require('./class/setProductToShopify');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
 
app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})
 
app.post('/', async function (req, res) {

  for (let i = 0; i< 1; i++) {
    // const products = await getProductFromPOS(i)
    const products = [];

    // console.log("products>>>>", products);
  
    // const jsonData = JSON.stringify(products, null, 2);
    // fs.writeFileSync('products.json', jsonData);
  
    setProduct(products, i)
  }
  
  const url = "https://lightningpos.com/POSLogin.aspx?flag=1&enabletouch=%27true%27%3fHg%3d1080&Wg=1920"

})
 
app.listen(3000, function () {
  console.log('Weatherly app listening on port 3000!')
})