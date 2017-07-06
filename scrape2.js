var Nightmare = require('nightmare');
var nightmare = Nightmare({show: true});
var async = require('async');
var vo = require('vo');

var getTitle = function(node) {
  return node.querySelector('.entry-title > a').innerHTML;
}

/* Get the number of pages */

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
            var results = [];
            results.push({
              title: node.querySelector('.entry-title > a').innerHTML,
              count: node.querySelector('.active-installs').innerText.split("+")[0]
            });
            return results;
          });
        })
        .then(function(results){ 
          console.log(results);
          cb(null, results);
        });
    });
  });


