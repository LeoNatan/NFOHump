// ==UserScript==
// @name         NFOHump Ignore
// @namespace    http://nfohump.com/
// @version      1.1
// @description  Adds proper ignore list in NFOHump forums, where posts actually disappear.
// @author       Leo Natan
// @match        *://nfohump.com/forum/*
// @match        *://www.nfohump.com/forum/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/LeoNatan/NFOHump/master/IgnoreList/NFOHumpIgnoreList.js
// @updateURL    https://raw.githubusercontent.com/LeoNatan/NFOHump/master/IgnoreList/NFOHumpIgnoreList.js
// @position     1
// @noframes
// @run-at document-body
// ==/UserScript==

const className = "hiddenByNFOHumpIgnore";

if(localStorage.blocklist === null)
{
    localStorage.blocklist = "";
}

if(localStorage.isBlocklistEnabled === null)
{
    localStorage.isBlocklistEnabled = "true";
}

const anchor = $('<a class="mainmenu" style="cursor: pointer;">Ignore list</a>').click(function() {
    var q = prompt("Enter a comma-separated list of usernames:", localStorage.blocklist);
    if(q === null)
    {
        return;
    }

    if (q != localStorage.blocklist)
    {
        localStorage.blocklist = q;
        resetAndHideElements();
    }
});

const checkbox = $('<input style="margin: 0px; margin-left: 8px; margin-top: 1px;" type="checkbox" ' + (localStorage.isBlocklistEnabled == "true" ? 'checked' : '') + ' />').click(function () {
    localStorage.isBlocklistEnabled = (localStorage.isBlocklistEnabled == "true" ? "false" : "true");
    resetAndHideElements();
});

$('#leftdiv > div.menuLeftContainer:first > ul').append($('<li style="vertical-align: middle;"></li>').append(anchor).append(checkbox));

const ignoreUser = $('<span>&nbsp;</span><img style="cursor: pointer; max-width: 10.5px;" src="https://twemoji.maxcdn.com/v/12.1.2/svg/1f6ab.svg" />').click(function(e) {
    const clickedUserName = $(e.target).parent().children().first().html();

    var arr = $.grep($.map(localStorage.blocklist.split(','), function(v) {
        return $.trim(v);
    }), function(e) { return e !== clickedUserName; });

    arr.push(clickedUserName);

    localStorage.blocklist = arr.join(', ');

    resetAndHideElements();
});

//const userParents = $("a[title|='click to insert @mention']").parent();
//userParents.append(ignoreUser);
//userParents.css('display', 'flex').css('vertical-align', 'baseline');

function hideElements() {
    $.each(localStorage.blocklist.split(','), function(k,v) {
        v = $.trim(v);
        if(window.location.href.includes('/viewtopic.php')) {
            $('span.nav > b > a:contains("'+v+'")').each(function() {
                const x = $(this).parents('td:eq(0)').parent();
                x.addClass(className);
                x.hide();
                x.next().addClass(className);
                x.next().hide();
                x.next().next().addClass(className);
                x.next().next().hide();
            })
        }
        else {

        }
    });
}

function resetHiddenElements() {
    $('.' + className).show();
}

function resetAndHideElements() {
    resetHiddenElements();
    if (localStorage.isBlocklistEnabled == "true" && localStorage['blocklist'].length > 0) {
        hideElements();
    }
}

resetAndHideElements();