const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express()
const scrapingbee = require('scrapingbee'); // Import ScrapingBee's SDK
const fs = require('fs');
const path = require('path');
const {getProductFromCSV} = require('./class/getProduct');
const {setProduct} = require('./class/setProductToShopify');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
 
app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})
 
app.post('/', function (req, res) {

  const products = getProductFromCSV()

  // console.log("products>>>>", products)

  setProduct(products)

  
  const url = "https://lightningpos.com/POSLogin.aspx?flag=1&enabletouch=%27true%27%3fHg%3d1080&Wg=1920"

})
 
app.listen(3000, function () {
  console.log('Weatherly app listening on port 3000!')
})