const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const fs = require('fs');
const {getProductFromPOS, get_sku_of_products} = require('./class/PosProduct');
const {get_list_from_shopify, update_Products_To_Shopify} = require('./class/setProductToShopify');
const {Worker} = require('worker_threads');
const { start } = require('repl');
let pos_products = []
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
 
app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})
 
app.post('/', async function (req, res) {

  const shop_products = await get_list_from_shopify();

  // const number_of_pages = await get_number_of_pages();
  const number_of_pages = 150;

  console.log('number of pages>>>', number_of_pages);

  const onetime = 4;

  let i = 0;
  for ( i = 0 ; i< Math.ceil(number_of_pages/onetime); i+=4) {
    process(shop_products, i, i+4, onetime);
  }

  if (Math.ceil(number_of_pages/onetime) - i < 4 && Math.ceil(number_of_pages/onetime) - i !== 0){
    await process(shop_products, i, Math.ceil(number_of_pages/onetime), onetime);
  }

  const jsonData = JSON.stringify(pos_products, null, 2);
  fs.writeFileSync('products.json', jsonData);

  // update_Products_To_Shopify(shop_products, jsonData);

})

const process = async (shop_products, from, to, onetime) => {
  for (let i =from; i< to; i++) {
    const products = await getProductFromPOS(i, onetime);
    console.log("repeat>>>>", i);

    update_Products_To_Shopify(shop_products, JSON.stringify(products));

    const jsonData = JSON.stringify(products, null, 2);
    fs.appendFileSync('product.json', jsonData);

    // pos_products = [...pos_products, ...products]
    // console.log("products>>>>", products);
  }
}
 
app.listen(3000, async function () {
  console.log('app listening on port 3000!')
  const shop_products = await get_list_from_shopify();
  let count_updated = 0;
  // const shop_products = [];

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
  
      // const workerData = {shop_products, sku_of_products, from, to};
  
      // const worker = new Worker('./class/worker.js', {workerData});
      // worker.postMessage(workerData);
      // worker.on('exit', (code) => {
      //   console.log('Worker stopped with exit code', code);
      // });
    
      // worker.on('error', (err) =>{
      //   console.log(err)
      // });
    
      // worker.on('message', (result) => {
      //   try {
      //     if (result.length > 0)
      //       fs.appendFileSync('product.json', result);
      //   }
      //   catch (err) {
      //     console.log('Server Error!!!', err);
      //   }
        
      // });
    }
  
    // await new Promise(resolve => setTimeout(resolve, 480000));
    starter = starter + onetime * number_of_browsers;
  } while (starter < count_of_products - onetime * number_of_browsers)
  
  console.log('starter>>', starter);
  console.log('count>>>', count_of_products);

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
        console.log('resut>>>>', result.count_updated);
        if (result.length > 0) {
          fs.appendFileSync('product.json', result.jsonResult);
          count_updated += result.count_updated;
        }
      }
      catch (err) {
        console.log('Server Error!!!', err);
      }
      
    });
  }
  await new Promise(resolve => setTimeout(resolve, 240000));

  console.log('updated end', count_updated)

  // do {
    
  //   switch (j) {
  //     case 0:
  //       number_of_browsers = 7;
  //       onetime = 2;
  //       step = 2;
  //       break;
  //     case 3:
  //       number_of_browsers = 6;
  //       onetime = 2;
  //       step = 2;
  //       break;
  //     case 6:
  //       number_of_browsers = 5;
  //       onetime = 2;
  //       step = 2;
  //       break;
  //     case 9:
  //       number_of_browsers = 3;
  //       onetime = 2;
  //       step =2
  //       break;
  //     case 11:
  //       number_of_browsers = 1;
  //       step = 1;
  //       onetime = 1;
  //       break;
  //     case 24:
  //       number_of_browsers = 1;
  //       step = 1;
  //       onetime = 1;
  //   }

  //   // if (j >= 24) {

  //   for ( i = 0 ; i< number_of_browsers; i ++) {
  //     const workerData = {shop_products, page_starter, step, onetime, index_of_browser:i};

  //     const worker = new Worker('./class/worker.js', {workerData});
  //     worker.postMessage(workerData);
  //     worker.on('exit', (code) => {
  //       console.log('Worker stopped with exit code', code);
  //     });
    
  //     worker.on('error', (err) =>{
  //       console.log(err)
  //     });

  //     worker.on('message', (result) => {
  //       try {
  //         if (result.length > 0)
  //           fs.appendFileSync('product.json', result);
  //       }
  //       catch (err) {
  //         console.log('Server Error!!!', err);
  //       }
        
  //     });
  //     // process(shop_products, i, i+5, onetime);
  //   }
  //   // console.log('will try after 7mins');
  //   await new Promise(resolve => setTimeout(resolve, timeout));

  //   if (j >= 11) {
  //     await new Promise(resolve => setTimeout(resolve, 120000));
  //   }
  //   if (j >= 24) {
  //     await new Promise(resolve => setTimeout(resolve, 60000));
  //   }
  //   // }

  //   page_starter += step * number_of_browsers;
  //   j ++;

  //   console.log('page starter>>>>', page_starter);

  // } while (page_starter < number_of_pages)

  console.log('the end')
 

})
