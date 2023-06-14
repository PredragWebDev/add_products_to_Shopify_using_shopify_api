const { By, until, Builder} = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const puppeteer = require("puppeteer");

const fs = require('fs');
const cheerio = require("cheerio");

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

const getProductFromPOS = async (number_of_repeat, onetime) => {
  let count = 0;
  let product_detail = [];

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

  try{
    for (let j = 0; j < onetime * number_of_repeat; j++) {
      // Wait for the Next button to be clickable
      await page.evaluate(() => {
        // Click the exit button using JavaScript evaluation
          document.querySelector('#ctl00_ContentPlaceHolder2_lnkNextInvList').click();
        });
      // await page.click('#ctl00_ContentPlaceHolder2_lnkNextInvList');
      await page.waitForTimeout(1000);

      console.log('clicked next button');
    }
  } catch (error) {
    console.log('error occured when click the next button', error);
  }
    

  let flag = 0;

    try {
      do {
        await page.click("#tdlnkDetails");
        await page.waitForSelector('#ctl00_ContentPlaceHolder2_lbldetailPrice', { timeout: 10000 });
        console.log('detail page!!!!');
    
        for (let j = 0; j < 15; j++) {
          let price, qty, last_edit, description, pre_inventory_page, barcode1, barcode2, barcode3;
    
          try {
            // price = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailPrice', el => el.innerHTML);
            qty = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailQtyonHand', el => el.innerHTML);
            // last_edit = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailEdit', el => el.innerHTML);
            description = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetaildesc', el => el.innerHTML);
            pre_inventory_page = cur_inventory_page;
    
            await page.waitForTimeout(1000);
            await page.evaluate(() => {
            // Click the exit button using JavaScript evaluation
              document.querySelector('#ctl00_ContentPlaceHolder2_lnkdetailbarcode').click();
            });
            // await page.click("#ctl00_ContentPlaceHolder2_lnkdetailbarcode");

            await page.waitForSelector('#ctl00_ContentPlaceHolder2_gvBarcode', { timeout: 10000 });

            await page.waitForTimeout(1000);
    
            const barcode_table = await page.$eval('#ctl00_ContentPlaceHolder2_gvBarcode', el => el.outerHTML);
            const $ = cheerio.load(barcode_table);
            barcode1 = $("#ctl00_ContentPlaceHolder2_gvBarcode_ctl02_lblBarcode").text();
            barcode2 = $('#ctl00_ContentPlaceHolder2_gvBarcode_ctl03_lblBarcode').text();
            barcode3 = $('#ctl00_ContentPlaceHolder2_gvBarcode_ctl04_lblBarcode').text();

    
            const new_data = {
              barcode1: barcode1,
              barcode2: barcode2,
              barcode3: barcode3,
              description: description,
              // price: price,
              qty: qty,
              // last_edit: last_edit
            };
    
            product_detail.push(new_data);
    
            count++;
    
            console.log('detail>>>', new_data);
            console.log('count', count);
            console.log('j>>>', j);
    
            await page.waitForTimeout(1000);
            await page.evaluate(() => {
            // Click the exit button using JavaScript evaluation
            document.querySelector('#ctl00_ContentPlaceHolder2_btnBarcodeMpehide').click();
            });

            if (j === 14) {
              console.log('13 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
              // await page.click('#tdlnkList');
              await page.waitForTimeout(1000);
              await page.evaluate(() => {
                // Click the exit button using JavaScript evaluation
                document.querySelector('#tdlnkList').click();
                });
              // await page.waitForNavigation({waitUntil: 'networkidle0'});
              // await page.waitForSelector('#ctl00_ContentPlaceHolder2_chkwildcardsearch', { timeout: 10000 });
              console.log("clicked list");
              await page.waitForTimeout(1000);
              await page.click('#ctl00_ContentPlaceHolder2_lnkNextInvList');
              await page.waitForTimeout(1000);
            }
            else {
              await page.waitForSelector('#ctl00_ContentPlaceHolder2_downbtn', { timeout: 10000 });
    
              console.log('clicked the exit button');
              await page.evaluate(() => {
                // Click the exit button using JavaScript evaluation
                document.querySelector('#ctl00_ContentPlaceHolder2_downbtn').click();
              });
              // await page.click('#ctl00_ContentPlaceHolder2_downbtn');

              await page.waitForTimeout(1000)
      
              console.log('next product');
              // cur_inventory_page = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailsku', el => el.innerHTML);
              // if (cur_inventory_page === pre_inventory_page) {
              //   console.log('break>>><<<');
              //   break;
              // }
            }
    
            
          } catch (error) {
            console.error(`An error occurred in cycle ${count}:`, error);
          }
    
          
        }
    
        flag++;
        console.log('flag>>>', flag);
    
        if (flag === onetime) {
          flag = 0;
    
          break;
        }
    
      } while (pre_inventory_page !== cur_inventory_page);
    } catch (error) {
      console.error('An error occurred:', error);
    }
    
  browser.close();

  return product_detail;
};

const get_number_of_pages = async () => {

  let options = new chrome.Options();
  options.headless();
  

  let driver = new webdriver.Builder()
  .forBrowser(webdriver.Browser.EDGE)
  .setChromeOptions(options)
  .build();

  await driver.get(url);
  await driver.findElement(By.id('txtuserid')).sendKeys('Shopify');
  await driver.findElement(By.id('txtpwd')).sendKeys('APInewpassword123');
  await driver.findElement(By.id('txtstore')).sendKeys('1233');
  await driver.findElement(By.id('chkremember')).click();
  await driver.findElement(By.id('lnkLogin')).click();

  await driver.sleep(1000);
  await driver.navigate().forward();

  const station_url = await driver.getCurrentUrl();

    await driver.findElement(By.id('ctl00_ContentPlaceHolder2_gvStationmanager_ctl08_imgSelectStation')).click();
     

  await driver.sleep(1000);
  await driver.navigate().forward();

  console.log('station!!!!');
  
  let elements = driver.findElements(By.id("#ctl00_ContentPlaceHolder2_Label6ctl00_ContentPlaceHolder2_Label6"));
  console.log('test>>>', elements);
  if (elements !== "") {
    await driver.findElement(By.id('ctl00_ContentPlaceHolder2_btnCloseMntnce')).click();
  }

  await driver.findElement(By.id('ctl00_lnkexpcolInventory')).click();

  await driver.sleep(1000);
  await driver.navigate().forward();
  console.log('inventory!!!!');

  let number_of_pages = 0;
  let cur_pageContent = await driver.findElement(By.id('ctl00_ContentPlaceHolder2_gvInventoryList')).getAttribute('outerHTML');
  let pre_pageContent;

  do {
    pre_pageContent = cur_pageContent;

    // Wait for the Next button to be clickable
    const nextButton = await driver.wait(
      until.elementLocated(By.id('ctl00_ContentPlaceHolder2_lnkNextInvList')),
      10000
    );

    // Click the Next button
    await nextButton.click();
    console.log('Next button clicked');

    await driver.sleep(1000);
    cur_pageContent = await driver.findElement(By.id('ctl00_ContentPlaceHolder2_gvInventoryList')).getAttribute('outerHTML');

    number_of_pages++;
  } while (pre_pageContent !== cur_pageContent);


  driver.quit();

  return number_of_pages;

}
module.exports = {
  getProductFromPOS,
  get_number_of_pages
};