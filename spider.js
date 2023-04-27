const superagent = require('superagent');//导入网络请求模块
const cheerio = require('cheerio')//jq--xpath



const api = 'http://www.hebzfcgwssc.com/Mall/HeBei/gyssearch.aspx';
let tableData = [];//爬取每页的数据汇总到此数组，单次网络请求的汇总

module.exports = (pageStart) => {
    return new Promise((resolve, reject) => {
        superagent.get(api).query({'page':pageStart})
            .type('form').accept('application/html')
            .end((err, res) => {
                if (err) {
                    console.log('err'+err)
                    reject(err);
                }else {
                    let $ = cheerio.load(res.text);
                    $('tr').each(function (i,element) {
                        if(i){//body
                            let company = {"companyName":"","companyBoss":"","companyPhone":"","companyAddress":""};
                            let companyName = $(this).find('.gys-img-tt').text().trim();
                            let companyBoss = $(this).children("td").first().next().text().trim();
                            let companyPhone = $(this).find('.gys-pl30').text().trim();
                            let companyAddress = $(this).children("td").last().text().trim();
            
                            companyName.replace(/[^\u4e00-\u9fa5]/gi,"");//正则取中文
                            company.companyName = companyName;
                            company.companyBoss = companyBoss;
                            company.companyPhone = companyPhone;
                            company.companyAddress = companyAddress;
                            tableData.push(company);
                        }
                    });
                 }
                resolve(tableData);
            })
    });
};
