const cluster = require('cluster');//多进程之 cluster 模块
const cpuNums = require('os').cpus().length;
var XLSX = require("xlsx");//Excel文件表格处理模块

cluster.setupMaster({
    exec: './worker.js',
    args: ['--use', 'http']
});

console.log(`一共开启${cpuNums}个子进程来进行爬取`);
console.log('爬取数据是乱序的，因此给爬取的数据增加index字段\n');

let pageNum = 10;//希望爬取数据的总页数，修改这个值，然后执行npm run start命令就得到output.json
const startTime = Date.now();
const dataList = [];
let headerArray = ['供应商名称','联系人','联系电话','所在地区'];//表头(列)
for (let i = 0; i < cpuNums; ++i) {
    let work = cluster.fork();//fork方法创建工作进程，创建的子进程独立运行，并可以通过IPC通道与主进程通信

    //每个work子进程开启工作，开始抓取网络数据
    work.send([i , cpuNums, pageNum]);

    work.on('message' , (message) => {
        // 排序, 根据 index 将抓取到的数据放入正确的队列索引位置
        const { data, index } = JSON.parse(message);
        dataList[index-1] = data; 
        console.log('排序后的数据长度为:', dataList.length);

        pageNum--;

        if (pageNum === 0) {
            console.log(`\n已完成所有爬取， using ${Date.now() - startTime} ms\n`);
            console.log('接下来关闭各子进程:\n');
            // 导出汇总后的数据，即dataLis中所有数据导入到Excel
            let workbookArray = [];
            workbookArray.push(headerArray);//先放表头row
            dataList.forEach(item=>{
                item.forEach(company => {
                    workbookArray.push([company.companyName,company.companyBoss,company.companyPhone,company.companyAddress])
                });
            })
            //数据导出到Excel
            convertoExcel(workbookArray);//转为excel，导入到本地
            cluster.disconnect();
        }
    });
}

cluster.on('fork', (worker) => {
    console.log(`[master] : fork worker ${worker.id}\n`);
});

cluster.on('exit', (worker,code, signal) => {
    console.log(`[master] : 子进程 ${worker.id} 被关闭`);
});

//导出数据到Excel
function convertoExcel(data){
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `data.xlsx`)
}



