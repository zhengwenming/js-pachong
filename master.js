const cluster = require('cluster');//多进程之 cluster 模块
const cpuNums = require('os').cpus().length;

cluster.setupMaster({
    exec: './worker.js',
    args: ['--use', 'http']
});

console.log(`一共开启${cpuNums}个子进程来进行爬取`);
console.log('爬取数据是乱序的，因此给爬取的数据增加movieIndex字段\n');

let pageNum = 10;//希望爬取数据的总页数，修改这个值，然后执行npm run start命令就得到output.json
const startTime = Date.now();

for (let i = 0; i < cpuNums; ++i) {
    let work = cluster.fork();

    // 抓取豆瓣前 10 页日本动画数据
    work.send([i , cpuNums, pageNum]);

    work.on('message' , (msg) => {
        console.log(msg);

        pageNum--;
        if (pageNum === 0) {
            console.log(`\n已完成所有爬取， using ${Date.now() - startTime} ms\n`);
            console.log('接下来关闭各子进程:\n');
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






