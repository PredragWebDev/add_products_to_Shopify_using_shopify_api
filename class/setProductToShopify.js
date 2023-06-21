const Shopify = require('shopify-api-node');
const fs = require('fs');
const axios = require('axios');
const XLSX = require('xlsx');
const { response } = require('express');

// var os = require('os');
// if (os.platform() == 'win32') {  
//     if (os.arch() == 'ia32') {
//         var chilkat = require('@chilkat/ck-node11-win-ia32');
//     } else {
//         var chilkat = require('@chilkat/ck-node11-win64'); 
//     }
// } else if (os.platform() == 'linux') {
//     if (os.arch() == 'arm') {
//         var chilkat = require('@chilkat/ck-node11-arm');
//     } else if (os.arch() == 'x86') {
//         var chilkat = require('@chilkat/ck-node11-linux32');
//     } else {
//         var chilkat = require('@chilkat/ck-node11-linux64');
//     }
// } else if (os.platform() == 'darwin') {
//     var chilkat = require('@chilkat/ck-node11-macosx');
// }



const read_Excel_file = async () => {
  const workbook = XLSX.readFile('./cityhive.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  return jsonData;
}

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

  let count_of_updated = 0;

  const POS_products = JSON.parse(pos_products);
  const shopifyProducts = JSON.parse(shop_products);

  console.log('shopify products>>>', POS_products);
  console.log('shopify products length>>>', pos_products.length);

  const shopify = new Shopify({
    shopName: 'c220a3-2.myshopify.com',
    accessToken: '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',
    autoLimit : { calls: 2, interval: 1000, bucketSize: 30 }
  });

  let location = await shopify.location.list();

  console.log('location ids>>>>', location);

  for (const pos_product of POS_products) {
    let barcode = '';
    let is_new = true;
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

        let updated_variants = []
        for (const shopifyProduct of shopifyProducts) {
          // shopifyProduct.variants?.map(async (variant) => {
          for (variant of shopifyProduct.variants) {
            let updated_variant = variant;

            if (variant.barcode === barcode) {
              console.log('barcode equal');
              is_new = false;
   
              // if (variant.price !== pos_product.price) {
              //   updated_variant.price = pos_product.price;
              //   update = true;
              // }
              
              if (variant.inventory_quantity !== Number(pos_product.qty)) {
                
                console.log('qty not equal');
                update = true;
                
                const inventory_item_id = variant.inventory_item_id;
                console.log('pos qty>>>', pos_product.qty);
                console.log('shopify qty>>>', variant.inventory_quantity);
                const qty = Number(pos_product.qty) - variant.inventory_quantity;
                console.log('variant qty>>>>', qty);
                
                const reaponse = await shopify.inventoryLevel.adjust({
                  inventory_item_id: inventory_item_id,
                  location_id: 82881544473,
                  available_adjustment: qty
                })
                updated_variant.inventory_quantity = pos_product.qty;
                
                console.log('response>>>>>>>>>>', reaponse);
                
                updated_variants.push(updated_variant);
                count_of_updated ++;
              }

              console.log('qty equal');
            }
          }
          // });

          // if (update) {
          //   update = false;

          // }
          
        }

        // if (is_new === true) {
        //   const new_products = {
        //     id:pos_product.sku,
        //     title:pos_product.title,
        //     vendor:pos_product.vendor,
        //     product_type:pos_product.type,
        //     status:'draft',
        //     variants: [
        //       {
        //         title:pos_product.size,
        //         price:pos_product.price,
        //         inventory_policy: 'deny',
        //         compare_at_price: pos_product.cost,
        //         fulfillment_service: 'manual',
        //         inventory_management: 'shopify',
        //         barcode: barcode,
        //         inventory_quantity: pos_product.qty
        //       }
        //     ]
        //   }

        //   const product = await shopify.product.create(new_products);

        //   console.log('created the product>>', product);
        // }
        const jsonData = JSON.stringify(updated_variants, null, 2);

        fs.appendFileSync('updated products.json', jsonData);
      }
    }
  }

  console.log('updated', count_of_updated);
  
}

module.exports = {
  get_list_from_shopify,
  update_Products_To_Shopify,
  read_Excel_file
};