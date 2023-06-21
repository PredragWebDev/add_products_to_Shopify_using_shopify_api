const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const fs = require('fs');
const {get_sku_of_products} = require('./class/PosProduct');
const {get_list_from_shopify} = require('./class/setProductToShopify');
const {Worker} = require('worker_threads');
const { start } = require('repl');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
 
app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})
 
app.post('/', async function (req, res) {

})

app.listen(3000, async function () {
  console.log('app listening on port 3000!')
  const shop_products = await get_list_from_shopify();

  const sku_of_products = await get_sku_of_products();

  console.log('sku of products >>>>>', sku_of_products);
  
  let i = 0;

  let j = 0;
  let timeout = 600000;
  let end = 10;
  let starter = 0;
  let number_of_browsers = 5;
  let from = 0;
  let to = 0;
  let count_of_products = sku_of_products.length;
  const step = Math.floor(count_of_products/number_of_browsers/2);
  const onetime = 30;

  console.log('count of products>>>>', count_of_products);

  do {
    for (let j = 0; j < number_of_browsers; j++) {
      from = starter + j * onetime;
      to = starter + (j + 1) * onetime;
  
      const workerData = {shop_products, sku_of_products, from, to};
  
      const worker = new Worker('./class/worker.js', {workerData});
      worker.postMessage(workerData);
      worker.on('exit', (code) => {
        console.log('Worker stopped with exit code', code);
      });
    
      worker.on('error', (err) =>{
        console.log(err)
      });
    
      worker.on('message', (result) => {
        try {
          if (result.length > 0)
            fs.appendFileSync('product.json', result);
        }
        catch (err) {
          console.log('Server Error!!!', err);
        }
        
      });
    }
  
    await new Promise(resolve => setTimeout(resolve, 480000));
    starter = starter + onetime * number_of_browsers;
    console.log('starter>>>', starter);
  } while (starter < count_of_products - onetime * number_of_browsers)
  
  number_of_browsers = Math.ceil((count_of_products -  starter)/onetime);

  for (let j = 0; j < number_of_browsers; j ++) {

    if (j === number_of_browsers -1) {
      from = starter + j * onetime;
      to = count_of_products;
    }
    else {
      from = starter + j * onetime;
      to = starter + (j + 1) * onetime;
    }
    
    const workerData = {shop_products, sku_of_products, from, to};
  
    const worker = new Worker('./class/worker.js', {workerData});
    worker.postMessage(workerData);
    worker.on('exit', (code) => {
      console.log('Worker stopped with exit code', code);
    });
  
    worker.on('error', (err) =>{
      console.log(err)
    });
  
    worker.on('message', (result) => {
      try {
        if (result.length > 0) {
          fs.appendFileSync('product.json', result);
        }
      }
      catch (err) {
        console.log('Server Error!!!', err);
      }
      
    });
  }
  await new Promise(resolve => setTimeout(resolve, 240000));

  console.log('the end')

})
