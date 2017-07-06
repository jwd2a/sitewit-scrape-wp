var Nightmare = require('nightmare');
var nightmare = Nightmare({show: true});

var getTitle = function(node) {
  return node.querySelector('.entry-title > a').innerHTML;
}

nightmare
  .goto('https://wordpress.org/plugins/search/appointment/page/1')
  .wait('.entry-title > a')
  .evaluate(function() {
    return Array.from(document.querySelectorAll('.plugin-card')).map(function(node){
      return {
        title: node.querySelector('.entry-title > a').innerHTML,
        count: node.querySelector('.active-installs').innerText.split("+")[0]
      }
    });
  })
  .end()
  .then(function(result) {
    console.log(result);
  })
  .catch(function(error) {
    console.log('Error', error);
  });



