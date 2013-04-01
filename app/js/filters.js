'use strict';

/* Filters */
angular.module('bucketListApp.filters', [])
    .filter("formatDateFromNow", function() {
        return function(input) {
            return moment(input).fromNow();
        }
    })
    .filter("formatBytes", function() {
        return function(input) {
            // moment.lang(this.$parent.locale);
            //moment.lang('en');
            return numeral(input).format('0 b');
        }
    });
