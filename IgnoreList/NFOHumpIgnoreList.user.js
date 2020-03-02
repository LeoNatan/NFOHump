// ==UserScript==
// @name         NFOHump Hidden Users
// @namespace    com.LeoNatan.hideusers
// @version      1.5.1
// @description  Adds proper ignore list in NFOHump forums, where posts actually disappear.
// @author       Leo Natan
// @match        *://nfohump.com/forum/*
// @match        *://www.nfohump.com/forum/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/LeoNatan/NFOHump/master/IgnoreList/NFOHumpIgnoreList.user.js
// @updateURL    https://raw.githubusercontent.com/LeoNatan/NFOHump/master/IgnoreList/NFOHumpIgnoreList.user.js
// @position     1
// @noframes
// @run-at document-end
// ==/UserScript==

const className = "hiddenByNFOHumpIgnore";
const supportClassName = "supportForNFOHumpIgnore";

if(localStorage.blocklist === null || localStorage.blocklist === undefined)
{
    localStorage.blocklist = "";
}

if(localStorage.isBlocklistEnabled === null || localStorage.isBlocklistEnabled === undefined)
{
    localStorage.isBlocklistEnabled = "true";
}

const anchor = $('<a class="mainmenu" style="cursor: pointer;">Hidden users</a>').click(function() {
    var q = prompt("Enter a comma-separated list of users to hide:", localStorage.blocklist);
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

const ul = $('#leftdiv > div.menuLeftContainer:first > ul');
const hiddenThreads = ul.find(".hiddethreadsli").first();
const newMenuItem = $('<li class="hiddenusersli" style="vertical-align: middle;"></li>').append(anchor).append(checkbox);
if(hiddenThreads[0] != undefined)
{
    hiddenThreads.before(newMenuItem);
}
else
{
    ul.append(newMenuItem);
}

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
    let seed = Date.now();
    $.each(localStorage.blocklist.split(','), function(k,v) {
        v = $.trim(v);
        if(window.location.href.includes('/viewtopic.php')) {
            $('span.genmed:contains("' + v + '")').each(function() {
                const x = $(this).parent().parent().parent().parent();
                x.addClass(className);
                if($(x[0]).parents('#userSig').length == 0) {
                    const y = $('<table width="90%" cellspacing="1" cellpadding="3" border="0" align="center">	<tbody><tr> 	  <td><span class="genmed"><b>This is a quote by a hidden user</b></span></td>	</tr>	<tr>	  <td class="quote"><img src="https://cataas.com/cat/says/hidden%20user?height=200&seed=' + seed++ + '" />	</td></tr></tbody></table>');
                    y.addClass(supportClassName);
                    y.insertBefore(x);
                }
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
    if (localStorage.isBlocklistEnabled == "true" && localStorage['blocklist'] && localStorage['blocklist'].length > 0) {
        hideElements();
    }

    //Rerun the video embedding script to fixup hidden posts.
    if(window.__api_applyEmbedding)
    {
        window.__api_applyEmbedding();
    }
}

resetAndHideElements();