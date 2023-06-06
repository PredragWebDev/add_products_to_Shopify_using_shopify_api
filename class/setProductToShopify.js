const Shopify = require('shopify-api-node');
const fs = require('fs');
const axios = require('axios');

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

    shopifyProducts.push(products)
    params = products.nextPageParameters;
  } while (params !== undefined);

     const jsonData = JSON.stringify(shopifyProducts, null, 2);
    fs.writeFileSync('shopify products.json', jsonData);

    console.log("getting end");
    return shopifyProducts;
    
  } catch (err) {
    console.error('Failed to update products:', err);
  }
};

const update_Products_To_Shopify = async (shop_products, pos_products) => {

  const shopify = new Shopify({
    shopName: 'c220a3-2.myshopify.com',
    accessToken: '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',
    autoLimit : { calls: 2, interval: 1000, bucketSize: 30 }
  });

  for (const pos_product of pos_products) {
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

            for (const shopifyProduct of shop_products) {
              shopifyProduct.variants.map(async (variant) => {
                if (variant.barcode === barcode) {
                  if (variant.price !== product.price) {
                    variant.price = product.price;
                    update = true;
                  }
                  if (variant.inventory_quantity !== product.qty) {
                    variant.inventory_quantity = product.qty;
                    update = true;
                  }

                  if (update) {
                    console.log("update???");
                    const temp = await shopify.product.update(shopifyProduct.id, shopifyProduct.variants);
                  }
                  console.log("price>>>", variant.price);
                  console.log("qty>>>>", variant.inventory_quantity);
                }
              });

            }
          }
        }
      }
}

module.exports = {
  get_list_from_shopify,
  update_Products_To_Shopify
};
