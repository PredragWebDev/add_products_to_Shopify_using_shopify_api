const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const fs = require('fs');
const {getProductFromPOS, get_number_of_pages} = require('./class/PosProduct');
const {get_list_from_shopify, update_Products_To_Shopify} = require('./class/setProductToShopify');
const { Worker } = require('worker_threads');
// const workerPath = require('./class/worker');
const Shopify = require('shopify-api-node');
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

  const onetime = 2;

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
  console.log('Weatherly app listening on port 3000!')
  const shop_products = await get_list_from_shopify();

  // const number_of_pages = await get_number_of_pages();
  const number_of_pages = 150;

  console.log('number of pages>>>', number_of_pages);

  const onetime = 2;


  let i = 0;
  const promises = [];
  for ( i = 0 ; i< Math.ceil(number_of_pages/onetime); i+=10) {
    process(Shopify, i, i+10, onetime);
    // promises.push(runWorker(shop_products, i, i+10, onetime));
  }

  if (Math.ceil(number_of_pages/onetime) - i < 10 && Math.ceil(number_of_pages/onetime) - i !== 0){
    await process(Shopify, i, i+10, onetime);
    // promises.push(runWorker(shop_products, i, Math.ceil(number_of_pages/onetime), onetime));
  }

  // try {
  //   await Promise.all(promises);
  //   console.log('All workers finished');
  // } catch (err) {
  //   console.error('A worker encountered an error: ', err);
  // }
})

const runWorker = (shop_products, from, to, onetime) => {
  return new Promise((resolve, reject) => {
    console.log("shop products>>>", shop_products);

    const worker = new Worker(workerPath, { 
      workerData: { 
        shop_products, 
        from, 
        to, 
        onetime 
      } 
    });
    
    worker.on('message', (msg) => {
      if (msg.error) {
        reject(msg.error);
      } else {
        resolve();
      }
    });
    
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}