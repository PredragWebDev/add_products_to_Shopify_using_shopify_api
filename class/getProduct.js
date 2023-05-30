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

let price = 0, qty = 0, barcord = "";
let pre_inventory_page = "";

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

        // await inventoryPage.setContent(await page.content())

        // await inventoryPage.waitForNavigation({waitUntil: 'networkidle0'});
        
        // await inventoryPage.goForward();

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
            pre_inventory_page = await page.content();
            fs.writeFileSync("page.html", await page.content())    
            await page.click("#tdlnkDetails");
            await page.waitForNavigation({waitUntil: 'networkidle0'});
            await page. goForward() //detail page
            console.log("detail page!!!!");

            for (let i = 0 ; i < 15; i ++) {

                price = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailPrice');
                qty = await page.$eval('#ctl00_ContentPlaceHolder2_lbldetailQtyonHand');
                
                await page.click("#ctl00_ContentPlaceHolder2_lnkdetailbarcode");

                await page.waitForNavigation({waitUntil: 'networkidle0'});
                await page.goForward();

                const barcode = await page.$eval('#ctl00_ContentPlaceHolder2_gvBarcode', el =>el.outerHTML);
                console.log("price>>>", price);
                console.log("qty>>>>>", qty);
                console.log("barcode>>>>", barcode);

                await page.click('#ctl00_ContentPlaceHolder2_btnBarcodeMpehide')
                await page.waitForNavigation({waitUntil: 'networkidle0'});
                await page.goForward();
    
                await page.click('#ctl00_ContentPlaceHolder2_downbtn');
                await page.waitForNavigation({waitUntil: 'networkidle0'});
                await page.goForward();
            }

            await page.click('#tdlnkList');
            await page.waitForNavigation({waitUntil: 'networkidle0'});
            await page.goForward();

        } while (pre_inventory_page !== await page.content());

        // const html = await page.$eval('#ctl00_ContentPlaceHolder2_gvInventoryList', el => el.outerHTML);
        // console.log("html:" + html);
        
    }
        
}

module.exports = {
    getProductFromPOS,
    
}