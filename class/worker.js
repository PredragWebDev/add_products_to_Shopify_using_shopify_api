const {workerData, parentPort } = require('worker_threads');
const {getProductFromPOS} = require('./PosProduct');
const {update_Products_To_Shopify} = require('./setProductToShopify');

const process = async (shop_products, from, to, onetime) => {
    for (let i =from; i< to; i++) {
      const products = await getProductFromPOS(i, onetime);
      console.log("repeat>>>>", i);
  
      update_Products_To_Shopify(shop_products, JSON.stringify(products));
  
      const jsonData = JSON.stringify(products, null, 2);
      fs.appendFileSync('../product.json', jsonData);
  
      // pos_products = [...pos_products, ...products]
      // console.log("products>>>>", products);
    }
  }

  process(workerData.shop_products, workerData.from, workerData.to, workerData.onetime)
  .then((result) => {
    parentPort.postMessage(result);
    parentPort.close();
  })
  .catch ((error) =>{
    parentPort.postMessage(error);
  });


