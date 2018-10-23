var http = require('http');
var server = http.createServer();
var fs = require('fs');
// var gulp = require('gulp');
var ejs = require('ejs');
var qs = require('querystring');
var ConfigFile = require('config');
var template = fs.readFileSync(__dirname + '/ejs/index.ejs', 'utf-8');

server.on('request', function (req, res) {
    var url = req.url;

    // ルーティング
    if (url.indexOf('css') != -1) {
        renderSRC(res, url, 'text/css');
    } else if (url.indexOf('js') != -1) {
        renderSRC(res, url, 'text/javascript');
    } else {
        // リクエストのURLがCSSでもJSでもない場合
        req.data = "";
        // フォームからのデータを受信
        req.on("readable", function () {
            // read()はnullが来る場合もあるので空文字にする
            req.data += req.read() || '';
        });
        req.on("end", function () {
            // パースすると、formから入力された値をquery.nameのように使えるようになる
            var query = qs.parse(req.data);
            getWeatherInfo(query, res);
        });
    }
});

// サーバを待ち受け状態にする
// 第1引数: ポート番号
// 第2引数: IPアドレス
server.listen(3000);

// html以外のソースを受け渡す
function renderSRC(res, url, type) {
    fs.readFile(__dirname + url, function (err, data) {
        res.writeHead(200, { 'Content-Type': type });
        res.write(data)
        res.end();
    });
}

// 天気を取得して画面へ返却する
var units = ConfigFile.const.units;
var APIKEY = ConfigFile.config.apikey;
function getWeatherInfo(query, res) {
    var cityName = '';
    if (query.cityName == null) {
        cityName = 'Tokyo';
    } else {
        cityName = query.cityName;
    }
    var URL = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&units=' + units + '&appid=' + APIKEY;

    function callWeatherAPI(callback) {
        var weather = '';
        http.get(URL, function (res) {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('data', function (chunk) {
                weather = JSON.parse(body);
                // console.log(weather);
                callback(weather);
            });
        }).on('error', function (e) {
            callback(null);
        });
    }

    callWeatherAPI(function (weather) {
        var data = ejs.render(template, {
            weather: weather,
            cityName: cityName
        });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        res.end();
    })
};


// ps aux | grep node
// kill -9 <PROCESS_ID>