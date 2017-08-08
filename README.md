#<h1>node.jsCreeper</h1> <h2>个nodejs的网络爬虫</h2>
<p>主要使用的request和cheerio模块进行爬取和处理。</p>
<p>其中目标网站为http://www.vipreading.com 和 http://www.jjxsw.com</p>
<p>爬取的资源URL存储在mongodb数据库中，然后txt文件存在当地resource文件夹中</p>
<p><strong>一个小难点:</strong>用iconv-lite莫款进行GBK到UTF-8的转换</p>
