// ==UserScript==
// @name         NFOHump Embedded Videos
// @namespace    com.LeoNatan.embedded-videos
// @version      1.0
// @description  Transforms video links to popular sites with embedded videos.
// @author       Leo Natan
// @match        *://nfohump.com/forum/*
// @match        *://www.nfohump.com/forum/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/LeoNatan/NFOHump/master/EmbedVideos/NFOHumpEmbedVideos.user.js
// @updateURL    https://raw.githubusercontent.com/LeoNatan/NFOHump/master/EmbedVideos/NFOHumpEmbedVideos.user.js
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @position     1
// @noframes
// @run-at document-end
// ==/UserScript==



$('a[href$=".mp4"]').each(function(i, link) {
    let replacement = $('<video controls="controls" preload="metadata"><source src="' + link.href + '" type="video/mp4"></video>');
    $(link).replaceWith(replacement);
});

$('a[href$=".webm"]').each(function(i, link) {
    let replacement = $('<video controls="controls" preload="metadata"><source src="' + link.href + '" type="video/webm"></video>');
    $(link).replaceWith(replacement);
});

$('a[href$=".mp4"]').each(function(i, link) {
    let replacement = $('<video controls><source src="' + link.href + '" type="video/mp4"></video>');
    $(link).replaceWith(replacement);
});

$('a[href$=".gifv"]').each(function(i, link) {
    if(link.host.includes("imgur.com"))
    {
        let replacement = $('<video controls="controls" preload="metadata"><source src="' + link.href.replace(".gifv", ".mp4") + '" type="video/mp4"></video>');
        $(link).replaceWith(replacement);
    }
    else
    {
        let replacement = $('<img src="' + link + '" />');
        $(link).replaceWith(replacement);
    }
});

$('a[href$=".gif"]').each(function(i, link) {
    let replacement = $('<img src="' + link + '" />');
    $(link).replaceWith(replacement);
});

$('a[href*="imgur.com/r/"').each(function(i, link) {
    //https://m.imgur.com/r/BetterEveryLoop/jgsHSe5
    //https://i.imgur.com/jgsHSe5.mp4
    try {
        let lastPart = link.href.substring(link.href.lastIndexOf('/') + 1)
        let replacement = $('<video controls="controls" preload="metadata"><source src="https://i.imgur.com/' + lastPart + '.mp4" type="video/mp4"></video>');
        $(link).replaceWith(replacement);
    }
    catch (err) {
    }
});

$('a[href*="giphy.com/gifs"').each(function(i, link) {
    //https://giphy.com/gifs/blabla-l3IccRELmaXWGwFrr7
    //https://media.giphy.com/media/l3IccRELmaXWGwFrr7/giphy.gif
    try {
        let lastPart = /.*-(.*)/g.exec(link.href)[1];
        let replacement = $('<img src="https://media.giphy.com/media/' + lastPart + '/giphy.gif" />');
        $(link).replaceWith(replacement);
    }
    catch (err) {
    }
});

$('a[href^="https://gfycat.com/"').each(function(i, link) {
    //https://gfycat.com/mildhilariousinganue
    //https://gfycat.com/ifr/mildhilariousinganue
    //https://api.gfycat.com/v1/gfycats/mildhilariousinganue
    //https://giant.gfycat.com/MildHilariousInganue.webm
    try {
        let lastPart = /.*\/(.*)/g.exec(link.href)[1];
        let cleanedLastPart = lastPart.includes("-") ? /(.*?)-.*/.exec(lastPart)[1] : lastPart;
        fetch('https://api.gfycat.com/v1/gfycats/' + cleanedLastPart).then(res => res.json()).then(data => {
            try {
                let replacement = $('<video controls="controls" preload="metadata"><source src="' + data.gfyItem.mp4Url + '" type="video/mp4"></video>');
                $(link).replaceWith(replacement);
            }
            catch (err) {
                let replacement = $('<iframe frameBorder="0" width=640 height=360 src="https://gfycat.com/ifr/' + lastPart + '"/>');
                $(link).replaceWith(replacement);
            }
        }).catch(err => {
            let replacement = $('<iframe frameBorder="0" width=640 height=360 src="https://gfycat.com/ifr/' + lastPart + '"/>');
            $(link).replaceWith(replacement);
        })
    }
    catch (err) {
    }
});

$('a[href^="https://vimeo.com/"').each(function(i, link) {
    //https://vimeo.com/390882605
    //<iframe src="https://player.vimeo.com/video/390882605" width="640" height="360" frameborder="0" allow="fullscreen" allowfullscreen></iframe>
    try {
        let lastPart = /.*\/(.*)/g.exec(link.href)[1];
        let replacement = $('<iframe src="https://player.vimeo.com/video/' + lastPart + '" width="640" height="360" frameborder="0" allow="fullscreen" allowfullscreen />');
        $(link).replaceWith(replacement);
    }
    catch (err) {
    }
});