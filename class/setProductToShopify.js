const Shopify = require('shopify-api-node');
const fs = require('fs');
const axios = require('axios');

let count_of_updated = 0;

const get_list_from_shopify = async () => {
  const shopify = new Shopify({
    shopName: 'c220a3-2.myshopify.com',
    accessToken: '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',
    autoLimit : { calls: 2, interval: 1000, bucketSize: 30 }
  });

  try {
 
    let params = { limit: 250, fields:'id, variants' };
    let shopifyProducts = [];
  do {
    const products = await shopify.product.list(params);

    console.log(products);

    shopifyProducts = [...shopifyProducts, ...products]
    params = products.nextPageParameters;
  } while (params !== undefined);

    const jsonData = JSON.stringify(shopifyProducts, null, 2);
    fs.writeFileSync('shopify products.json', jsonData);

    console.log("getting end");
    return jsonData;
    
  } catch (err) {
    console.error('Failed to update products:', err);
  }
};

const update_Products_To_Shopify = async (shop_products, pos_products) => {

  const POS_products = JSON.parse(pos_products);
  const shopifyProducts = JSON.parse(shop_products);

  

  console.log('shopify products>>>', POS_products);
  console.log('shopify products length>>>', pos_products.length);

  const shopify = new Shopify({
    shopName: 'c220a3-2.myshopify.com',
    accessToken: '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',
    autoLimit : { calls: 2, interval: 1000, bucketSize: 30 }
  });

  for (const pos_product of POS_products) {
    let barcode = '';
    for (let i = 0; i < 3; i++) {
      switch (i) {
        case 0:
          barcode = pos_product.barcode1;
          console.log('barcode1>>>', barcode);
          break;
        case 1:
          barcode = pos_product.barcode2;
          console.log('barcode2>>>', barcode);
          break;
        case 2:
          barcode = pos_product.barcode3;
          console.log('barcode3>>>', barcode);
          break;
        default:
          barcode = pos_product.barcode1;
          break;
      }

      if (barcode !== '') {
        let update = false;

        for (const shopifyProduct of shopifyProducts) {
          let updated_variants = {
            variants:[]
          };
          shopifyProduct.variants?.map(async (variant) => {
            let updated_variant = variant;

            if (variant.barcode === barcode) {
              console.log('barcode equal');
   
              if (variant.price !== pos_product.price) {
                updated_variant.price = pos_product.price;
                update = true;
              }
              if (variant.inventory_quantity !== pos_product.qty) {
                updated_variant.inventory_quantity = pos_product.qty;
                update = true;
              }
              
              console.log("price>>>", variant.price);
              console.log("qty>>>>", variant.inventory_quantity);
            }
            updated_variants.variants.push(updated_variant);
          });

          if (update) {
            count_of_updated ++;
            const temp = await shopify.product.update(shopifyProduct.id, updated_variants);
            console.log(`updated the ${count_of_updated} products`);
            update = false;
          }

        }
      }
    }
  }
  console.log(`updated the ${count_of_updated} products`);
  console.log('update end!');
  
}

module.exports = {
  get_list_from_shopify,
  update_Products_To_Shopify
};
