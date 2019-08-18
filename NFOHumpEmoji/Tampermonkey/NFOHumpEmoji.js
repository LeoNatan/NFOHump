// ==UserScript==
// @name         NFOHump Emoji
// @namespace    http://nfohump.com/
// @version      1.1
// @description  Adds support for Emojis in NFOHump forums.
// @author       Leo Natan
// @match        *://nfohump.com/forum/*
// @match        *://www.nfohump.com/forum/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/LeoNatan/NFOHump/master/NFOHumpEmoji/Tampermonkey/NFOHumpEmoji.js
// @updateURL    https://raw.githubusercontent.com/LeoNatan/NFOHump/master/NFOHumpEmoji/Tampermonkey/NFOHumpEmoji.js
// @position     1
// @noframes
// @require      https://twemoji.maxcdn.com/v/latest/twemoji.min.js
// ==/UserScript==

if(localStorage.isEmojiEnabled === null)
{
    localStorage.isEmojiEnabled = "true";
}

const anchor = $('<a class="mainmenu" style="cursor: pointer;">Emoji support</a>');
const checkbox = $('<input style="margin: 0px; margin-left: 8px; margin-top: 1px;" type="checkbox" ' + (localStorage.isEmojiEnabled == "true" ? 'checked' : '') + ' />');

const clickHandler = function () {
    localStorage.isEmojiEnabled = (localStorage.isEmojiEnabled == "true" ? "false" : "true");
    checkbox.prop('checked', localStorage.isEmojiEnabled === "true");
};

anchor.click(clickHandler);
checkbox.click(clickHandler);

$('#leftdiv > div.menuLeftContainer:first > ul').append($('<li style="vertical-align: middle;"></li>').append(anchor).append(checkbox));

var element = null;
var textArea = null;

function findQuickReply()
{
    if(element != null) return;

    element = document.getElementById('qrform');
    if(element != null)
    {
        textArea = document.getElementById('msg');
    }
}

function findFullReply()
{
    if(element != null) return;

    const byName = document.getElementsByName('post');

    if(byName.length === 0)
    {
        return;
    }

    element = byName[0];

    const byClass = element.getElementsByClassName('post');

    if(byClass.length < 2)
    {
        return;
    }

    textArea = byClass[1];
}

function findProfileEditor()
{
    if(element != null) return;

    let byClass = document.getElementsByClassName('bodyline');

    if(byClass.length === 0)
    {
        return;
    }

    if(byClass[0].children.length === 0 || byClass[0].children[0].nodeName !== 'FORM')
    {
        return;
    }

    element = byClass[0].children[0];

    if(element.children.length === 0)
    {
        return;
    }

    byClass = element.getElementsByClassName('post');

    for(let e of byClass)
    {
        if(e.nodeName === 'TEXTAREA')
        {
            textArea = e;
            break;
        }
    }
}

findQuickReply();
findFullReply();
findProfileEditor();

if(element == null || element === undefined || textArea == null || textArea === undefined || textArea.nodeName !== 'TEXTAREA' || element.nodeName != 'FORM')
{
    return false;
}

const oldOnSubmit = element.onsubmit;
//textArea.value = '';

function parseEmojiCharacters()
{
    if(localStorage.isEmojiEnabled === "true")
    {
        const regex = /<img class="emoji" .*?src=\"(.*?)\"\/>/g;
        textArea.value = twemoji.parse(textArea.value).replace(regex, " [img width=16]$1[/img] ");
    }

    if(oldOnSubmit != null)
    {
        return oldOnSubmit();
    }

    return true;
}

element.onsubmit = parseEmojiCharacters;