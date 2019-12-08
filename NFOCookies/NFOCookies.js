// ==UserScript==
// @name         NFOHump Cookie Fixer
// @namespace    http://nfohump.com/
// @version      1.0.4
// @description  Fixes NFOHump's bad cookie management.
// @author       Leo Natan
// @match        *://nfohump.com/forum/*
// @match        *://www.nfohump.com/forum/*
// @grant        none
// @position     1
// @noframes
// @downloadURL  https://raw.githubusercontent.com/LeoNatan/NFOHump/master/NFOCookies/NFOCookies.js
// @updateURL    https://raw.githubusercontent.com/LeoNatan/NFOHump/master/NFOCookies/NFOCookies.js
// @require      https://cdn.jsdelivr.net/npm/js-cookie@beta/dist/js.cookie.min.js
// ==/UserScript==

const _maxAllowed = 95;

const forum_t = Cookies.get('forum_t');
let forum_f_all = Cookies.get('forum_f_all');
const outer = /a:(\d+):\{(.*)\}/g;
let matches = outer.exec(forum_t);
let pairCount = 0;
if(matches != null)
{
     pairCount = matches[1];
}

const dateOptions = { dateStyle: 'short', timeStyle: 'short', hour12: false, };

$('#leftdiv > div.menuLeftContainer:first > ul > li:first > a').html(pairCount + "<br />" + (new Date(forum_f_all * 1000)).toLocaleString(
   'en-UK', dateOptions));
$('a[href="index.php?mark=forums"]').click(() => {
    let reset = confirm("Do you want to mark all forums as read?");
    if(reset)
    {
        limitReadCount(pairCount, 0, false);
    }
    return reset;
});

function limitReadCount(currentCount, maxAllowed, resetAllCookie)
{
    if(currentCount <= maxAllowed)
    {
        return;
    }

    const pairsStr = matches[2];

    const splitter = /(i:(\d*);i:(\d*);)/g;
    matches = pairsStr.matchAll(splitter);

    let pairs = [];
    for(const match of matches)
    {
        pairs.push({post: match[2], timestamp: match[3]});
    }

    pairs.sort((a, b) => { return a.timestamp > b.timestamp ? 1 : -1 });
    pairs = pairs.slice(-maxAllowed);

    const serialized = pairs.map(a => "i:" + a.post + ";i:" + a.timestamp).join(';') + ';';
    const forCookie = "a:" + pairs.length + ":{" + serialized + "}";

    var cookieSetter = Cookies.withConverter({
        write: function (value, name) {
            return escape(value);
        }
    })
    cookieSetter.set('forum_t', forCookie, {path: '/forum', domain: '.nfohump.com'});
    if(resetAllCookie)
    {
        Cookies.set('forum_f_all', pairs[0].timestamp, {path: '/forum', domain: '.nfohump.com'});
    }

    $('#leftdiv > div.menuLeftContainer:first > ul > li:first > a').html(pairs.length + "<br />" + (new Date(pairs[0].timestamp * 1000)).toLocaleString(
   'en-UK', dateOptions));
}

limitReadCount(pairCount, _maxAllowed, true);