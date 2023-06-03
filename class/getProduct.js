const puppeteer = require("puppeteer");
const cheerio = require("cheerio")
const fs = require("fs")

const url = "https://lightningpos.com/POSLogin.aspx?flag=1?Hg=1080&Wg=1920";

const product_columnID = [
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl02_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl03_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl04_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl05_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl06_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl07_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl08_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl09_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl10_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl11_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl12_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl13_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl14_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl15_chkchkColumn",
    "#ctl00_ContentPlaceHolder2_gvInventoryList_ctl16_chkchkColumn",
]
let product_detail = [];
let price = 0, qty = 0, barcord = "";
let pre_inventory_page = "";
let cur_inventory_page = "";

const getProductFromPOS = async () => {
    let browser =  await puppeteer.launch({headless : true});
    let page = await browser.newPage();
    let inventoryPage = await browser.newPage();

    await page.goto(url , {waitUntil : 'networkidle0' ,  timeout : 0});
    await page.type("#txtuserid", "Shopify");
    await page.type("#txtpwd", "APInewpassword123");
    await page.type("#txtstore", "1233");
    await page.click("#chkremember");
    await page.click("#lnkLogin");
    
    await page.waitForNavigation({waitUntil: 'networkidle0'});
            
    await page.goForward();

    const station_url = page.url();

    for (let i = 0 ; i < 3 ; i ++) {
        await page.goto(station_url, {waitUntil :'networkidle0', timeout:0})

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

        await page.waitForNavigation({waitUntil: 'networkidle0'});
        
        await page.goForward(); //select station end

        console.log("station!!!!");

        await page.click("#ctl00_lnkexpcolInventory"); //select inventory

        await page.waitForNavigation({waitUntil: 'networkidle0'});
        
        await page.goForward(); //inventory page
        console.log("inventory!!!!");

        do {
            pre_inventory_page = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList', el =>el.outerHTML);

            fs.writeFileSync("page.html", await page.content())    

            // product_columnID.forEach(async (id) => {
                await page.click('#ctl00_ContentPlaceHolder2_gvInventoryList_ctl03_chkchkColumn');
                
                await page.click("#tdlnkDetails");
                await page.waitForSelector('#ctl00_ContentPlaceHolder2_lbldetailPrice', { timeout: 5000 });
                console.log("detail page!!!!");

                price = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailPrice', el => el.innerHTML);
                qty = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailQtyonHand', el => el.innerHTML);

                console.log("price>>>", price);
                console.log("qty>>>>>", qty);
                
                await page.click("#ctl00_ContentPlaceHolder2_lnkdetailbarcode");

                await page.waitForSelector('#ctl00_ContentPlaceHolder2_gvBarcode', { timeout: 5000 });

                const barcode_table = await page.$eval('#ctl00_ContentPlaceHolder2_gvBarcode', el =>el.outerHTML);
                const $ = cheerio.load(barcode_table);
                const barcode = $("#ctl00_ContentPlaceHolder2_gvBarcode_ctl02_lblBarcode").text();
                
                console.log("barcode>>>>", barcode);

                const new_data = {
                    barcode:barcode,
                    price:price,
                    qty:qty
                };

                product_detail.push(new_data);

                console.log("detail>>>", product_detail);

                await page.waitForTimeout(1000);
                await page.click('#ctl00_ContentPlaceHolder2_btnBarcodeMpehide');
                await page.waitForSelector('#ctl00_ContentPlaceHolder2_downbtn', { timeout: 5000 });
                await page.goForward();

                console.log("clicked the exit button");

                await page.click('#ctl00_ContentPlaceHolder2_downbtn');
                await page.waitForTimeout(3000);
                
                await page.click('#tdlnkList');
                await page.waitForSelector('#ctl00_ContentPlaceHolder2_chkwildcardsearch')
    
            // });

            await page.click('#ctl00_ContentPlaceHolder2_lnkNextInvList');
            await page.waitForNavigation({waitUntil: 'networkidle0'});
            await page.goForward();
            
            // await page.waitForNavigation({waitUntil: 'networkidle0'});
            // await page.goForward();
            cur_inventory_page = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList', el =>el.outerHTML);
        } while (pre_inventory_page !== cur_inventory_page);

        // const html = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList', el => el.outerHTML);
        // console.log("html:" + html);
        
    }
        
}

module.exports = {
    getProductFromPOS,
    
}