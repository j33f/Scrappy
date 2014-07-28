var express = require('express');
var router = express.Router();
var scrap = require('scrap');
var b64encode = require('base64').encode;
var utf8 = require('utf8');

function isUtf8( text ){
    var utfCount = 0;
    for (var n = 0; n < text.length; n++) {
        var c = text.charCodeAt(n);
        if ((c > 127) && (c < 2048)) {
            utfCount ++;
            break;
            console.log(" utf-8 character" );
        }
    }

    if ( utfCount > 0 )
        return true;
    return false;
}

router.post('/', function(req, res) {
	var url = req.param('url');
	scrap(url, function(err, $, code, html) {
		if (err) {
			res.send(500,err);
		} else {
			if (!isUtf8(html)) html = utf8.decode(html);
		  res.render('examine', {host: req.protocol + '://' + req.get('host'), url: url, history: '[]', html: b64encode(html)});
		}
	});
});
router.post('/follow', function(req, res) {
	res.render('examine', {host: req.protocol + '://' + req.get('host'), url: req.param('url'), history: JSON.stringify(req.param('history'))});
});
module.exports = router