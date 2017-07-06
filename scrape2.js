var Nightmare = require('nightmare');
var nightmare = Nightmare({show: true});

nightmare
  .goto('https://wordpress.org/plugins/search/appointment/page/1')
  .wait('.entry-title > a')
  .evaluate(function() {
    return Array.from(document.querySelectorAll('.entry-title > a')).map(element => element.innerHTML);
  })
  .end()
  .then(function(result) {
    console.log(result);
  })
  .catch(function(error) {
    console.log('Error', error);
  });
