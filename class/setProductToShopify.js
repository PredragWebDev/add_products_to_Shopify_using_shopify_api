const Shopify = require('shopify-api-node');

const setProduct = async (products) => {
    const shopify = new Shopify({
        shopName: 'c220a3-2.myshopify.com',
        apiKey: 'c0f018c2783767d3250a63593c343184',
        password: '887feff3f81f25531e5ef51fe2008070'
      });

      var products = {
        "product": {
          "title": 'My first',
          "body_html": 'this is for testing',
          "images" : [{ "src" : 'https://' }], 
          "variants": [
            {
              "price": '12.99',
            }
          ]
        }
      }
    //   shopify.product.create(product)
    //   .then(product => console.log(product))
    // .catch(err => {
    //     console.error(err)
    // });

    
    shopify.post('/admin/products.json', products, function(err, data, headers){
      console.log(data);
    });

    shopify.product.list()
      .then(product => console.log(product))
    .catch(err => {
        console.error(err)
    });

      // Shopify.post('/admin/products.json', product, function(err, data, headers){
      //   console.log("response data>>>", data)
      // });
}

module.exports = {
    setProduct,
}