var a = require('./')
var p=a()
p.objListeners['.'] = function(package) {console.log(package.name+': '+package.description)}
p.write(require('fs').readFileSync('./node_modules/clarinet/samples/npm.json', 'utf8'))
