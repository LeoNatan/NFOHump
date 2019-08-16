// ==UserScript==
// @name         NFOHump Block
// @namespace    http://nfohump.com/
// @version      1.0
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

if(localStorage.blocklist === null)
{
    localStorage.blocklist = "";
}

if(localStorage.isBlocklistEnabled === null)
{
    localStorage.isBlocklistEnabled = "true";
}

const anchor = $('<a class="mainmenu" style="cursor: pointer; color: #fe8;">Ignore list</a>').click(function() {
    var q = prompt("Enter a comma-separated list of usernames:", localStorage.blocklist);
    if(q === null)
    {
        return;
    }

    if (q != localStorage.blocklist)
    {
        localStorage.blocklist = q;
        window.location.reload();
    }
});

const checkbox = $('<input style="margin: 0px; margin-left: 8px; margin-top: 1px;" type="checkbox" ' + (localStorage.isBlocklistEnabled == "true" ? 'checked' : '') + ' />').click(function () {
    localStorage.isBlocklistEnabled = (localStorage.isBlocklistEnabled == "true" ? "false" : "true");
    window.location.reload();
});

$('#leftdiv > div.menuLeftContainer:first > ul').append($('<li style="vertical-align: middle;"></li>').append(anchor).append(checkbox));

if (localStorage.isBlocklistEnabled == "true" && localStorage['blocklist'].length > 0)
{
    $.each(localStorage.blocklist.split(','), function(k,v) {
        v = $.trim(v);
        if(window.location.href.includes('/viewtopic.php')) {
            $('span.nav > b > a:contains("'+v+'")').each(function() {
                const x = $(this).parents('td:eq(0)').parent();
                x.hide();
                x.next().hide();
                x.next().next().hide();
            })
        }
        else {

        }
    });
}

//.next().addBack().hide()