// Azurea Image Preview
// By @RyuaNerin

// AZSaveImage
// By - @Lolicon_sagi
// Last Update : 2015-02-18

// 이미지를 내려받고싶은 트윗을 선택하고 Ctrl + S

var supportedSuffixes = ['.png', '.jpg', '.gif'];
String.prototype.endsWith = function (suffix) {
	var sub = this.length - suffix.length;
	return (sub >= 0) && (this.lastIndexOf(suffix) === sub);
};

var regex = /"media_url":"([^"]+)"/g;
// Array getUrlFromTwitter(var)
function getUrlFromTwitter(id) {
	var res = [];
	var call = TwitterService.call('/statuses/show.json?id=' + id + '&include_entities=true');

	var f = call.lastIndexOf("extended_entities");
	if (f >= 0)
		call = call.substr(f);

	while (ms = regex.exec(call))
		res.push(ms[1].replace(/\\/g, "") + ":orig");

	return res;
}

// Array getUrl(string)
function getUrl(url) {
	var res = [];

	if (url.match("status/([0-9]+)/photo/1"))
		res.push(getUrlFromTwitter(RegExp.$1));

	else if (url.indexOf('twitter.com') > -1) {
		if (url.match("/([0-9]+)/photo/1"))
			res.push(getUrlFromTwitter(RegExp.$1));
	}

	else if (url.match("p.twipple.jp/(.+)"))
		res.push('http://p.twpl.jp/show/orig/' + RegExp.$1);

	else if (url.match("lockerz.com/s/(.+)"))
		res.push('http://api.plixi.com/api/tpapi.svc/imagefromurl?url=http://plixi.com/p/' + RegExp.$1 + "&size=big");

	else if (url.match("twitrpix.com/(.+)"))
		res.push('http://img.twitrpix.com/' + RegExp.$1);

	else if (url.match("img.ly/(.+)"))
		res.push('http://img.ly/show/full/' + RegExp.$1);

	else if (url.match("pikchur.com/(.+)"))
		res.push('http://img.pikchur.com/pic_' + RegExp.$1 + '_l.jpg');

	else if (url.match("pk.gd/(.+)"))
		res.push('http://img.pikchur.com/pic_' + RegExp.$1 + '_l.jpg');

	else if (url.indexOf('grab.by') > -1) {
		if (Http.downloadString(url).match("<img id=\"thegrab\" src=\"([^\"]+)\""))
			res.push(RegExp.$1);
	}

	else if (url.match("via.me/-(.+)")) {
		if (Http.downloadString("https://api.via.me/v1/posts/" + RegExp.$1 + "?client_id=6aw0nyfokllplyk2dvubk6r3r").match('"media_url":[ ]*"([^"]+)"'))
			res.push(RegExp.$1);
	}

	else if (url.match("puu.sh/[a-zA-Z0-9]+"))
		res.push(url);

	else if (url.match("pckles.com/.*?"))
		res.push(url);

	else if (url.match("twitpic.com/([a-zA-z0-9]*)"))
		res.push("http://www.twitpic.com/show/full/" + RegExp.$1);

	else {
		for (var i = 0; i < supportedSuffixes.length; ++i) {
			if (url.endsWith(supportedSuffixes[i])) {
				res.push(url);
				break;
			}
		}

		url = System.getPreviewUrl(url);
		if (url != null && url.length > 0)
			res.push(url);
	}

	return res;
}

System.addKeyBindingHandler('V'.charCodeAt(0), 1,
	function (id) {
		var status = TwitterService.status.get(id);
		if (!status) return;

		var urls = [], i = -1;
		TwitterService.status.getUrls(id, urls);

		while (urls[++i]) {
			var url = urls[i];
			var urlNew = null;

			if (url.indexOf('pic.twitter.com') > -1) {
				urlNew = getUrlFromTwitter(status.id);
				url = "https://twitter.com/" + status.user.screen_name + "/status/" + status.id;
			}
			else
				urlNew = getUrl(url);


			if (urlNew != null && urlNew.length > 0)
				for (var i = 0; i < urlNew.length; i++)
					System.openPreview(url, urlNew[i]);
		}
	}
);

System.addKeyBindingHandler('S'.charCodeAt(0), 2,
	function (id) {
		var status = TwitterService.status.get(id);
		if (!status) return;

		var urls = [], i = -1;
		TwitterService.status.getUrls(id, urls);

		var urlsNew = [];
		while (urls[++i])
			if (urls[i].indexOf('pic.twitter.com') > -1)
				urlsNew.push(getUrlFromTwitter(status.id));
			else
				urlsNew.push(getUrl(urls[i]));

		var args = urlsNew.join(" ");

		System.launchApplication('AZSaveImage.exe', args, 0);
	});

System.addKeyBindingHandler('W'.charCodeAt(0), 1,
	function openbrowser(id) {
		var urls = [], i = -1;
		TwitterService.status.getUrls(id, urls);
		while (urls[++i])
			System.openUrl(urls[i]);
	});