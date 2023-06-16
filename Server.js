const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const fs = require('fs');
const {getProductFromPOS, get_number_of_pages} = require('./class/PosProduct');
const {get_list_from_shopify, update_Products_To_Shopify} = require('./class/setProductToShopify');
const {Worker} = require('worker_threads');
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

  // const number_of_pages = await get_number_of_pages();
  const number_of_pages = 108;

  console.log('number of pages>>>', number_of_pages);

  let onetime = 3;
  let step = 3;
  let number_of_browsers = 5;
  // await mainprocess(shop_products, number_of_pages, onetime);
  
  let i = 0;

  let j = 0;

  let end = Math.ceil((number_of_pages/number_of_browsers*step/2));
  let page_starter = 0;
  
  for ( j = 0; j < end; j++) {
    if (j !== 0) {
      page_starter += step * number_of_browsers;
    }

    for ( i = 0 ; i< number_of_browsers; i ++) {
      const workerData = {shop_products, page_starter, step, onetime, index_of_browser:i};

      const worker = new Worker('./class/worker.js', {workerData});
      worker.postMessage(workerData);
      worker.on('exit', (code) => {
        console.log('Worker stopped with exit code', code);
      });
    
      worker.on('error', (err) =>{
        console.log(err)
      });

      worker.on('message', (result) => {
        fs.appendFileSync('product.json', result);
        console.log('received message from worker', result);
      });
      // process(shop_products, i, i+5, onetime);
    }
    // console.log('will try after 7mins');
    await new Promise(resolve => setTimeout(resolve, 420000));
  }

  console.log('completed half!!!!');
  page_starter += step * number_of_browsers;

  end = Math.ceil((number_of_pages - end * number_of_browsers * step/2));
  number_of_browsers = 2;

  for ( j = 0; j < end; j++) {
    if (j !== 0) {
      page_starter += step * number_of_browsers;
    }

    for ( i = 0 ; i< number_of_browsers; i ++) {
      const workerData = {shop_products, page_starter, step, onetime, index_of_browser:i};

      const worker = new Worker('./class/worker.js', {workerData});
      worker.postMessage(workerData);
      worker.on('exit', (code) => {
        console.log('Worker stopped with exit code', code);
      });
    
      worker.on('error', (err) =>{
        console.log(err)
      });

      worker.on('message', (result) => {
        fs.appendFileSync('product.json', result);
        console.log('received message from worker', result);
      });
      // process(shop_products, i, i+5, onetime);
    }
    // console.log('will try after 5mins');
    await new Promise(resolve => setTimeout(resolve, 420000));
  }

  

  // last = number_of_pages - (Math.floor(number_of_pages/(onetime * number_of_browsers))*(onetime * number_of_browsers));

  // console.log('last>>>', last);

  // console.log('test>>>>', Math.floor(number_of_pages/(number_of_browsers*onetime))*number_of_browsers*onetime);


  // if (onetime > 0) {
  //   if (last % number_of_browsers > 1) {
  //     number_of_browsers -= 1;
  //   }
  //   else {
  //     number_of_browsers = 1;
  //   }
  // }
  // if (Math.ceil(number_of_pages/onetime)-i+5 < 5 && Math.ceil(number_of_pages/onetime) - i !== 0){
    // const workerData = {shop_products, from:i-2, to:Math.ceil(number_of_pages/onetime), onetime};
    // // const workerData = {shop_products, from:i, to:1, onetime};
    // const worker = new Worker('./class/worker.js', {workerData});
    // worker.postMessage(workerData);
    // worker.on('exit', (code) => {
    //   console.log('Worker stopped with exit code', code);
    // });
  
    // worker.on('error', (err) =>{
    //   console.log(err)
    // });

    // worker.on('message', (result) => {
    //   fs.appendFileSync('product.json', result);
    //   console.log('received message from worker', result);
    // });
    // await process(shop_products, i, Math.ceil(number_of_pages/onetime), onetime);
  // }
  

})

const mainprocess = async (shop_products, number_of_pages, onetime) => {
  let i = 0;
  const workerData = {message:"hello world!"};

  for ( i = 0 ; i< Math.ceil(number_of_pages/onetime); i+=5) {
    const worker = new Worker('./class/worker.js', {workerData});
    worker.postMessage(workerData);
    process(shop_products, i, i+5, onetime);
  }

  if (Math.ceil(number_of_pages/onetime) - i < 5 && Math.ceil(number_of_pages/onetime) - i !== 0){
    const worker = new Worker('./class/worker.js', {workerData});
    worker.postMessage(workerData);
    await process(shop_products, i, Math.ceil(number_of_pages/onetime), onetime);
  }
}