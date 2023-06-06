const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express()
const scrapingbee = require('scrapingbee'); // Import ScrapingBee's SDK
const fs = require('fs');
const path = require('path');
// const {getProductFromPOS} = require('./class/getProduct');
const {getProductFromPOS} = require('./class/PosProduct');
const {get_list_from_shopify, update_Products_To_Shopify} = require('./class/setProductToShopify');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
 
app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})
 
app.post('/', async function (req, res) {

  const shop_products = await get_list_from_shopify();

  let pos_products = [];
  for (let i = 0; i< 1; i++) {
    // const products = await getProductFromPOS(i)
    const products = await getProductFromPOS(i)
    console.log("repeat>>>>", i);
    // const products = [];
    pos_products.push(products);
    pos_products = [...pos_products, ...products]
    console.log("products>>>>", products);
  }

  // console.log("shopify products>>>", shop_products);
  // console.log('pos products>>>', pos_products);
  
  const jsonData = JSON.stringify(pos_products, null, 2);
  fs.writeFileSync('products.json', jsonData);

  update_Products_To_Shopify(shop_products, jsonData);

})
 
app.listen(3000, function () {
  console.log('Weatherly app listening on port 3000!')
})