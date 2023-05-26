const Shopify = require('shopify-api-node');
const axios = require('axios');

const setProduct = async (products) => {
    const shopify = new Shopify({
        shopName: 'c220a3-2.myshopify.com',
        // apiKey: 'c0f018c2783767d3250a63593c343184',
        // password: '887feff3f81f25531e5ef51fe2008070',
        accessToken:'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'
      });

      // var products = {
      //   "product": {
      //     "title": 'My first',
      //     "body_html": 'this is for testing',
      //     "vendor": 'Five Towns Wine & Liquor',
      //     "images": [{ "src" : 'https://d3omj40jjfp5tk.cloudfront.net/products/63a22f4d8742d4459fb48639/original.png'}], 
      //     "variants": [
      //       {
      //         "price": '12.99',
      //       }

      //     ]
      //   }
      // }

      var products = {
        title: 'My first',
        body_html: '<p>Absolut Berry Vodkarita is a sweet little twist of our widely appreciated Absout Vodkarita. A fizzy pre-mix with a lot of berryness and without the mess. Fill a rocks glass with ice and dazzle your friend with a chilled ready to drink – made by some of the best bartenders you can find (don’t worry we won’t take any credit, this is your party).</p>',
        vendor: 'Five Towns Wine & Liquor',
        product_type: 'alcohol, spirits, cocktail, vodka',
        handle: '607f39bd8aa4553153654699c',
        status: 'active',
        tags: 'alcohol, cocktail, spirits, vodka',
        variants: [ 
          {
            price: '2.19',
            position: 1,
            inventory_policy: 'deny',
            compare_at_price: '1.68',
            fulfillment_service: 'manual',
            inventory_management: 'shopify',
            option1: '200ml',
            option2: null,
            option3: null,
            barcode: '8.50E+11',
            grams: 0,
            image_id: null,
            weight: 0,
            weight_unit: 'g',
            inventory_quantity: 2,
            requires_shipping: true,
          }
        ],
        options: [ 
          {
            name: 'SIZE',
            position: 1,
            values: [ '200ml' ]
          }  
        ],
        image: {
          position: 1,
          alt: null,
          src: 'https://cdn.shopify.com/s/files/1/0757/0325/5321/products/original_f6cb67b3-3015-417f-8a67-2c8d5b13ed03.jpg?v=1684985789',
    }
      }

      shopify.product.create(products)
      .then(product => {
        console.log(product)

      } )
    .catch(err => {
        console.error(err)
    });

}

module.exports = {
    setProduct,
}