const superagent = require('superagent');
const cheerio = require('cheerio')//jq--xpath
const fs = require('fs')//文件操作模块
var XLSX = require("xlsx");//Excel文件表格处理模块
const { log } = require('console');


const api = 'http://www.hebzfcgwssc.com/Mall/HeBei/gyssearch.aspx';
let tableData = [];//爬取的数据汇总到此数组
let headerArray = [];//表头数组


function convertoExcel(data){
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `data.xlsx`)
}


module.exports = (pageStart) => {
    return new Promise((resolve, reject) => {
        superagent.get(api).query({
                'page':pageStart,
            })
            .type('form')
            // .accept('application/json')
            .end((err, res) => {
                if (err) {
                    console.log('err'+err)
                    reject(err);
                }else {
                    console.log('res=',res);

                    let $ = cheerio.load(res.body);
                    $('tr').each(function (i,element) {
                        console.log('element=',i);
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
                            console.log(company);
                            console.log('tableData=',tableData);

                        }else{//表头，暂时写死
                                // $(this).find('td').each(function (index) {
                                //     headerArray.push($(this).text());
                                // });
                                // console.log('表头'+headerArray);
                                headerArray = ['供应商名称','联系人','联系电话','所在地区'];
                        }
                    });
                 }
                if(pageStart>=180){
                    console.log('请求完毕');
                    let workbookArray = [];
                    workbookArray.push(headerArray);//先放表头row
                    tableData.forEach(company => {
                        workbookArray.push([company.companyName,company.companyBoss,company.companyPhone,company.companyAddress])
                    });
                    //方式一:数据导出到Excel(建议)
                    convertoExcel(workbookArray);//转为excel，导入到本地
        
                    //方式二:数据写json文件到本地(不建议)
                    // fs.writeFile("output1.json", JSON.stringify({'data':tableData}), 'utf8', function (err) { 
                    //     if (err) { 
                    //         console.log("An error occured while writing JSON Object to File."); 
                    //         return console.log(err); 
                    //     } 
                     
                    //     console.log("JSON file has been saved."); 
                    //  });
        
                }else{
                    console.log('请求继续',pageStart);
                }


                // 加唯一id，保证多线程爬取数据的先后顺序可以确定
                // let resObj = JSON.parse(res.text);
                // resObj.subjects.forEach((item, index) => {
                //     resObj.subjects[index].movieIndex = pageStart + index;
                // });

                // 结果输出
                // console.log('resObj',resObj);

                resolve();
            })
    });
};
