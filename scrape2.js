var Nightmare = require('nightmare');
var nightmare = Nightmare({show: true});
var async = require('async');
var fs = require('fs');

var getTitle = function(node) {
  return node.querySelector('.entry-title > a').innerHTML;
}

var completedResults = 'Plugin\tInstalls\n';

nightmare
  .goto('https://wordpress.org/plugins/search/appointment/page/1')
  .evaluate(function() {
    return document.querySelector('.page-numbers.dots + a').innerText
  })
  .then(function(numPages){
    console.log('Found ' + numPages + ' pages');
    var urls = [];
    var results = [];
    for (var i = 1; i < numPages; i++) {
      urls.push('https://wordpress.org/plugins/search/appointment/page/' + i);
    }
    async.eachOfSeries(urls, function(url, i, cb) {
      console.log('Starting to iterate, to url: ', url);
      return nightmare
        .goto(url)  
        .wait('.entry-title > a')
        .evaluate(function() {
          return Array.from(document.querySelectorAll('.plugin-card')).map(function(node){
            return {
              title: node.querySelector('.entry-title > a').innerHTML,
              count: node.querySelector('.active-installs').innerText.split("+")[0]
            }
          });
        })
        .then(function(results){ 
          results.forEach(function(item){
            /* Ignore super low installs */
            if (item.count.substring(1,2) != 'F') {
              completedResults += item.title + "\t" + item.count + "\n";
            }
          });
          cb(null, results);
        });
    }, function(){
      fs.writeFile('appointment.txt', completedResults, function() {
        console.log('ALL DONE BUCKO!');
      });
    });
  });


