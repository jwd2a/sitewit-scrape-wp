var Nightmare = require('nightmare');
var nightmare = Nightmare({show: false});
var async = require('async');
var fs = require('fs');
var striptags = require('striptags');
var stats = require('stats-lite');
var excel = require('exceljs');

var searchTerm = process.argv[process.argv.indexOf('-q') + 1].replace(/ /g, '+');
console.log(searchTerm);

var getTitle = function(node) {
  return node.querySelector('.entry-title > a').innerHTML;
}

var completedResults = '';
var counts = [];

nightmare
  .on('console', (log, msg) => {
    console.log(msg);
  })
  .goto('https://wordpress.org/plugins/search/' + searchTerm +'/page/1')
  .evaluate(function() {
    return document.querySelector('.page-numbers.dots + a').innerText
  })
  .then(function(numPages){
    console.log('Found ' + numPages + ' pages');
    var urls = [];
    var results = [];
    for (var i = 1; i < numPages; i++) {
      urls.push('https://wordpress.org/plugins/search/'+ searchTerm +'/page/' + i);
    }
    async.eachOfSeries(urls, function(url, i, cb) {
      console.log('Starting to iterate, to url: ', url);
      return nightmare
        .goto(url)  
        .wait('.entry-title > a')
        .evaluate(function() {
          return Array.from(document.querySelectorAll('.plugin-card')).map(function(node){
            try {
              var installs = node.querySelector('.active-installs').innerText;
              if (installs.search('million') != -1) {
                count = parseInt(installs.split('+')[0]) * 1000000;
              } else {
                count = parseInt(installs.split('+')[0].replace(',',''));
              }

              return {
                title: node.querySelector('.entry-title > a').innerHTML,
                description: node.querySelector('.entry-excerpt > p').innerHTML,
                link: node.querySelector('.entry-title > a').href,
                count: count
              }
            } catch(e) {
              return {}
            }
          });
        })
        .then(function(results){ 
          results.forEach(function(item){
            /* Ignore super low installs */
            if (item.count != 'NaN') {
              completedResults += item.title + "\t" + cleanText(item.description) + "\t" + item.link + "\t" + item.count + "\n";
              counts.push(item.count);
            }
          });
          cb(null, results);
        });
    }, function(){
      fs.writeFile(searchTerm.replace("+", "-") + '.txt', completedResults, function() {
        console.log('ALL DONE BUCKO!');
        buildWorksheet();
      });
    });
  });

function cleanText(text) {
  text = striptags(text);
  text = text.replace(/[^a-zA-Z0-9_ ]/g, "");
  return text;
}

function getWorksheet(callback){
  var workbook = new excel.Workbook();
  if (!fs.existsSync('plugins.xlsx')) {
    workbook = new excel.Workbook();
    callback(workbook);
  } else {
    workbook.xlsx.readFile('plugins.xlsx')
      .then(function() {
        callback(workbook);
      });
  }
}

function buildWorksheet() {
  var stdDev = stats.stdev(counts);
  var mean = stats.mean(counts);
  getWorksheet(function(workbook) {
    var worksheet = workbook.addWorksheet(searchTerm);
    worksheet.columns = [
      { header: 'Plugin', width: 70},
      { header: 'Description', width: 130},
      { header: 'Link', width: 50},
      { header: 'Installs', width: 10}
    ];
    fs.readFile(searchTerm.replace('+', '-') + '.txt', 'utf8', function(err, file) {
      var items = file.split('\n');
      items.forEach(function(item) {
        var i = item.split('\t');
        if (i[3]) {
          i[3] = parseInt(i[3].replace(',',''));
        }
        var row = worksheet.addRow([i[0], i[1], i[2], i[3]]);
        try {
          if (i[3] > (stdDev + mean)) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor:{argb:'5900FF00'}
            }
          }
        } catch(e) {}
      });
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC2C2C2' }
      }
      worksheet.getRow(1).font = {
        bold: true
      }
      worksheet.getColumn('A').font = {
        bold: true
      }
      workbook.xlsx.writeFile('./plugins.xlsx')
        .then(function() {
          console.log("Done!");
        });
    });
  });
}
