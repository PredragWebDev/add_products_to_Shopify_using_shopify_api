const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

const url = "https://lightningpos.com/POSLogin.aspx?flag=1?Hg=1080&Wg=1920";

const product_columnID = [
  "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl02_chkchkColumn",
  "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl03_chkchkColumn",
  // ... rest of the column IDs
];


let price = 0,
  qty = 0,
  barcode1 = "",
  barcode2 = "",
  barcode3 = "",
  last_edit = "",
  description = "";
let pre_inventory_page = "";
let cur_inventory_page = "";


const getProductFromPOS = async (number_of_repeat) => {
    let count = 0;
    let product_detail = [];
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    let inventoryPage = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
    await page.type("#txtuserid", "Shopify");
    await page.type("#txtpwd", "APInewpassword123");
    await page.type("#txtstore", "1233");
    await page.click("#chkremember");
    await page.click("#lnkLogin");

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await page.goForward();

    const station_url = page.url();

    for (let i = 0; i < 3; i++) {
        await page.goto(station_url, { waitUntil: 'networkidle0', timeout: 0 });

        switch (i) {
        case 0:
            await page.click("#ctl00_ContentPlaceHolder2_gvStationmanager_ctl08_imgSelectStation");
            break;
        case 1:
            await page.click("#ctl00_ContentPlaceHolder2_gvStationmanager_ctl09_imgSelectStation");
            break;
        case 2:
            await page.click("#ctl00_ContentPlaceHolder2_gvStationmanager_ctl10_imgSelectStation");
            break;
        }
        
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        await page.goForward();

        console.log("station!!!!");

        await page.click("#ctl00_lnkexpcolInventory");

        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        await page.goForward();
        console.log("inventory!!!!");

        // next page button click.

        for (let j = 0; j < number_of_repeat; j ++) {
            await page.click('#ctl00_ContentPlaceHolder2_lnkNextInvList');
            await page.waitForTimeout(1000);
        }

        let flag = 0;

        do {

            fs.writeFileSync("page.html", await page.content());

            await page.click("#tdlnkDetails");
            await page.waitForSelector('#ctl00_ContentPlaceHolder2_lbldetailPrice', { timeout: 10000 });
            console.log("detail page!!!!");

            for (let j = 0; j < 15; j++) {

                price = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailPrice', el => el.innerHTML);
                qty = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailQtyonHand', el => el.innerHTML);
                last_edit = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailEdit', el => el.innerHTML);
                description = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetaildesc', el => el.innerHTML);
                pre_inventory_page = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailsku', el => el.innerHTML);

                await page.click("#ctl00_ContentPlaceHolder2_lnkdetailbarcode");

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
                price: price,
                qty: qty,
                last_edit: last_edit
                };

                product_detail.push(new_data);

                count++;

                console.log("detail>>>", new_data);
                console.log("count", count);
                console.log('j>>>', j)

                await page.waitForTimeout(1000);
                await page.evaluate(() => {
                // Click the exit button using JavaScript evaluation
                document.querySelector('#ctl00_ContentPlaceHolder2_btnBarcodeMpehide').click();
                });

                await page.waitForSelector('#ctl00_ContentPlaceHolder2_downbtn', { timeout: 10000 });

                console.log("clicked the exit button");

                await page.click('#ctl00_ContentPlaceHolder2_downbtn');

                await page.waitForTimeout(1000)

                console.log("next product");

                cur_inventory_page = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailsku', el => el.innerHTML);

                if (cur_inventory_page === pre_inventory_page ) {
                    console.log("break>>><<<")
                    break;
                }
                
            }

            flag ++;
            console.log('flag>>>', flag);

            if (flag === 1) {
                await page.waitForTimeout(10000);
                flag = 0;

                pre_inventory_page = "123";
                cur_inventory_page = "123";
            }

            await page.click('#tdlnkList');
            await page.waitForSelector('#ctl00_ContentPlaceHolder2_chkwildcardsearch', { timeout: 10000 });
            console.log("clicked list");

            // cur_inventory_page = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList', el => el.outerHTML);
        } while (pre_inventory_page !== cur_inventory_page);

        // const html = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList', el => el.outerHTML);
        // console.log("html:" + html);
    }

    return product_detail;
}

module.exports = {
  getProductFromPOS,
};
