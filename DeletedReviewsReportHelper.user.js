// ==UserScript==
// @name         Deleted Reviews Report Helper
// @description  Displays additional user & review information on the deleted reviews report
// @homepage     https://github.com/samliew/SO-userscripts
// @author       @samliew
// @version      0.4.2
//
// @include      https://reports.sobotics.org/r/*
//
// @require      https://github.com/samliew/SO-mod-userscripts/raw/master/lib/common.js
//
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';


    const SOurl = 'https://stackoverflow.com';

    const getReviewTypeId = s => ['first-posts', 'late-answers', 'low-quality-posts'].indexOf(s);
    const getDeleteTypeId = s => ['diamond_mod', 'diamond_mod_convert', 'review', 'reputation_mod', 'duplicate'].indexOf(s);


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
                daysago.setDate(daysago.getDate() - 30);
                histItems.eq(0).each(function() {
                    const datetime = new Date($(this).find('.relativetime').attr('title'));
                    const duration = Number(this.innerText.match(/\= \d+ days/)[0].replace(/\D+/g, ''));
                    let banEndDatetime = new Date(datetime);
                    banEndDatetime.setDate(banEndDatetime.getDate() + duration);
                    const currtext = banEndDatetime > Date.now() ? 'current' : 'recent';

                    if(banEndDatetime > daysago) {
                        $(`<span class="reviewban-ending ${currtext == 'current' ? 'warning' : ''}" title="${currtext}ly review banned until ${banEndDatetime}" target="_blank">${currtext} review ban ${duration}d</span>`)
                            .insertAfter(userlink);
                    }

                    if(currtext == 'current') {
                        userlink.parents('.report').addClass('is-review-banned');
                    }
                });
            });
        });
    }


    function sortReports() {

        // Preprocess
        $('.reportLink:not(.FIDuser) a').each(function() {
            const arr = this.title.replace(')', '').split(' (');

            // Do not use mod deleted as dupe answers
            if(arr[1] === 'duplicate') $(this).parent('.reportLink').remove();

            $(this).parent().attr({
                'data-reviewtype' : arr[0],
                'data-reviewtypeid' : getReviewTypeId(arr[0]),
                'data-deltype' : arr[1],
                'data-deltypeid' : getDeleteTypeId(arr[1]),
            });
        });

        const reports = $('.report');
        reports.each(function() {

            const reviews = $(this).find('.reportLink:not(.FIDuser)');
            const reviewsContainer = reviews.first().parent();

            reviews.sort(function(a, b) {
                let n = Number(a.dataset.deltypeid),
                    m = Number(b.dataset.deltypeid);
                if(n == m) return 0;
                return n > m ? 1 : -1;

            }).sort(function(a, b) {
                let n = Number(a.dataset.reviewtypeid),
                    m = Number(b.dataset.reviewtypeid);
                if(n == m) return 0;
                return n > m ? 1 : -1;

            }).detach().appendTo(reviewsContainer);
        });
    }


    function showBanLinks() {

        const reports = $('.report').not('.is-review-banned');
        reports.each(function() {

            const userlink = $(this).find('.FIDuser a').last();
            const uid = userlink.attr('href').match(/\d+/)[0];

            const reviews = $(this).find('.reportLink:not(.FIDuser) a');
            const reviewLinks = reviews.get().map(el => el.href.split('/review/')[1]).join(';');

            $(this).find('.FIDdeletedReviews').append(`<div><a href="https://stackoverflow.com/admin/review/bans#${uid}|${reviewLinks}" target="_blank">Ban user</a></div>`);
        });
    }


    function doPageload() {

        getUsersInfo();
        sortReports();
        showBanLinks();
    }


    function appendStyles() {

        var styles = `
<style>
.is-review-banned {
    opacity: 0.7;
}
a.reviewban-count,
a.reviewban-link,
span.reviewban-ending {
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
span.reviewban-ending {
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
span.reviewban-ending.warning {
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
