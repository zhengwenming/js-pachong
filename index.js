const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
var XLSX = require("xlsx");
let tableData = [];
let headerArray = [];

let count  = 10;//希望爬取数据的总页数，修改这个值，然后执行node index命令就得到output.json
let page =  1;//从第几页开始爬


init(page,count);
 function init(index,c){
        console.log('页',index);
        getDataByPage();
}

function convertoExcel(data){
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, `demo1.xlsx`)
}

 function getDataByPage () {
   request(`http://www.hebzfcgwssc.com/Mall/HeBei/gyssearch.aspx?page=${page}&gysname=`, (err, res) => {
        if (err) {
            console.log(err.code);
        }else {
            let $ = cheerio.load(res.body);
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
                    // console.log(company);
                }else{//表头
                        // $(this).find('td').each(function (index) {
                        //     headerArray.push($(this).text());
                        // });
                        // console.log('表头'+headerArray);
                        headerArray = ['供应商名称','联系人','联系电话','所在地区'];
                }
            });
         }
        if(page>=count){
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
            page++
            init(page,count);
            console.log('请求继续',page);
        }
    })
}


