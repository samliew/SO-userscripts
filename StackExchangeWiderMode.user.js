// ==UserScript==
// @name         Stack Exchange Wider Mode
// @description  Increase max-width of sites to 1440px
// @homepage     https://github.com/samliew/SO-mod-userscripts
// @author       @samliew
// @version      1.0.5
//
// @include      https://*stackexchange.com/*
// @include      https://*stackoverflow.com/*
// @include      https://*serverfault.com/*
// @include      https://*superuser.com/*
// @include      https://*askubuntu.com/*
// @include      https://*mathoverflow.net/*
// @include      https://*stackapps.com/*
// @include      https://*.stackexchange.com/*
//
// @exclude      */transcript/*
//
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';


    GM_addStyle(`


/* General */
.contentWrapper,
.top-bar .-container,
body > .container,
body > #container {
    max-width: 1440px;
    width: 100%;
}
body#chat-body #container {
    max-width: none;
    width: 100%;
}
#left-sidebar + #content {
    max-width: 1276px;
    width: calc(100% - 164px);
    margin-left: auto;
    margin-right: auto;
}
html.html__unpinned-leftnav #content {
    max-width: none;
    width: 100%;
}


/* Mod pages */
.flag-container {
    width: calc(100% - 330px);
}
.flagged-posts {
    width: 100%;
}


/* Stack Exchange */
header.siteHeader {
    padding: 0 20px;
}
body > .wrapper > #content {
    max-width: none;
    width: auto;
}
#mainArea {
    max-width: 1276px;
    width: calc(100% - 240px);
}
#mainArea + #sideBar {
    width: 220px;
}
#mainArea > * {
    width: auto;
}
#mainArea #question-list,
#mainArea #question-list .question-container {
    width: 100%;
    box-sizing: border-box;
}
#mainArea #question-list .question-container .question {
    width: calc(100% - 70px);
    box-sizing: border-box;
}


`.replace(/;/g, ' !important;'));


})();
