// ==UserScript==
// @name         NFOHump Ignore
// @namespace    http://nfohump.com/
// @version      1.3
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
const supportClassName = "supportForNFOHumpIgnore";

if(localStorage.blocklist === null)
{
    localStorage.blocklist = "";
}

if(localStorage.isBlocklistEnabled === null)
{
    localStorage.isBlocklistEnabled = "true";
}

const anchor = $('<a class="mainmenu" style="cursor: pointer;">Hidden users</a>').click(function() {
    var q = prompt("Enter a comma-separated list of users:", localStorage.blocklist);
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

const ignoreUser = $('<li><a href="about:blank">Hide User</a></li>').click(function(e) {
    const clickedUserName = $(e.target).parent().parent().parent().parent().parent().parent().parent().parent().parent().find("a[title^='click to insert']").text();

    var arr = $.grep($.map(localStorage.blocklist.split(','), function(v) {
        return $.trim(v);
    }), function(e) { return e !== clickedUserName; });

    arr.push(clickedUserName);

    localStorage.blocklist = arr.join(', ');

    resetAndHideElements();

    return false;
});

const userParents = $("a:contains('Ignore User')").parent();
userParents.before(ignoreUser);

function hideElements() {
    $.each(localStorage.blocklist.split(','), function(k,v) {
        v = $.trim(v);
        if(window.location.href.includes('/viewtopic.php')) {
            $('span.genmed:contains("' + v + '")').each(function() {
                const x = $(this).parent().parent().parent().parent();
                x.addClass(className);
                const y = $('<table width="90%" cellspacing="1" cellpadding="3" border="0" align="center">	<tbody><tr> 	  <td><span class="genmed"><b>This is a quote by a hidden user</b></span></td>	</tr>	<tr>	  <td class="quote"><i>hidden</i>	</td></tr></tbody></table>');
                y.addClass(supportClassName);
                y.insertBefore(x);
                x.hide();
            });
            $('span.nav > b > a:contains("' + v + '")').each(function() {
                const x = $(this).parents('td:eq(0)').parent();
                x.addClass(className);
                x.hide();
                x.next().addClass(className);
                x.next().hide();
                x.next().next().addClass(className);
                x.next().next().hide();
            });
        }
        else {

        }
    });
}

function resetHiddenElements() {
    $('.' + supportClassName).remove();
    $('.' + className).show();
}

function resetAndHideElements() {
    resetHiddenElements();
    if (localStorage.isBlocklistEnabled == "true" && localStorage['blocklist'].length > 0) {
        hideElements();
    }
}

resetAndHideElements();