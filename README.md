# js-pachong
简单实现js爬虫的小项目

前提node环境，安装node。本人node版本v14.0.0
# 步骤一
npm install

# 步骤二
1、使用递归调用的方式

npm run index

递归调用，效率低，好理解

2、使用nodejs的cluster模块开启多进程处理数据，充分利用处理器多核优势

npm run start

开启多线程多进程请求处理数据，效率高
