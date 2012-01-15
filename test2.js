var p = require('./')()
  , fs = require('fs')
  , has = Function.prototype.call.bind(Object.prototype.hasOwnProperty)

var authors = {}
p.objListeners['.'] = function(package) {
  var author = package.author
  if (!author) return
  author = (author.name || author) + ''
  if (has(authors, author)) {
    authors[author]++
  } else {
    authors[author] = 1
  }
}
var reader = fs.createReadStream(__dirname + '/node_modules/clarinet/samples/npm.json', {encoding: 'utf8'})
reader.on('data', p.write.bind(p))
reader.on('end', function() {
  console.log('got '+Object.keys(authors).length)
  var sorted = []
    , i
    ;
  for (var a in authors)
    sorted.push([a, authors[a]]);
  sorted.sort(function(a, b) { return a[1] - b[1]; });
  i = sorted.length-1;
  while(i!==-1) {
    console.log(sorted.length-i, sorted[i]);
    i--;
  }
})
