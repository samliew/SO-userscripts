// ==UserScript==
// @name         Hide unavailable SO badges
// @description  Hide unavailable SO badges on the "unearned" tab page, feature-request https://meta.stackoverflow.com/q/378025
// @homepage     https://github.com/samliew/SO-userscripts
// @author       @samliew
// @version      1.0
//
// @include      https://stackoverflow.com/help/badges?filter=unearned
// @include      https://stackoverflow.com/help/badges?tab=General&filter=unearned
// ==/UserScript==

(function() {
    'use strict';
    
    // Append to tab description text
    $('.page-description').append(`<p><a href="https://github.com/samliew/SO-userscripts/blob/master/HideUnavailableBadges.user.js" target="_blank">A userscript</a> is currently hiding unavailable badges.</p>`);

    // Badges that are currently no longer available on SO
    const unavail = [892, 30, 3108, 1306, 6157, 6158, 7358];

    // For matching the badge URLs in the next line below
    const regexp = new RegExp('\/' + unavail.join('|') + '\/');

    // Remove each row where the badge is not earned and is no longer available
    $('.badge').filter(function() {
      return $(this).parents('.badge-cell-large').find('.badge-earned-check').length == 0 && regexp.test(this.href);
    }).parents('.badge-row').remove();

    // Remove parent row groups without badges
    $('.badge-hierarchy').filter((i,el) => el.children.length == 0).remove();

})();
