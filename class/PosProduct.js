const { By, until, Builder} = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/edge');

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

const getProductFromPOS = async (number_of_repeat) => {
  let count = 0;
  let product_detail = [];

  let options = new chrome.Options();
  options.headless();
  

  let driver = new webdriver.Builder()
  .forBrowser(webdriver.Browser.EDGE)
  .setChromeOptions(options)
  .build();

  await driver.get(url);
  await driver.findElement(By.css('#txtuserid')).sendKeys('Shopify');
  await driver.findElement(By.css('#txtpwd')).sendKeys('APInewpassword123');
  await driver.findElement(By.css('#txtstore')).sendKeys('1233');
  await driver.findElement(By.css('#chkremember')).click();
  await driver.findElement(By.css('#lnkLogin')).click();

  await driver.sleep(1000);
  await driver.navigate().forward();

  const station_url = await driver.getCurrentUrl();

  for (let i = 0; i < 1; i++) {
    await driver.get(station_url);

    switch (i) {
      case 0:
        await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_gvStationmanager_ctl08_imgSelectStation')).click();
        break;
      case 1:
        await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_gvStationmanager_ctl09_imgSelectStation')).click();
        break;
      case 2:
        await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_gvStationmanager_ctl10_imgSelectStation')).click();
        break;
    }

    await driver.sleep(1000);
    await driver.navigate().forward();

    console.log('station!!!!');

    await driver.findElement(By.css('#ctl00_lnkexpcolInventory')).click();

    await driver.sleep(1000);
    await driver.navigate().forward();
    console.log('inventory!!!!');

    for (let j = 0; j < 4 * number_of_repeat; j++) {
      // Wait for the Next button to be clickable
      const nextButton = await driver.wait(
        until.elementLocated(By.css('#ctl00_ContentPlaceHolder2_lnkNextInvList')),
        10000
      );
    
      // Click the Next button
      await nextButton.click();
      console.log('Next button clicked');
    
      await driver.sleep(1000);
    }

    let flag = 0;

    do {

      await driver.findElement(By.css('#tdlnkDetails')).click();
      await driver.wait(until.elementLocated(By.css('#ctl00_ContentPlaceHolder2_lbldetailPrice')), 10000);
      console.log('detail page!!!!');

      for (let j = 0; j < 15; j++) {

        price = await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_lbldetailPrice')).getText();
        qty = await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_lbldetailQtyonHand')).getText();
        last_edit = await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_lbldetailEdit')).getText();
        description = await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_lbldetaildesc')).getText();
        pre_inventory_page = await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_lbldetailsku')).getText();

        await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_lnkdetailbarcode')).click();
        await driver.wait(until.elementLocated(By.css('#ctl00_ContentPlaceHolder2_gvBarcode')), 10000);
        await driver.sleep(1000);

        const barcode_table = await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_gvBarcode')).getAttribute('outerHTML');
        const $ = cheerio.load(barcode_table);
        barcode1 = $("#ctl00_ContentPlaceHolder2_gvBarcode_ctl02_lblBarcode").text();
        barcode2 = $('#ctl00_ContentPlaceHolder2_gvBarcode_ctl03_lblBarcode').text();
        barcode3 = $('#ctl00_ContentPlaceHolder2_gvBarcode_ctl04_lblBarcode').text();

        const new_data = {
          barcode1: barcode1,
          barcode2: barcode2,
          barcode3: barcode3,
          description: description,
          price: price,
          qty: qty,
          last_edit: last_edit
        };

        product_detail.push(new_data);

        count++;

        console.log('detail>>>', new_data);
        console.log('count', count);
        console.log('j>>>', j);

        await driver.sleep(1000);
        await driver.executeScript('document.querySelector("#ctl00_ContentPlaceHolder2_btnBarcodeMpehide").click();');
        await driver.wait(until.elementLocated(By.css('#ctl00_ContentPlaceHolder2_downbtn')), 10000);

        console.log('clicked the exit button');

        await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_downbtn')).click();

        await driver.sleep(1000);

        console.log('next product');

        cur_inventory_page = await driver.findElement(By.css('#ctl00_ContentPlaceHolder2_lbldetailsku')).getText();

        if (cur_inventory_page === pre_inventory_page) {
          console.log('break>>><<<');
          break;
        }
      }

      flag++;
      console.log('flag>>>', flag);

      await driver.findElement(By.css('#tdlnkList')).click();
      await driver.wait(until.elementLocated(By.css('#ctl00_ContentPlaceHolder2_chkwildcardsearch')), 10000);

      console.log('clicked list');

      if (flag === 1) {
        flag = 0;

        break;
      }

    } while (pre_inventory_page !== cur_inventory_page);
  }

  driver.close();

  return product_detail;
};

module.exports = {
  getProductFromPOS
};
