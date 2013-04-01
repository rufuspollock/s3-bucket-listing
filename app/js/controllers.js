'use strict';

/* Controllers */
function ListController(scope,http) {
    scope.bucket = { url: 'http://files.variaprima.com.s3-ap-southeast-1.amazonaws.com' };
    http.defaults.useXDomain = true;
    http.get(scope.bucket.url)
        .success(function(data) {
            var xml = angular.element(data);
            var s3contents = _.filter(xml.children(),function(x) { return x.tagName=='CONTENTS' });
            scope.bucket.contents = _.chain(s3contents).
                map(function(item) {
                    item = angular.element(item);
                    return {
                        key: item.find('Key').text(),
                        lastModified: item.find('LastModified').text(),
                        size: item.find('Size').text(),
                        etag: item.find('ETag').text()
                    };
                }).
                value();
            scope.bucket.files = _.filter(angular.element(scope.bucket.contents),function(item){ return item.size > 0;});
            scope.bucket.files = _.filter(angular.element(scope.bucket.files),function(item){ return item.key.indexOf("app/") != 0;});
        })
        .error(function(error) {
            alert('There was an error');
            console.log(error);
        });
}
ListController.$inject = ['$scope','$http'];
