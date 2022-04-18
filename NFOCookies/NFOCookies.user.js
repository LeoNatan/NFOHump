// ==UserScript==
// @name         NFOHump Cookie Fixer
// @namespace    http://nfohump.com/
// @version      1.0.11
// @description  Fixes NFOHump's bad cookie management.
// @author       Leo Natan
// @match        *://nfohump.com/forum/*
// @match        *://www.nfohump.com/forum/*
// @grant        none
// @position     1
// @noframes
// @downloadURL  https://raw.githubusercontent.com/LeoNatan/NFOHump/master/NFOCookies/NFOCookies.user.js
// @updateURL    https://raw.githubusercontent.com/LeoNatan/NFOHump/master/NFOCookies/NFOCookies.user.js
// @require      https://cdn.jsdelivr.net/npm/js-cookie@beta/dist/js.cookie.min.js
// @run-at document-end
// ==/UserScript==

if(window.$ == undefined) {
    return;
}

const _maxAllowed = 95;

const forum_t = decodeURIComponent(Cookies.get('forum_t'));
let forum_f_all = decodeURIComponent(Cookies.get('forum_f_all'));
const outer = /a:(\d+):\{(.*)\}/g;
let matches = outer.exec(forum_t);
let pairCount = 0;
if(matches != null)
{
     pairCount = matches[1];
}

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
    pairs = maxAllowed == 0 ? new Array() : pairs.slice(-maxAllowed);

    const serialized = pairs.map(a => "i:" + a.post + ";i:" + a.timestamp).join(';') + ';';
    const forCookie = "a:" + pairs.length + ":{" + serialized + "}";

    var cookieSetter = Cookies.withConverter({
        write: function (value, name) {
            return encodeURIComponent(value);
        }
    })
    cookieSetter.set('forum_t', forCookie, {path: '/forum', domain: '.nfohump.com'});
    if(resetAllCookie)
    {
        Cookies.set('forum_f_all', pairs[0].timestamp, {path: '/forum', domain: '.nfohump.com'});
    }

    $('#leftdiv > div.menuLeftContainer:first > ul > li:first > a').text(pairs.length);
}

$('#leftdiv > div.menuLeftContainer:first > ul > li:first > a').text(pairCount);
$('a[href="index.php?mark=forums"]').click(() => {
    let reset = confirm("Do you want to mark all forums as read?");
    if(reset)
    {
        limitReadCount(pairCount, 0, false);
    }
    return reset;
});

limitReadCount(pairCount, _maxAllowed, true);