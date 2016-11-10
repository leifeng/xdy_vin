'use strict'
const fs = require('fs');
const async = require('async');
const XLSX = require('xlsx');
const request = require('request');
const json2xls = require('json2xls');
const key = '百度key'
var data = {};
var NewData = {};
var index = 0;
var CALLBACK = null;
var SheetName = '';

fs.exists('./output', function (exists) {
    if (!exists) {
        fs.mkdirSync('./output');
    }
});
let files = fs.readdirSync('./xls/');
files = files.filter(function (item, i) {
    return item.indexOf('xls') > 0
})
async.eachSeries(files, function (filesName, cb) {
    console.log('*********************开始' + filesName + '文件*********************')
    index = 0;
    let workbook = XLSX.readFile('./xls/' + filesName);
    workbook.SheetNames.forEach(function (sheetName) {
        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if (roa.length > 0) {
            console.log('有数据');
            NewData = Object.assign({}, roa)
        }
    });

    async.mapSeries(NewData, function (data, callback) {
        CALLBACK = callback;
        getData(data)
    }, function (err, results) {
        console.log('错误: ', err);
        console.log('结果: ', results);
        save(cb, filesName);
    });

}, function (err) {
    console.log('@@@@@所有文件完成@@@@@@');
});

function getData(item) {

    request('http://api.map.baidu.com/geocoder/v2/?ak=' + key + '&callback=renderReverse&location=' + item['LATITUDE'] + ',' + item['LONGITUDE'] + '&output=json&pois=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('处理完成: ' + item.CAR_CODE);
            eval(body)
        } else {
            NewData[index]['POSITION'] = "";
            NewData[index]['province'] = "";
            NewData[index]['city'] = "";
            NewData[index]['district'] = "";
            index++;
        }

    });
}


function renderReverse(json) {
    if (json.status == '0') {
        console.log(json.result.formatted_address)
        NewData[index]['POSITION'] = json.result.formatted_address;
        NewData[index]['province'] = json.result.addressComponent.province;
        NewData[index]['city'] = json.result.addressComponent.city;
        NewData[index]['district'] = json.result.addressComponent.district;
        index++;
        CALLBACK(null, index);
    }
}

function save(callback, fileName) {
    var json = [];
    for (let x = 0; x < Object.keys(NewData).length; x++) {
        json.push(NewData[x])
    }
    var xls = json2xls(json);
    fs.writeFile('./output/' + fileName, xls, 'binary', function (err) {
        if (err) throw err;
        console.log('保存完成')
        callback(null);
    });
}



