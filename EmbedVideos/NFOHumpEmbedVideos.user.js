// ==UserScript==
// @name         NFOHump Embedded Content
// @namespace    com.LeoNatan.embedded-videos
// @version      1.7.0
// @description  Transforms video links to popular sites with embedded videos.
// @author       Leo Natan
// @match        *://nfohump.com/forum/*
// @match        *://www.nfohump.com/forum/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/LeoNatan/NFOHump/master/EmbedVideos/NFOHumpEmbedVideos.user.js
// @updateURL    https://raw.githubusercontent.com/LeoNatan/NFOHump/master/EmbedVideos/NFOHumpEmbedVideos.user.js
// @position     1
// @noframes
// @run-at document-end
// @require https://platform.twitter.com/widgets.js
// ==/UserScript==

let redditScriptElement = document.createElement("script");
redditScriptElement.setAttribute("src", "https://embed.redditmedia.com/widgets/platform.js");
document.head.appendChild(redditScriptElement);

//Support the dumb emoji popup window, which does not load jQuery.
const insertAtCaret = function(obj, myValue) {
    var startPos = obj.selectionStart;
    var endPos = obj.selectionEnd;
    var scrollTop = obj.scrollTop;
    obj.value = obj.value.substring(0, startPos)+myValue+obj.value.substring(endPos,obj.value.length);
    obj.focus();
    obj.selectionStart = startPos + myValue.length;
    obj.selectionEnd = startPos + myValue.length;
    obj.scrollTop = scrollTop;
}

function enhanceOldEmojiPickers()
{
    //Improve old-style emoji picker
    window.emoticon = function(obj) {
        if(document.post) {
            var i = document.post.message;
        } else {
            var i = opener.document.forms.post.message;
        }
        insertAtCaret(i, ' ' + obj + ' ');
    }
}

if(window.$ == undefined) {
    enhanceOldEmojiPickers();
    return;
}

if(localStorage.isEmbeddingEnabled === null || localStorage.isEmbeddingEnabled === undefined)
{
    localStorage.isEmbeddingEnabled = "true";
}

function videoElement(url, type = "video/mp4")
{
    return $('<video controls="controls" preload="metadata"><source src="' + url + '" type="' + type + '"></video>');
}

function imageElement(url)
{
    return $('<img src="' + url + '" />');
}

function iframeElement(url)
{
    return $('<iframe src="' + url + '" width="640" height="360" frameborder="0" allow="fullscreen" allowfullscreen />');
}

function twitterEmbedElement(url)
{
    return $('<blockquote class="twitter-tweet" data-conversation="none" data-dnt="true"><a href="' + url + '"></a></blockquote>');
}

function redditEmbedElement(url)
{
    return $('<div style="background: white; width: 600px;"><blockquote class="reddit-card"><a href="' + url + '"></a></blockquote></div>');
}

function steamEmbedElement(url)
{
    url = url.replace('steampowered.com/app', 'steampowered.com/widget');
    return $('<iframe src="' + url + '" seamless="seamless" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation" width="700" height="195" frameborder="0" />');
}

function applyElementReplacement(original, replacement)
{
    if($(original).hasClass("__removed_for_embedded_video"))
    {
        return;
    }

    if($(original).parent().parent().hasClass("__added_for_embedded_video"))
    {
        return;
    }

    $(replacement).addClass("__added_for_embedded_video");
    $(original).after(replacement);
    $(original).addClass("__removed_for_embedded_video");
    $(original).hide();
}

function restoreFromEmbedded()
{
    $(".__added_for_embedded_video").each(function(i, whatever) {
        $(whatever).remove();
    });
    $(".__removed_for_embedded_video").each(function(i, whatever) {
        $(whatever).removeClass("__removed_for_embedded_video");
        $(whatever).show();
    });
}

function smartFilter(selector)
{
    return $(selector).not(".__removed_for_embedded_video").filter(function(i, element) {
        return $(element).parents('#userSig').length == 0;
    });
}

function applyVideoEmbedding()
{
    smartFilter('a[href$=".mp4"]').each(function(i, link) {
        if(link.href.includes("video.twimg.com"))
        {
            return;
        }

        let replacement = videoElement(link.href);
        applyElementReplacement(link, replacement);
    });

    smartFilter('a[href$=".webm"]').each(function(i, link) {
        let replacement = videoElement(link.href, "video/webm");
        applyElementReplacement(link, replacement);
    });

    smartFilter('a[href$=".gifv"]').each(function(i, link) {
        if(link.host.includes("imgur.com"))
        {
            let replacement = videoElement(link.href.replace(".gifv", ".mp4"));
            applyElementReplacement(link, replacement);
        }
        else
        {
            let replacement = imageElement(link.href);
            applyElementReplacement(link, replacement);
        }
    });

    smartFilter('a[href$=".gif"]').each(function(i, link) {
        let replacement = imageElement(link.href);
        applyElementReplacement(link, replacement);
    });

    smartFilter('a[href*="imgur.com/r/"').each(function(i, link) {
        //https://m.imgur.com/r/BetterEveryLoop/jgsHSe5
        //https://i.imgur.com/jgsHSe5.mp4
        try {
            let lastPart = link.href.substring(link.href.lastIndexOf('/') + 1)
            let replacement = videoElement("https://i.imgur.com/" + lastPart + ".mp4");
            applyElementReplacement(link, replacement);
        }
        catch (err) {
        }
    });

    smartFilter('a[href*="giphy.com/gifs"').each(function(i, link) {
        //https://giphy.com/gifs/blabla-l3IccRELmaXWGwFrr7
        //https://media.giphy.com/media/l3IccRELmaXWGwFrr7/giphy.gif
        try {
            let lastPart = /.*-(.*)/g.exec(link.href)[1];
            let replacement = imageElement("https://media.giphy.com/media/" + lastPart + "/giphy.gif");
            applyElementReplacement(link, replacement);
        }
        catch (err) {
        }
    });

    smartFilter('a[href^="https://gfycat.com/"').each(function(i, link) {
        //https://gfycat.com/mildhilariousinganue
        //https://gfycat.com/ifr/mildhilariousinganue
        //https://api.gfycat.com/v1/gfycats/mildhilariousinganue
        //https://giant.gfycat.com/MildHilariousInganue.webm
        try {
            let lastPart = /.*\/(.*)/g.exec(link.href)[1];
            let cleanedLastPart = lastPart.includes("-") ? /(.*?)-.*/.exec(lastPart)[1] : lastPart;

            let failureHandler = function() {
                let replacement = iframeElement("https://gfycat.com/ifr/" + lastPart);
                applyElementReplacement(link, replacement);
            };

            fetch('https://api.gfycat.com/v1/gfycats/' + cleanedLastPart).then(res => res.json()).then(data => {
                try {
                    let replacement = videoElement(data.gfyItem.mp4Url);
                    applyElementReplacement(link, replacement);
                }
                catch (err) {
                    failureHandler();
                }
            }).catch(err => {
                failureHandler();
            })
        }
        catch (err) {}
    });

    smartFilter('a[href^="https://vimeo.com/"').each(function(i, link) {
        //https://vimeo.com/390882605
        //<iframe src="https://player.vimeo.com/video/390882605" width="640" height="360" frameborder="0" allow="fullscreen" allowfullscreen></iframe>
        try {
            let lastPart = /.*\/(.*)/g.exec(link.href)[1];

            let replacement = iframeElement("https://player.vimeo.com/video/" + lastPart);
            applyElementReplacement(link, replacement);
        }
        catch (err) {}
    });

    smartFilter('a[href*="twitter.com/"').each(function(i, link) {
        //https://twitter.com/JesseRodriguez/status/1471573837959544842
        let replacement = twitterEmbedElement(link.href);
        applyElementReplacement(link, replacement);
    });
    
    smartFilter('a[href*="x.com/"').each(function(i, link) {
        //https://x.com/JesseRodriguez/status/1471573837959544842
        let replacement = twitterEmbedElement(link.href.replace("x.com", "twitter.com"));
        applyElementReplacement(link, replacement);
    });

    smartFilter('a[href*="reddit.com/"').each(function(i, link) {
        //https://www.reddit.com/r/ForzaHorizon/comments/rfzn6t/did_a_single_goliath_lap_with_my_bmw_isetta_it/
        let replacement = redditEmbedElement(link.href);
        applyElementReplacement(link, replacement);
    });

    smartFilter('a[href^="https://store.steampowered.com/app/"').each(function(i, link) {
        //https://store.steampowered.com/app/1092790/Inscryption/
        let replacement = steamEmbedElement(link.href);
        applyElementReplacement(link, replacement);
    });
}

const anchor = $('<a class="mainmenu" style="cursor: pointer;">Embed content</a>');
const checkbox = $('<input style="margin: 0px; margin-left: 20px; margin-top: 1px;" type="checkbox" ' + (localStorage.isEmbeddingEnabled == "true" ? 'checked' : '') + ' />');

function applyEmbedding()
{
    if(localStorage.isEmbeddingEnabled === "true")
    {
        applyVideoEmbedding();
    }
    else
    {
        restoreFromEmbedded();
    }
}

window.twttr.events.bind(
    'rendered',
    function (event) {
        $(event.target).addClass("__added_for_embedded_video");
    }
);

window.__api_applyEmbedding = applyEmbedding;

const clickHandler = function () {
    localStorage.isEmbeddingEnabled = (localStorage.isEmbeddingEnabled == "true" ? "false" : "true");
    checkbox.prop('checked', localStorage.isEmbeddingEnabled === "true");

    applyEmbedding();

    window.twttr.widgets.load();
};

anchor.click(clickHandler);
checkbox.click(clickHandler);

$('#leftdiv > div.menuLeftContainer:first > ul').append($('<li style="vertical-align: middle;"></li>').append(anchor).append(checkbox));

applyEmbedding();

if(localStorage.expandQuickDerps === null || localStorage.expandQuickDerps === undefined)
{
    localStorage.expandQuickDerps = "false";
}

const anchorDerps = $('<a class="mainmenu" style="cursor: pointer;">Expand Derps</a>');
const checkboxDerps = $('<input style="margin: 0px; margin-left: 27px; margin-top: 1px;" type="checkbox" ' + (localStorage.expandQuickDerps == "true" ? 'checked' : '') + ' />');

enhanceOldEmojiPickers();

function addDerpsToModernEmoticonList() {
    let modernSmilies = $('div.smilies');
    if(modernSmilies.length > 0) {
        //Derps Collection support in modern emoji picker
        if(localStorage.expandQuickDerps === "true") {
            fetch("https://thederpcollector.github.io/DerpsCollection/modern_emoji.html")
            .then(response => response.text())
            .then(text => {
                modernSmilies[0].innerHTML += text;
            });
        } else {
            modernSmilies.append('<div name="quick_derp" style="background-image: url(\'https://thederpcollector.github.io/DerpsCollection/derp_book_cover.png\'); width: 100px;" title="The Derp Collection" code=":derp:" onclick="window.open(\'https://thederpcollector.github.io/DerpsCollection/newwindow_emoji.html\', \'_phpbbsmilies\', \'HEIGHT=650,resizable=yes,scrollbars=yes,WIDTH=1000\');return false;"></div>');
        }
    }
}

const derpClickHandler = function () {
    localStorage.expandQuickDerps = (localStorage.expandQuickDerps == "true" ? "false" : "true");
    checkboxDerps.prop('checked', localStorage.expandQuickDerps === "true");

    $('div[name="quick_derp"]').each(function(i, whatever) {
        whatever.remove();
    });
    
    addDerpsToModernEmoticonList();
};

anchorDerps.click(derpClickHandler);
checkboxDerps.click(derpClickHandler);

$('#leftdiv > div.menuLeftContainer:first > ul').append($('<li style="vertical-align: middle;"></li>').append(anchorDerps).append(checkboxDerps));

window.addEventListener('message', event => {
    if (event.origin.startsWith('https://thederpcollector.github.io')) {
        const message = $("form textarea[name='message']");
        if(message.length > 0) {
            message.insertAtCaret(event.data);   
        }
    }
});

addDerpsToModernEmoticonList();

let moreEmoticonsLink = $('a:contains("View more Emoticons")');
if(moreEmoticonsLink.length > 0) {
    moreEmoticonsLink.attr("onclick", "window.open('posting.php?mode=smilies', '_phpbbsmilies', 'HEIGHT=650,resizable=yes,scrollbars=yes,WIDTH=1000');return false;");
    moreEmoticonsLink.parent().parent().parent().parent().append('<tr align="center"><td colspan="4"><span class="nav"><a href="https://thederpcollector.github.io/DerpsCollection/newwindow_emoji.html" onclick="window.open(\'https://thederpcollector.github.io/DerpsCollection/newwindow_emoji.html\', \'_phpbbsmilies\', \'HEIGHT=650,resizable=yes,scrollbars=yes,WIDTH=1000\');return false;" target="_phpbbsmilies" class="nav">The Derps Collection</a></span></td></tr>');
}