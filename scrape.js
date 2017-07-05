var phrase = 'contact form';
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
      page.evaluate(function(end) {
        console.log('Evaluating');
        var totalPages = $("span.page-numbers.dots + a").text();
        console.log(totalPages);
      });    
  });
});

