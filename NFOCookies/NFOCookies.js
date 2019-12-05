// ==UserScript==
// @name         NFOHump Cookie Fixer
// @namespace    http://nfohump.com/
// @version      1.0.2
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

const maxAllowed = 95;

const forum_t = Cookies.get('forum_t');
const outer = /a:(\d+):\{(.*)\}/g;
let matches = outer.exec(forum_t);
const pairCount = matches[1];

$('#leftdiv > div.menuLeftContainer:first > ul > li:first > a').text("" + pairCount);
$('a[href="index.php?mark=forums"]').click(() => { return confirm("Do you want to mark all forums as read?"); });

if(pairCount <= maxAllowed)
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

const serialized = pairs.map(a => "i:" + a.post + ";i:" + a.timestamp).join(';');
const forCookie = "a:" + pairs.length + ":{" + serialized + "}";

Cookies.set('forum_t', escape(forCookie), {path: '/forum', domain: '.nfohump.com'});
Cookies.set('forum_f_all', pairs[0].timestamp, {path: '/forum', domain: '.nfohump.com'});