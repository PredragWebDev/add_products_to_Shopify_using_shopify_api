// const { By, until, Builder} = require('selenium-webdriver');
// const webdriver = require('selenium-webdriver');
// const chrome = require('selenium-webdriver/chrome');
// const firefox = require('selenium-webdriver/firefox');
const puppeteer = require("puppeteer");

const fs = require('fs');
const cheerio = require("cheerio");
const { promises } = require('dns');

const url = 'https://lightningpos.com/POSLogin.aspx?flag=1?Hg=1080&Wg=1920';

let price = 0,
  qty = 0,
  barcode1 = '',
  barcode2 = '',
  barcode3 = '',
  last_edit = '',
  description = '';
let pre_inventory_page = '';
let cur_inventory_page = '';

const getProductFromPOS = async (sku_of_products, from, to) => {
  let count = 0;
  let product_detail = [];
  

  console.log('start>>>>>>>>>>>>>>>>>>', from);
  console.log('to>>>>>>', to);

  let browser = await puppeteer.launch({ headless: true });

  let page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
  await page.type("#txtuserid", "Shopify");
  await page.type("#txtpwd", "APInewpassword123");
  await page.type("#txtstore", "1233");
  await page.click("#chkremember");
  // await page.click("#lnkLogin");
  await page.evaluate(() => {
    // Click the exit button using JavaScript evaluation
      document.querySelector('#lnkLogin').click();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await page.goForward();

  // const station_url = page.url();

  await page.click("#ctl00_ContentPlaceHolder2_gvStationmanager_ctl09_imgSelectStation");
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await page.goForward();

  console.log('station!!!!');

  // let elements = driver.findElements(By.id("ctl00_ContentPlaceHolder2_Label6ctl00_ContentPlaceHolder2_Label6"));
  // console.log('test>>>', elements);
  // if ((await elements).length > 0) {
  //   await driver.findElements(By.id('ctl00_ContentPlaceHolder2_btnCloseMntnce')).click();
  // }
  await page.click("#ctl00_lnkexpcolInventory");

  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await page.goForward();
  console.log('inventory!!!!');

  // try{
  //   for (let j = 0; j < page_starter + step * index_of_browser; j++) {
  //     // Wait for the Next button to be clickable
  //     await page.waitForSelector('#ctl00_ContentPlaceHolder2_lnkNextInvList')
  //     // await page.evaluate(() => {
  //     //   // Click the exit button using JavaScript evaluation
  //     //     document.querySelector('#ctl00_ContentPlaceHolder2_lnkNextInvList').click();
  //     //   });
  //     await page.click('#ctl00_ContentPlaceHolder2_lnkNextInvList');
  //     await page.waitForTimeout(1000);

  //     console.log('clicked next button');
  //   }
  // } catch (error) {
  //   fs.appendFileSync('error.txt', error);

  //   console.log('error occured when click the next button', error);
  // }

  let flag = 0;

    try {

      for (let i = from; i < to; i ++) {

        await page.type('#ctl00_ContentPlaceHolder2_txtSearch', sku_of_products[i]);

        await page.click('#ctl00_ContentPlaceHolder2_btnSearch');

        await page.waitForTimeout(1000);

        await page.click("#tdlnkDetails");
        
        // await page.waitForFunction(async ()=> {
        //   const elements = await page.$$("#ctl00_ContentPlaceHolder2_lbldetailPrice");
        //   return elements.length > 0
        // }, {timeout:60000} )
        await page.waitForSelector('#ctl00_ContentPlaceHolder2_lbldetailPrice', { timeout: 10000 });
        console.log('detail page!!!!');
    
        let price, qty, title, vendor, last_edit, type, size, cost, pre_inventory_page, barcode1, barcode2, barcode3;
    
          try {
            price = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailPrice', el => el.innerHTML);
            qty = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailQtyonHand', el => el.innerHTML);
            last_edit = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailEdit', el => el.innerHTML);
            vendor = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailvendor', el => el.innerHTML);
            title = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetaildesc', el => el.innerHTML);
            type = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetaildepartment', el => el.innerHTML);
            size = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailsize', el => el.innerHTML);
            cost = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetaillastcost', el => el.innerHTML);

            let last_edit_date = new Date(last_edit);
            let cur_date = new Date();

            // console.log('title>>>>', title);

            // console.log('last edited>>>>', last_edit_date);
            pre_inventory_page = cur_inventory_page = cur_inventory_page = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailsku', el => el.innerHTML);;

            // if (cur_date - last_edit_date < 3600000 * 24 * 15) {
    
              await page.waitForTimeout(1000);
              await page.evaluate(() => {
              // Click the exit button using JavaScript evaluation
                document.querySelector('#ctl00_ContentPlaceHolder2_lnkdetailbarcode').click();
              });
              // await page.click("#ctl00_ContentPlaceHolder2_lnkdetailbarcode");

              await page.waitForSelector('#ctl00_ContentPlaceHolder2_gvBarcode', { timeout: 10000 });

              // await page.waitForTimeout(1000);
      
              const barcode_table = await page.$eval('#ctl00_ContentPlaceHolder2_gvBarcode', el => el.outerHTML);
              const $ = cheerio.load(barcode_table);
              barcode1 = $("#ctl00_ContentPlaceHolder2_gvBarcode_ctl02_lblBarcode").text();
              barcode2 = $('#ctl00_ContentPlaceHolder2_gvBarcode_ctl03_lblBarcode').text();
              barcode3 = $('#ctl00_ContentPlaceHolder2_gvBarcode_ctl04_lblBarcode').text();
      
              const new_data = {
                barcode1: barcode1,
                barcode2: barcode2,
                barcode3: barcode3,
                title: title,
                price: price,
                qty: qty,
                vendor: vendor,
                type: type,
                size: size,
                cost:cost
              };
      
              product_detail.push(new_data);
      
              count++;
      
              console.log('detail>>>', new_data);
              console.log('count', count);
              // console.log('j>>>', j);
      
              await page.waitForTimeout(1000);
              await page.evaluate(() => {
              // Click the exit button using JavaScript evaluation
              document.querySelector('#ctl00_ContentPlaceHolder2_btnBarcodeMpehide').click();
              });

              // await page.click('#ctl00_ContentPlaceHolder2_btnBarcodeMpehide');
              await page.waitForTimeout(1000);

              await page.waitForSelector('#ctl00_ContentPlaceHolder2_downbtn', { timeout: 10000 });
    
              console.log('clicked the exit button');
            // }
            // else {
            //   console.log("Not updated!");
            // }

            // console.log('13 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            // await page.click('#tdlnkList');
            cur_inventory_page = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailsku', el => el.innerHTML);

            await page.waitForTimeout(1000);
            // await page.waitForTimeout(30000);
            await page.evaluate(() => {
              // Click the exit button using JavaScript evaluation
              document.querySelector('#tdlnkList').click();
            });
            // await page.waitForNavigation({waitUntil: 'networkidle0'});
            await page.waitForSelector('#ctl00_ContentPlaceHolder2_txtSearch', { timeout: 30000 });
            console.log("clicked list");
            await page.waitForTimeout(1000);
                          
          } catch (error) {
            console.log(`An error occurred in cycle ${count}:`, error);

          }
      } 

        // await page.waitForTimeout(600000);
      // }

      // if (index_of_browser === 4) {
      //   for (let i = 0; i < number_of_pages - (Math.floor(number_of_pages/(onetime * number_of_browsers))*(onetime * number_of_browsers)); i ++) {
      //     await page.click("#tdlnkDetails");
      //     await page.waitForSelector('#ctl00_ContentPlaceHolder2_lbldetailPrice', { timeout: 10000 });
      //     console.log('detail page!!!!');
      
      //     let price, qty, title, vendor, type, size, cost, pre_inventory_page, barcode1, barcode2, barcode3;
      
      //       try {
      //         price = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailPrice', el => el.innerHTML);
      //         qty = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailQtyonHand', el => el.innerHTML);
      //         // last_edit = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailEdit', el => el.innerHTML);
      //         vendor = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailvendor', el => el.innerHTML);
      //         title = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetaildesc', el => el.innerHTML);
      //         type = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetaildepartment', el => el.innerHTML);
      //         size = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailsize', el => el.innerHTML);
      //         cost = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetaillastcost', el => el.innerHTML);
    
      //       await page.waitForTimeout(1000);
      //       await page.evaluate(() => {
      //       // Click the exit button using JavaScript evaluation
      //         document.querySelector('#ctl00_ContentPlaceHolder2_lnkdetailbarcode').click();
      //       });
      //       // await page.click("#ctl00_ContentPlaceHolder2_lnkdetailbarcode");

      //       await page.waitForSelector('#ctl00_ContentPlaceHolder2_gvBarcode', { timeout: 10000 });

      //       // await page.waitForTimeout(1000);
    
      //       const barcode_table = await page.$eval('#ctl00_ContentPlaceHolder2_gvBarcode', el => el.outerHTML);
      //       const $ = cheerio.load(barcode_table);
      //       barcode1 = $("#ctl00_ContentPlaceHolder2_gvBarcode_ctl02_lblBarcode").text();
      //       barcode2 = $('#ctl00_ContentPlaceHolder2_gvBarcode_ctl03_lblBarcode').text();
      //       barcode3 = $('#ctl00_ContentPlaceHolder2_gvBarcode_ctl04_lblBarcode').text();

    
      //       const new_data = {
      //         barcode1: barcode1,
      //         barcode2: barcode2,
      //         barcode3: barcode3,
      //         description: description,
      //         // price: price,
      //         qty: qty,
      //         // last_edit: last_edit
      //       };
    
      //       product_detail.push(new_data);
    
      //       count++;
    
      //       console.log('detail>>>', new_data);
      //       console.log('count', count);
      //       console.log('j>>>', j);
    
      //       await page.waitForTimeout(1000);
      //       await page.evaluate(() => {
      //       // Click the exit button using JavaScript evaluation
      //       document.querySelector('#ctl00_ContentPlaceHolder2_btnBarcodeMpehide').click();
      //       });

      //       // await page.click('#ctl00_ContentPlaceHolder2_btnBarcodeMpehide');
      //       await page.waitForTimeout(1000);

      //       if (j === 14) {
      //         console.log('13 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      //         // await page.click('#tdlnkList');
      //         cur_inventory_page = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailsku', el => el.innerHTML);

      //         await page.waitForTimeout(1000);
      //         // await page.waitForTimeout(30000);
      //         await page.evaluate(() => {
      //           // Click the exit button using JavaScript evaluation
      //           document.querySelector('#tdlnkList').click();
      //           });
      //         // await page.waitForNavigation({waitUntil: 'networkidle0'});
      //         // await page.waitForSelector('#ctl00_ContentPlaceHolder2_chkwildcardsearch', { timeout: 10000 });
      //         console.log("clicked list");
      //         await page.waitForTimeout(1000);
      //         await page.click('#ctl00_ContentPlaceHolder2_lnkNextInvList');
      //         await page.waitForTimeout(1000);
      //       }
      //       else {
      //         await page.waitForSelector('#ctl00_ContentPlaceHolder2_downbtn', { timeout: 10000 });
    
      //         console.log('clicked the exit button');
      //         await page.evaluate(() => {
      //           // Click the exit button using JavaScript evaluation
      //           document.querySelector('#ctl00_ContentPlaceHolder2_downbtn').click();
      //         });
      //         // await page.click('#ctl00_ContentPlaceHolder2_downbtn');

      //         await page.waitForTimeout(1000)
      
      //         console.log('next product');
      //         cur_inventory_page = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailsku', el => el.innerHTML);
      //         if (cur_inventory_page === pre_inventory_page) {
      //           console.log('break>>><<<');
      //           break;
      //         }
      //       }
    
            
      //     } catch (error) {
      //       console.error(`An error occurred in cycle ${count}:`, error);
      //     }
          
      //   }
      // }
    } catch (error) {
      console.error('An error occurred:', error);
      fs.appendFileSync('error.txt', err);

    }
    
  browser.close();

  return product_detail;
};

const get_sku_of_products = async () => {

  let browser = await puppeteer.launch({ headless: false });

  let page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
  await page.type("#txtuserid", "Shopify");
  await page.type("#txtpwd", "APInewpassword123");
  await page.type("#txtstore", "1233");
  await page.click("#chkremember");
  // await page.click("#lnkLogin");
  await page.evaluate(() => {
    // Click the exit button using JavaScript evaluation
      document.querySelector('#lnkLogin').click();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await page.goForward();

  await page.click("#ctl00_ContentPlaceHolder2_gvStationmanager_ctl09_imgSelectStation");
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await page.goForward();

  console.log('station!!!!');

  await page.click("#ctl00_lnkexpcolInventory");

  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await page.goForward();
  console.log('inventory!!!!');
  
  let number_of_pages = 0;
  let cur_pageContent = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl02_lblitem_mst_id', el => el.innerHTML);
  let pre_pageContent;
  let sku_of_products = [];
  let count_of_products = 0;
  do {
    pre_pageContent = cur_pageContent;

    try {
      for (let i = 0; i < 21; i ++) {
        if (i < 8) {
          // console.log(`#ctl00_ContentPlaceHolder2_gvInventoryList_ctl0${i + 2}_lblitem_mst_id`);
          const elements = await page.$$(`#ctl00_ContentPlaceHolder2_gvInventoryList_ctl0${i + 2}_lblitem_mst_id`);
          if (elements.length > 0) 
          { 
            sku_of_products[count_of_products] = await page.$eval(`#ctl00_ContentPlaceHolder2_gvInventoryList_ctl0${i + 2}_lblitem_mst_id`, el => el.innerHTML);
            console.log('sku>>>>', sku_of_products[count_of_products]);
            count_of_products ++;
          }
          
        }
        else {
          const elements = await page.$$(`#ctl00_ContentPlaceHolder2_gvInventoryList_ctl${i + 2}_lblitem_mst_id`);
          if (elements.length > 0) 
          { 
            sku_of_products[count_of_products] = await page.$eval(`#ctl00_ContentPlaceHolder2_gvInventoryList_ctl${i + 2}_lblitem_mst_id`, el => el.innerHTML);
            console.log('sku>>>>', sku_of_products[count_of_products]);
            count_of_products ++;
          }
          
        }
      }
      
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl03_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl04_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl05_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl06_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl07_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl08_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl09_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl10_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl11_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl12_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl13_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl14_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl15_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
      // sku_of_products[count_of_products] = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl16_lblitem_mst_id', el => el.innerHTML);
      // count_of_products ++;
    } catch (err) {
      console.log(err)
    }
    
    // Wait for the Next button to be clickable

    await page.click('#ctl00_ContentPlaceHolder2_lnkNextInvList')

    await page.waitForTimeout(1000);

    cur_pageContent = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl02_lblitem_mst_id', el => el.innerHTML);

    console.log('clicked the next button');

    number_of_pages++;
  } while (pre_pageContent !== cur_pageContent);

  browser.close();

  return sku_of_products;

}
module.exports = {
  getProductFromPOS,
  get_sku_of_products
};