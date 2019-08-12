// ==UserScript==
// @name         Hide chat bot prefixes
// @description  Hides bot info in chat and chat transcripts
// @homepage     https://github.com/samliew/SO-mod-userscripts
// @author       @samliew
// @version      0.1
//
// @include      https://chat.stackoverflow.com/rooms/197298/meta-stack-overflow-comment-archive
// @include      https://chat.stackoverflow.com/transcript/197298*
// @include      https://chat.meta.stackexchange.com/rooms/197298/conversation/*
// ==/UserScript==

(function() {
    'use strict';


    /*
       This function is intended to check for new messages and parse the message text
       - Removes bot text prefix from chat messages
    */
    function initMessageParser(runAlways = true) {

        function parseMessage(i, el) {
            el.innerHTML = el.innerHTML.replace(/^\s*\[[^\]]+\]\s*/, '');
        }

        function parseNewMessages() {

            // Get unparsed messages
            const newMsgs = $('.message').not('.js-botprefix-parsed').addClass('js-botprefix-parsed');

            // No new messages, do nothing
            if(newMsgs.length == 0) return;

            // Parse messages, but ignoring oneboxes and quotes
            newMsgs.find('.content').filter(function() {
                return $(this).find('.onebox, .quote').length == 0;
            }).each(parseMessage);
        }

        runAlways ? setInterval(parseNewMessages, 3000) : parseNewMessages();
    }


    function doPageload() {

        // When joining a chat room
        if(location.pathname.includes('/rooms/') && !location.pathname.includes('/info/')) {
            initMessageParser();
        }
        // Transcripts
        else {
            initMessageParser(false); // parse messages once
        }
    }


    // On page load
    doPageload();

})();
