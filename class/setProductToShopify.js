const Shopify = require('shopify-api-node');

const setProduct = async (products) => {
    const shopify = new Shopify({
        shopName: 'withyou746@gmail.com',
        apiKey: '078f49253b2ec9f0816943f975f87b97',
        password: 'asd123!@#'
      });

      const newProduct = {
        title: 'My New Product',
        body_html: '<p>This is my new product.</p>',
        vendor: 'My Company',
        product_type: 'Physical',
        variants: products,
      };

      shopify.product.create(newProduct)
      .then(product => console.log(product))
    .catch(err => {
        console.error(err)
    });
}

module.exports = {
    setProduct,
}