// ==UserScript==
// @name         Deleted Reviews Report Helper
// @description  Displays additional user & review information on the deleted reviews report
// @homepage     https://github.com/samliew/SO-userscripts
// @author       @samliew
// @version      0.1
//
// @include      https://reports.sobotics.org/r/*
//
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';


    const SOurl = 'https://stackoverflow.com';


    // Simple wrapper for GM_xmlhttpRequest that returns a Promise
    // See http://tampermonkey.net/documentation.php#GM_xmlhttpRequest for options
    function ajaxPromise(options) {
        if(typeof options === 'string') {
            options = { url: options };
        }

        return new Promise(function(resolve, reject) {
            if(typeof options.url === 'undefined' || options.url == null) reject();

            options.method = options.method || 'GET';
            options.onload = function(response) {
                resolve(response.responseText);
            };
            options.onerror = function() {
                reject();
            };
            GM_xmlhttpRequest(options);
        });
    }


    // Solution from https://stackoverflow.com/a/24719409/584192
    function jQueryXhrOverride() {
        var xhr = jQuery.ajaxSettings.xhr();
        var setRequestHeader = xhr.setRequestHeader;
        xhr.setRequestHeader = function(name, value) {
            if (name == 'X-Requested-With') return;
            setRequestHeader.call(this, name, value);
        };
        return xhr;
    }


    function getUsersInfo() {

        $('.FIDuser a[href*="/users/"]').each(function() {

            var userlink = $(this);
            var uid = $(this).attr('href').match(/\d+/)[0];
            var url = SOurl + '/users/history/' + uid + '?type=User+has+been+banned+from+review';
            var banUrl = `${SOurl}/admin/review/bans#${uid}`;

            // Add ban link
            $(`<a class="reviewban-link" href="${banUrl}" title="Ban user from reviews" target="_blank">X</a>`)
                .insertBefore(userlink);

            // Grab user's history
            ajaxPromise({
                url: url,
                xhr: jQueryXhrOverride

            }).then(function(data) {

                // Parse user history page
                const summary = $('#summary', data);
                const histItems = $('#user-history tbody tr', data);
                const numBansLink = summary.find('a[href="?type=User+has+been+banned+from+review"]').get(0);
                let numBans = 0;

                if(typeof numBansLink !== 'undefined')
                    numBans = Number(numBansLink.nextSibling.nodeValue.match(/\d+/)[0]);

                // Add annotation count
                $(`<a class="reviewban-count ${numBans > 2 ? 'warning' : ''}" href="${url}" title="${numBans} prior review bans" target="_blank">${numBans}</a>`)
                    .insertBefore(userlink);

                // Add currently/recently banned indicator
                let daysago = new Date();
                daysago.setDate(daysago.getDate() - 14);
                histItems.eq(0).each(function() {
                    const datetime = new Date($(this).find('.relativetime').attr('title'));
                    const duration = Number(this.innerText.match(/\= \d+ days/)[0].replace(/\D+/g, ''));
                    let banEndDatetime = new Date(datetime);
                    banEndDatetime.setDate(banEndDatetime.getDate() + duration);
                    const currtext = banEndDatetime > Date.now() ? 'current' : 'recent';

                    if(banEndDatetime > daysago) {

                        $(`<a class="reviewban-ending ${currtext == 'current' ? 'warning' : ''}" title="${currtext}ly review banned until ${banEndDatetime}" target="_blank">${currtext} review ban ${duration}d</a>`)
                            .insertAfter(userlink);
                    }
                });
            });
        });
    }


    function doPageload() {

        getUsersInfo();
    }


    function appendStyles() {

        var styles = `
<style>
a.reviewban-count,
a.reviewban-link,
a.reviewban-ending {
    position: relative;
    top: -2px;
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 5px;
    text-align: center;
    font-size: 0.8em;
    line-height: 14px;
    border-radius: 50%;
    border: 1px solid #666;
    background: white;
    color: #666;
}
a.reviewban-ending {
    border-radius: 3px;
    border-color: red;
    color: black;

    width: auto;
    padding: 2px 5px 0px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: -0.5px;
}
a.reviewban-count.warning,
a.reviewban-ending.warning {
    background: #FF9;
    border-color: red;
    color: red;
}
a.reviewban-link {
    border: 1px solid red;
    background: red;
    color: white;
}
a.reviewban-button {
    float: right;
}
</style>
`;
        $('body').append(styles);
    }

    // On page load
    doPageload();
    appendStyles();

})();
