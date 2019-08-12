// ==UserScript==
// @name         NFOHump Emoji
// @namespace    http://nfohump.com/
// @version      0.1
// @description  Adds support for Emojis in NFOHump forums.
// @author       Leo Natan
// @match        *://nfohump.com/forum/*
// @match        *://www.nfohump.com/forum/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/LeoNatan/NFOHump/master/NFOHumpEmoji/Tampermonkey/NFOHumpEmoji.js
// @updateURL    https://raw.githubusercontent.com/LeoNatan/NFOHump/master/NFOHumpEmoji/Tampermonkey/NFOHumpEmoji.js
// @require      https://twemoji.maxcdn.com/v/latest/twemoji.min.js
// ==/UserScript==

let element = document.getElementById('qrform');
var textArea = null;
if(element == null)
{
    const byName = document.getElementsByName('post');

    if(byName.length === 0)
    {
        return false;
    }

    element = byName[0];

    const byClass = element.getElementsByClassName('post');

    if(byClass.length < 2)
    {
        return false;
    }

    textArea = byClass[1];
}
else
{
    textArea = document.getElementById('msg');
}

if(element == null || element === undefined || textArea == null || textArea === undefined)
{
    return false;
}

const oldOnSubmit = element.onsubmit;
//textArea.value = '';

function parseEmojiCharacters()
{
    const regex = /<img class="emoji" .*?src=\"(.*?)\"\/>/g;
    textArea.value = twemoji.parse(textArea.value).replace(regex, " [img width=15]$1[/img] ");

    return oldOnSubmit();
}

element.onsubmit = parseEmojiCharacters;