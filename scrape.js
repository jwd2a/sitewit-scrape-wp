var phrase = 'appointment';
phrase = phrase.replace(/ /, '+');

var page = require('webpage').create();
console.log('Opening the page...');

page.onConsoleMessage = function(msg) {
  console.log(msg);
}

page.open('http://wordpress.org/plugins/search/' + phrase, function(status) {
    if (status == 'success') {
      console.log('Got the page');
    } else {
      console.log('Error getting the page', status);
    }
  page.includeJs('https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
      console.log('jQuery included, querying');
      var pages = page.evaluate(function() {
        var totalPages = $("span.page-numbers.dots + a").text();
        return totalPages;
      });    
      getPluginPages(phrase, pages);
  });
});

function getPluginPages(phrase, numberOfPages) {
  console.log('Get all the pages (' + numberOfPages + ') for the phrase', phrase);
  var page = require('webpage').create();

  page.onConsoleMessage = function(msg) { console.log(msg) }

  page.open('http://wordpress.org/plugins/search' + phrase + '/page/1', function(status) {
    page.includeJs('https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
      setTimeout(function(){
        getPlugins();
      }, 5000);
    }); 
  });

  function getPlugins() {
    var plugins = page.evaluate(function() {
      var titles = [];
      var pluginTiles = $("h2.entry-title > a");
      //$("h2.entry-title > a").forEach(function(title) {
      //titles.push(title.text());
      //});
      console.log(pluginTiles.length); 
    });    
  }

  //for (var i = 1; i < +numberOfPages; i++) {
    //var pageAddress = 'http://wordpress.org/plugins/search/' + phrase + '/page/' + i;
    //console.log('Opening page', pageAddress);
    //page.open(pageAddress, function(status) {
      //if (status == 'success') {
        ////page.includeJs('https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
          ////page.evaluate(function() {
            ////$("h2.entry-title > a").forEach(function(title) {
              ////console.log(title.text());
            ////});
          ////});    
        ////}); 
        //console.log('Opened page', i);
      //} else {
        //console.log('Unable to open page', pageAddress);
      //}
    //});
  //}
}
