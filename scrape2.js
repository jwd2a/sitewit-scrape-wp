var Nightmare = require('nightmare');
var nightmare = Nightmare({show: false});
var async = require('async');
var fs = require('fs');
var striptags = require('striptags');

var searchTerm = process.argv[2].replace(' ', '+');
console.log(searchTerm);

var getTitle = function(node) {
  return node.querySelector('.entry-title > a').innerHTML;
}

var completedResults = 'Plugin\tDescription\tLink\tInstalls\n';

nightmare
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
              return {
                title: node.querySelector('.entry-title > a').innerHTML,
                description: node.querySelector('.entry-excerpt > p').innerHTML,
                link: node.querySelector('.entry-title > a').href,
                count: node.querySelector('.active-installs').innerText.split("+")[0]
              }
            } catch(e) {
              return {}
            }
          });
        })
        .then(function(results){ 
          results.forEach(function(item){
            /* Ignore super low installs */
            if (item.count && item.count.substring(1,2) != 'F') {
              completedResults += item.title + "\t" + cleanText(item.description) + "\t" + item.link + "\t" + item.count + "\n";
            }
          });
          cb(null, results);
        });
    }, function(){
      fs.writeFile(searchTerm.replace("+", "-") + '.txt', completedResults, function() {
        console.log('ALL DONE BUCKO!');
      });
    });
  });

function cleanText(text) {
  text = striptags(text);
  text = text.replace(/[^a-zA-Z0-9_ ]/g, "");
  return text;
}
