// ==UserScript==
// @name         NFOHump Hidden Threads
// @namespace    com.LeoNatan.hidethreads
// @version      1.0.2
// @description  Adds proper ignore list in NFOHump forums, where threads actually disappear.
// @author       Leo Natan
// @match        *://nfohump.com/forum/*
// @match        *://www.nfohump.com/forum/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/LeoNatan/NFOHump/master/IgnoreThread/NFOHumpIgnoreThread.user.js
// @updateURL    https://raw.githubusercontent.com/LeoNatan/NFOHump/master/IgnoreThread/NFOHumpIgnoreThread.user.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.19.2/URI.min.js
// @position     1
// @noframes
// @run-at document-end
// ==/UserScript==

const className = "hiddenByNFOHumpIgnoreThread";
const supportClassName = "supportForNFOHumpIgnoreThread";

if(localStorage.threadBlocklist === null || localStorage.threadBlocklist === undefined)
{
    localStorage.threadBlocklist = "";
}

if(localStorage.isThreadBlocklistEnabled === null || localStorage.isThreadBlocklistEnabled === undefined)
{
    localStorage.isThreadBlocklistEnabled = "true";
}

const anchor = $('<a class="mainmenu" style="cursor: pointer;">Hidden threads</a>').click(function() {
    var q = prompt("Enter a comma-separated list of threads to hide:", localStorage.threadBlocklist);
    if(q === null)
    {
        return;
    }

    if (q != localStorage.threadBlocklist)
    {
        localStorage.threadBlocklist = q;
        resetAndHideThreadElements();
    }
});

const checkbox = $('<input style="margin: 0px; margin-left: 8px; margin-top: 1px;" type="checkbox" ' + (localStorage.isThreadBlocklistEnabled == "true" ? 'checked' : '') + ' />').click(function () {
    localStorage.isThreadBlocklistEnabled = (localStorage.isThreadBlocklistEnabled == "true" ? "false" : "true");
    resetAndHideThreadElements();
});

const ul = $('#leftdiv > div.menuLeftContainer:first > ul');
const hiddenUsers = ul.find(".hiddenusersli").first();
const newMenuItem = $('<li class="hiddethreadsli" style="vertical-align: middle;"></li>').append(anchor).append(checkbox);
if(hiddenUsers[0] != undefined)
{
    hiddenUsers.after(newMenuItem);
}
else
{
    ul.append(newMenuItem);
}

function isThreadhidden(clickedThread)
{
    return $.grep($.map(localStorage.threadBlocklist.split(','), function(v) {
        return $.trim(v);
    }), function(e) { return e === clickedThread }).length > 0;
}

function performThreadOperation(clickedThread, hide)
{
    var arr = $.grep($.map(localStorage.threadBlocklist.split(','), function(v) {
        return $.trim(v);
    }), function(e) { return e !== clickedThread && e.length > 0; });
    if(hide === true)
    {
        arr.push(clickedThread);
    }
    localStorage.threadBlocklist = arr.join(', ');

    resetAndHideThreadElements();
}

if(window.location.href.includes("viewtopic.php") == true)
{
    const ignoreThread = URI($('a[href^="posting.php?mode=reply"')[0].href).query(true)["t"];
    var threadIsHidden = isThreadhidden(ignoreThread);
    const newButton = $('<li><a style="cursor: pointer; user-select: none;">' + (threadIsHidden ? "Unhide Thread" : "Hide Thread") + '</a></li><span>&nbsp;</span>').click(function(e) {
        performThreadOperation(ignoreThread, !threadIsHidden);
        threadIsHidden = !threadIsHidden;
        $(e.target).text((threadIsHidden ? "Unhide Thread" : "Hide Thread"));
    });

    $('a[href^="posting.php?mode=newtopic"').before(newButton);
}

if(window.location.href.includes("viewforum.php") != true)
{
    return;
}

$('.row3Right .postdetails:first-child').each(function(i, link) {
    const ignoreThread = $('<span style="cursor: pointer; user-select: none;">❌</span>').click(function(e) {
        const clickedThread = URI($(e.target).parent().parent().parent().find("a.topictitle").first()[0].href).query(true)["t"];
        performThreadOperation(clickedThread, true);

        return false;
    });
    $(link).children().first().before(ignoreThread);
});

function hideThreadElements() {
    $.each(localStorage.threadBlocklist.split(','), function(k, v) {
        v = $.trim(v);
        $('a.topictitle[href$="' + v + '"]').each(function(i, link) {
            let row = $(link).parent().parent().parent();
            row.addClass(className);
            row.hide();
        });
    });
}

function resetHiddenThreadElements() {
    $('.' + className).each(function(i, tr) {
        $(tr).removeClass(className);
        $(tr).show();
    });
}

function resetAndHideThreadElements() {
    resetHiddenThreadElements();
    if (localStorage.isThreadBlocklistEnabled == "true" && localStorage['blocklist'] && localStorage['blocklist'].length > 0) {
        hideThreadElements();
    }
}

resetAndHideThreadElements();