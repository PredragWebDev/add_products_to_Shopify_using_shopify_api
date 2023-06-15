const {workerData, parentPort } = require('worker_threads');
const {getProductFromPOS} = require('./PosProduct');
const {update_Products_To_Shopify} = require('./setProductToShopify');
const fs = require("fs");

const process = async (shop_products, from, to, onetime) => {
    let result = [];

    // const products = await getProductFromPOS(4, 15);
    // result = [...result, ...products];
    for (let i =from; i< to; i++) {
      const products = await getProductFromPOS(i, onetime);
      console.log("repeat>>>>", i);
  
    //   update_Products_To_Shopify(shop_products, JSON.stringify(products));
  
        result = [...result, ...products];
    }

    const jsonResult = JSON.stringify(result, null, 2);

    return(jsonResult);
  }

  process(workerData.shop_products, workerData.from, workerData.to, workerData.onetime)
  .then((result) => {
    parentPort.postMessage(result);
    parentPort.close();
  })
  .catch ((error) =>{
    parentPort.postMessage(error);
  });


