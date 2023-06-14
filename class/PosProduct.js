const { By, until, Builder} = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

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

  let options = new chrome.Options();
  options.headless();
  

  let driver = new webdriver.Builder()
  .forBrowser(webdriver.Browser.FIREFOX)
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

  await driver.findElement(By.id('ctl00_ContentPlaceHolder2_gvStationmanager_ctl09_imgSelectStation')).click();
 
    await driver.sleep(1000);
    await driver.navigate().forward();

    console.log('station!!!!');
    let elements = driver.findElements(By.id("ctl00_ContentPlaceHolder2_Label6ctl00_ContentPlaceHolder2_Label6"));
    console.log('test>>>', elements);
    if ((await elements).length > 0) {
      await driver.findElements(By.id('ctl00_ContentPlaceHolder2_btnCloseMntnce')).click();
    }
    await driver.findElement(By.id('ctl00_lnkexpcolInventory')).click();

    await driver.sleep(1000);
    await driver.navigate().forward();
    console.log('inventory!!!!');

    try{
      for (let j = 0; j < onetime * number_of_repeat; j++) {
        // Wait for the Next button to be clickable
        await driver.wait(until.elementLocated(By.id('ctl00_ContentPlaceHolder2_lnkNextInvList')), 10000);
        let nextbutton = await driver.findElement(By.id('ctl00_ContentPlaceHolder2_lnkNextInvList'));
    
          await driver.executeScript('arguments[0].scrollIntoView(true);', nextbutton);
          await driver.sleep(1000);
          await nextbutton.click();
    
          console.log('Next button clicked');
        
          await driver.sleep(1000);
      }
    } catch (error) {
      console.log('error occured when click the next button', error);
    }
    

    let flag = 0;

    try {
      do {
        await driver.findElement(By.id('tdlnkDetails')).click();
        await driver.wait(until.elementLocated(By.id('ctl00_ContentPlaceHolder2_lbldetailPrice')), 10000);
        console.log('detail page!!!!');
    
        for (let j = 0; j < 15; j++) {
          let price, qty, last_edit, description, pre_inventory_page, barcode1, barcode2, barcode3;
    
          try {
            price = await driver.findElement(By.id('ctl00_ContentPlaceHolder2_lbldetailPrice')).getText();
            qty = await driver.findElement(By.id('ctl00_ContentPlaceHolder2_lbldetailQtyonHand')).getText();
            last_edit = await driver.findElement(By.id('ctl00_ContentPlaceHolder2_lbldetailEdit')).getText();
            description = await driver.findElement(By.id('ctl00_ContentPlaceHolder2_lbldetaildesc')).getText();
            pre_inventory_page = await driver.findElement(By.id('ctl00_ContentPlaceHolder2_lbldetailsku')).getText();
    
            await driver.findElement(By.id('ctl00_ContentPlaceHolder2_lnkdetailbarcode')).click();
            await driver.wait(until.elementLocated(By.id('ctl00_ContentPlaceHolder2_gvBarcode')), 10000);
            await driver.sleep(1000);
    
            const barcode_table = await driver.findElement(By.id('ctl00_ContentPlaceHolder2_gvBarcode')).getAttribute('outerHTML');
            const $ = cheerio.load(barcode_table);
            barcode1 = $("ctl00_ContentPlaceHolder2_gvBarcode_ctl02_lblBarcode").text();
            barcode2 = $('ctl00_ContentPlaceHolder2_gvBarcode_ctl03_lblBarcode').text();
            barcode3 = $('ctl00_ContentPlaceHolder2_gvBarcode_ctl04_lblBarcode').text();
    
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
            await driver.wait(until.elementLocated(By.id('ctl00_ContentPlaceHolder2_downbtn')), 10000);
    
            console.log('clicked the exit button');
    
            await driver.findElement(By.id('ctl00_ContentPlaceHolder2_downbtn')).click();
    
            await driver.sleep(1000);
    
            console.log('next product');
    
            cur_inventory_page = await driver.findElement(By.id('ctl00_ContentPlaceHolder2_lbldetailsku')).getText();
          } catch (error) {
            console.error(`An error occurred in cycle ${count}:`, error);
          }
    
          if (cur_inventory_page === pre_inventory_page) {
            console.log('break>>><<<');
            break;
          }
        }
    
        flag++;
        console.log('flag>>>', flag);
    
        await driver.findElement(By.id('tdlnkList')).click();
        await driver.wait(until.elementLocated(By.id('ctl00_ContentPlaceHolder2_chkwildcardsearch')), 10000);
    
        console.log('clicked list');
    
        if (flag === onetime) {
          flag = 0;
    
          break;
        }
    
      } while (pre_inventory_page !== cur_inventory_page);
    } catch (error) {
      console.error('An error occurred:', error);
    }
    
  driver.quit();

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