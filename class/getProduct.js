const XLSX = require('xlsx')
const getProductFromCSV = async () => {
    const workbook = XLSX.readFile('./cityhive.xlsx');
    const worksheet = workbook.Sheets['Sheet1'];
    const data = XLSX.utils.sheet_to_json(worksheet);

    return data;
}

module.exports = {
    getProductFromCSV,
    
}