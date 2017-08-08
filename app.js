var express = require('express');
var mongoose = require('mongoose');
var iconv = require('iconv-lite');//用于GB2312的解码
var app = express();
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
// var routes = require('./routes/index');
var NovelsData = require('./models/novelsData.js');



//链接数据库
mongoose.connect('mongodb://localhost:27017/db');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('open', function() {
  console.log('MongoDB Connection Successed');
})

Classics();
Novel();
var classics = setInterval(Classics,86400);
var novel = setInterval(Novel,86400);


function Classics() {
    console.log('classics')
    //要爬取的经典网站
    var website = 'http://www.vipreading.com';
    request({encoding:null,uri:website}, function(error, response, body) {  // request 默认编码是utf8，此处用encoding：null来告诉request不要解析代码
        if(!error && response.statusCode == 200) {
            var parentbody = iconv.decode(body,'gbk')
            // console.log(parentbody);
            $ = cheerio.load(parentbody);
            //根据网站的第一层结构，决定爬取的Dom结构
            $('.sub a').each(function(err, data) {
                var articleHref = website + data.attribs.href;
                var articleTitle = $(this).text(); //这里必须是跟在$后面才可以使用text()方法
                console.log(articleTitle);
                console.log(articleHref)
                NovelsData.findOne({"novelTitle":articleTitle}, function(err, novel) {
                    if (novel) {
                        console.log(`数据库中已经有${articleTitle}`); //如果已经有这个小说，返回
                    } else {
                        //如果没有这部小说，继续
                        //爬取网站的第二层结构
                        request({encoding:null,uri:articleHref}, function(error, response, childBody) {
                            if(!error && response.statusCode == 200) {
                                var childrenbody = iconv.decode(childBody,'gbk')
                                $child = cheerio.load(childrenbody);
                                if(articleTitle && $child('.buttons.clearfix a').attr('href')) { //这里需要判断文章的标题和文章的连接都不为空
                                    //分析网站的第二层结构，决定爬取的DOM结构
                                    var articleDownLoadAddress = website + '/' + $child('.buttons.clearfix a').attr('href');
                                    console.log('articleDownLoadAddress:'+ articleDownLoadAddress);
                                    console.log('articleTitle:' + articleTitle);
                                    //存储各种时间格式， 方便以后扩展
                                    var date = new Date();
                                    var time = {
                                        date: date,
                                        year: date.getFullYear(),
                                        month: date.getFullYear() + "-" + (date.getMonth() + 1),
                                        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                                        minute: date.getFullYear() + "-"+ (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
                                    }
                                    var newNovel = new NovelsData({
                                        novelTitle:articleTitle,
                                        novelDownloadAddress:articleDownLoadAddress,
                                        time:time,
                                    })
                                    NovelsData.create(newNovel,function (err, novel) {
                                        if (err) {
                                            return err;
                                        }
                                        console.log(`《${articleTitle}》刚刚存入数据库...`)
                                    });
                                    var articlePath = path.join(__dirname, 'resource', articleTitle + '.txt'); //定义存储的文件的绝对位置和文件名称
                                    request(articleDownLoadAddress).on('error', function() {console.log(error)}).pipe(fs.createWriteStream(articlePath)).on('error', function() {console.log(error)}).on('end', function () {
                                        console.log(`《${articleTitle}》已经存入本地文件夹中...`)
                                    });
                                }
                            }
                        })
                    }
                })
            })
            $('.bd h5 a').each(function(err, data) {
                var articleHref = website + data.attribs.href;
                var articleTitle = $(this).text(); //这里必须是跟在$后面才可以使用text()方法
                console.log(articleTitle);
                console.log(articleHref)
                NovelsData.findOne({"novelTitle":articleTitle}, function(err, novel) {
                    if (novel) {
                        console.log(`数据库中已经有${articleTitle}`); //如果已经有这个小说，返回
                    } else {
                        //如果没有这部小说，继续
                        //爬取网站的第二层结构
                        request({encoding:null,uri:articleHref}, function(error, response, childBody) {
                            if(!error && response.statusCode == 200) {
                                var childrenbody = iconv.decode(childBody,'gbk')
                                $child = cheerio.load(childrenbody);
                                if(articleTitle && $child('.buttons.clearfix a').attr('href')) { //这里需要判断文章的标题和文章的连接都不为空
                                    //分析网站的第二层结构，决定爬取的DOM结构
                                    var articleDownLoadAddress = website +  '/' + $child('.buttons.clearfix a').attr('href');
                                    console.log('articleDownLoadAddress:'+ articleDownLoadAddress);
                                    console.log('articleTitle:' + articleTitle);
                                    //存储各种时间格式， 方便以后扩展
                                    var date = new Date();
                                    var time = {
                                        date: date,
                                        year: date.getFullYear(),
                                        month: date.getFullYear() + "-" + (date.getMonth() + 1),
                                        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                                        minute: date.getFullYear() + "-"+ (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
                                    }
                                    var newNovel = new NovelsData({
                                        novelTitle:articleTitle,
                                        novelDownloadAddress:articleDownLoadAddress,
                                        time:time,
                                    })
                                    NovelsData.create(newNovel,function (err, novel) {
                                        if (err) {
                                            return err;
                                        }
                                        console.log(`《${articleTitle}》刚刚存入数据库...`)
                                    });
                                    var articlePath = path.join(__dirname, 'resource', articleTitle + '.txt'); //定义存储的文件的绝对位置和文件名称
                                    request(articleDownLoadAddress).on('error', function() {console.log(error)}).pipe(fs.createWriteStream(articlePath)).on('error', function() {console.log(error)}).on('end', function () {
                                        console.log(`《${articleTitle}》已经存入本地文件夹中...`)
                                    });
                                }

                            }
                        })
                    }
                })
            })
            $('.bd li a').each(function(err, data) {
                var articleHref = website + data.attribs.href;
                var articleTitle = $(this).text(); //这里必须是跟在$后面才可以使用text()方法
                console.log(articleTitle);
                console.log(articleHref)
                NovelsData.findOne({"novelTitle":articleTitle}, function(err, novel) {
                    if (novel) {
                        console.log(`数据库中已经有${articleTitle}`); //如果已经有这个小说，返回
                    } else {
                        //如果没有这部小说，继续
                        //爬取网站的第二层结构
                        request({encoding:null,uri:articleHref}, function(error, response, childBody) {
                            if(!error && response.statusCode == 200) {
                                var childrenbody = iconv.decode(childBody,'gbk')
                                $child = cheerio.load(childrenbody);
                                if(articleTitle && $child('.buttons.clearfix a').attr('href')) { //这里需要判断文章的标题和文章的连接都不为空
                                    //分析网站的第二层结构，决定爬取的DOM结构
                                    var articleDownLoadAddress = website +  '/' + $child('.buttons.clearfix a').attr('href');
                                    console.log('articleDownLoadAddress:'+ articleDownLoadAddress);
                                    console.log('articleTitle:' + articleTitle);
                                    //存储各种时间格式， 方便以后扩展
                                    var date = new Date();
                                    var time = {
                                        date: date,
                                        year: date.getFullYear(),
                                        month: date.getFullYear() + "-" + (date.getMonth() + 1),
                                        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                                        minute: date.getFullYear() + "-"+ (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
                                    }
                                    var newNovel = new NovelsData({
                                        novelTitle:articleTitle,
                                        novelDownloadAddress:articleDownLoadAddress,
                                        time:time,
                                    })
                                    NovelsData.create(newNovel,function (err, novel) {
                                        if (err) {
                                            return err;
                                        }
                                        console.log(`《${articleTitle}》刚刚存入数据库...`)
                                    });
                                    var articlePath = path.join(__dirname, 'resource', articleTitle + '.txt'); //定义存储的文件的绝对位置和文件名称
                                    request(articleDownLoadAddress).on('error', function() {console.log(error)}).pipe(fs.createWriteStream(articlePath)).on('error', function() {console.log(error)}).on('end', function () {
                                        console.log(`《${articleTitle}》已经存入本地文件夹中...`)
                                    });
                                }
                            }
                        })
                    }
                })
            })
            $('.home a').each(function(err, data) {
                var childhref = $(this).attr('href');
                if(childhref != '/') {
                    var childwebsite = website + childhref;
                    // console.log(childwebsite);
                    request({encoding:null,uri:childwebsite}, function(error, response, childBody) {
                        if(!error && response.statusCode == 200) {
                            var childrenbody = iconv.decode(childBody,'gbk')
                            $child = cheerio.load(childrenbody);
                            $child('.name .range a:first-child').each(function() {
                                var articleTitle = $(this).text(); //这里必须是跟在$后面才可以使用text()方法
                                var childrenhref = $child(this).attr('href');
                                var childrenwebsite = website + '/' + childrenhref;
                                console.log(childrenwebsite);
                                NovelsData.findOne({"novelTitle":articleTitle}, function(err, novel) {
                                    if (novel) {
                                        console.log(`数据库中已经有${articleTitle}`); //如果已经有这个小说，返回
                                    } else {
                                        //如果没有这部小说，继续
                                        //爬取网站的第二层结构
                                        request({encoding:null,uri:childrenwebsite}, function(error, response, greatchildrenBody) {
                                        if(!error && response.statusCode == 200) {
                                                $children = cheerio.load(greatchildrenBody);
                                                if(articleTitle && $child('.buttons.clearfix a').attr('href')) { //这里需要判断文章的标题和文章的连接都不为空
                                                    //分析网站的第二层结构，决定爬取的DOM结构
                                                    var articleDownLoadAddress = website +  '/' + $children('.buttons.clearfix a').attr('href');
                                                    console.log('articleDownLoadAddress:'+ articleDownLoadAddress);
                                                    console.log('articleTitle:' + articleTitle);
                                                    //存储各种时间格式， 方便以后扩展
                                                    var date = new Date();
                                                    var time = {
                                                        date: date,
                                                        year: date.getFullYear(),
                                                        month: date.getFullYear() + "-" + (date.getMonth() + 1),
                                                        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                                                        minute: date.getFullYear() + "-"+ (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
                                                    }
                                                    var newNovel = new NovelsData({
                                                        novelTitle:articleTitle,
                                                        novelDownloadAddress:articleDownLoadAddress,
                                                        time:time,
                                                    })
                                                    NovelsData.create(newNovel,function (err, novel) {
                                                        if (err) {
                                                            return err;
                                                        }
                                                        console.log(`《${articleTitle}》刚刚存入数据库...`)
                                                    });
                                                    var articlePath = path.join(__dirname, 'resource', articleTitle + '.txt'); //定义存储的文件的绝对位置和文件名称
                                                    request(articleDownLoadAddress).on('error', function() {console.log(error)}).pipe(fs.createWriteStream(articlePath)).on('error', function() {console.log(error)}).on('end', function () {
                                                        console.log(`《${articleTitle}》已经存入本地文件夹中...`)
                                                    });
                                                }

                                            }
                                        })
                                    }
                                })
                            })
                            $child('.storelistbottom a').each(function() {
                                var greatchildwebsite = website + '/' + $child(this).attr('href');
                                request({encoding:null,uri:greatchildwebsite}, function(error, response, greatchildBody) {
                                    if(!error && response.statusCode == 200) {
                                        var greatchildrenbody = iconv.decode(greatchildBody,'gbk')
                                        $children = cheerio.load(greatchildrenbody);
                                        $children('.name .range a:first-child').each(function() {
                                            var articleTitle = $(this).text(); //这里必须是跟在$后面才可以使用text()方法
                                            var childrenhref = $child(this).attr('href');
                                            var childrenwebsite = website + '/' + childrenhref;
                                            console.log(childrenwebsite);
                                            NovelsData.findOne({"novelTitle":articleTitle}, function(err, novel) {
                                                if (novel) {
                                                    console.log(`数据库中已经有${articleTitle}`); //如果已经有这个小说，返回
                                                } else {
                                                    //如果没有这部小说，继续
                                                    //爬取网站的第二层结构
                                                    request({encoding:null,uri:childrenwebsite}, function(error, response, greatchildrenBody) {
                                                        if(!error && response.statusCode == 200) {
                                                            $greatchildren = cheerio.load(greatchildrenBody);
                                                            if(articleTitle && $child('.buttons.clearfix a').attr('href')) { //这里需要判断文章的标题和文章的连接都不为空
                                                                //分析网站的第二层结构，决定爬取的DOM结构
                                                                var articleDownLoadAddress = website +  '/' + $greatchildren('.buttons.clearfix a').attr('href');
                                                                console.log('articleDownLoadAddress:'+ articleDownLoadAddress);
                                                                console.log('articleTitle:' + articleTitle);
                                                                //存储各种时间格式， 方便以后扩展
                                                                var date = new Date();
                                                                var time = {
                                                                    date: date,
                                                                    year: date.getFullYear(),
                                                                    month: date.getFullYear() + "-" + (date.getMonth() + 1),
                                                                    day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                                                                    minute: date.getFullYear() + "-"+ (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
                                                                }
                                                                var newNovel = new NovelsData({
                                                                    novelTitle:articleTitle,
                                                                    novelDownloadAddress:articleDownLoadAddress,
                                                                    time:time,
                                                                })
                                                                NovelsData.create(newNovel,function (err, novel) {
                                                                    if (err) {
                                                                        return err;
                                                                    }
                                                                    console.log(`《${articleTitle}》刚刚存入数据库...`)
                                                                });
                                                                var articlePath = path.join(__dirname, 'resource', articleTitle + '.txt'); //定义存储的文件的绝对位置和文件名称
                                                                request(articleDownLoadAddress).on('error', function() {console.log(error)}).pipe(fs.createWriteStream(articlePath)).on('error', function() {console.log(error)}).on('end', function () {
                                                                    console.log(`《${articleTitle}》已经存入本地文件夹中...`)
                                                                });
                                                            }

                                                        }
                                                    })
                                                }
                                            })
                                        })
                                        // $child('.storelistbottom a').each(function() {
                                        //     var greatchildwebsite = website + '/' + $child(this).attr('href');
                                            
                                        // })
                                    }
                                })
                            })
                        }
                    })
                }
            })
        }
    })
}
function Novel() {
    console.log('novel')
    //这是是要爬取的小说网站
    var website = 'http://www.jjxsw.com';
    request(website, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            $ = cheerio.load(body);
            //根据网站的第一层结构，决定爬取的Dom结构
            $('#main .iArticle li a').each(function(err, data) {
                var articleHref = website + data.attribs.href;
                var articleTitle = data.attribs.title;
                NovelsData.findOne({"novelTitle":articleTitle}, function(err, novel) {
                    if (novel) {
                        return; //如果已经有这个小说，返回
                    } else {
                        //如果没有这部小说，继续
                        //爬取网站的第二层结构
                        request(articleHref, function(error, response, childBody) {
                            if(!error && response.statusCode == 200) {
                                $child = cheerio.load(childBody);
                                //分析网站的第二层结构，决定爬取的DOM结构
                                $child('.downlistbox>.downAddress_li>a').each(function(err, childData) {
                                    var downLoadAddress = website + childData.attribs.href;
                                    //爬取网站的第三层结构
                                    request(downLoadAddress, function(error, response, childrenBody) {
                                        if(!error && response.statusCode == 200) {
                                            $children = cheerio.load(childrenBody);
                                            //根据网站的第三层结构，决定爬取的DOM结构
                                            var articleDownLoadAddress = $children('.strong.green')[3].attribs.href;
                                            console.log('articleDownLoadAddress:'+ articleDownLoadAddress);
                                            console.log('articleTitle:' + articleTitle);
                                            //存储各种时间格式， 方便以后扩展
                                            var date = new Date();
                                            var time = {
                                                date: date,
                                                year: date.getFullYear(),
                                                month: date.getFullYear() + "-" + (date.getMonth() + 1),
                                                day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                                                minute: date.getFullYear() + "-"+ (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
                                            }
                                            var newNovel = new NovelsData({
                                                novelTitle:articleTitle,
                                                novelDownloadAddress:articleDownLoadAddress,
                                                time:time,
                                            })
                                            NovelsData.create(newNovel,function (err, novel) {
                                                if (err) {
                                                    return err;
                                                }
                                                console.log(`《${articleTitle}》刚刚存入数据库...`)
                                            });
                                            var articlePath = path.join(__dirname, 'resource', articleTitle + '.txt'); //定义存储的文件的绝对位置和文件名称
                                            request(articleDownLoadAddress).on('error', function() {console.log(error)}).pipe(fs.createWriteStream(articlePath)).on('error', function() {console.log(error)}).on('end', function () {
                                                console.log(`《${articleTitle}》已经存入本地文件夹中...`)
                                            });
                                        }
                                    })
                                });
                            }
                        })
                    }
                })
            })
        }
    })
}

// app.get('/', function(req, res) {
//     console.log('try')

// });


var server = app.listen(3000, function() {
    console.log('listening at 3000');
})