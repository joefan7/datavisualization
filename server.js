var express = require('express');
var app = express();

app.use(express.static('./public'));

app.get('/', function(req, res){
    res.sendFile('./html/index.html', {root:'./public'});
});

app.get('/best', function(req, res){
    res.sendFile('./html/best.html', {root:'./public'});
});

app.listen(8080);