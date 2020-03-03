// ==UserScript==
// @name         NFOHump Embedded Videos
// @namespace    com.LeoNatan.embedded-videos
// @version      1.2
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
// ==/UserScript==

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

function applyElementReplacement(original, replacement)
{
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
}

const anchor = $('<a class="mainmenu" style="cursor: pointer;">Embed videos</a>');
const checkbox = $('<input style="margin: 0px; margin-left: 8px; margin-top: 1px;" type="checkbox" ' + (localStorage.isEmbeddingEnabled == "true" ? 'checked' : '') + ' />');

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

window.__api_applyEmbedding = applyEmbedding;

const clickHandler = function () {
    localStorage.isEmbeddingEnabled = (localStorage.isEmbeddingEnabled == "true" ? "false" : "true");
    checkbox.prop('checked', localStorage.isEmbeddingEnabled === "true");

    applyEmbedding();
};

anchor.click(clickHandler);
checkbox.click(clickHandler);

$('#leftdiv > div.menuLeftContainer:first > ul').append($('<li style="vertical-align: middle;"></li>').append(anchor).append(checkbox));

applyEmbedding();