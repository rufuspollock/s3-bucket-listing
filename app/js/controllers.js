'use strict';

/* Controllers */
function ListController($scope,$http,$window) {
    var defaultBucketUrl = 'http://s3-bucket-listing-test.s3-ap-southeast-1.amazonaws.com';
    $scope.bucket = {};
    $scope.searchFileName = '';
    $scope.bucket.url = $window.location.protocol=='file:' ? defaultBucketUrl :
        $window.location.protocol + '//' + $window.location.hostname.replace('s3-website','s3');
    getBucketList($scope, $http);
    $scope.updateBucketUrl = function($scope, $http){
        console.log('Bucket URL changed: ' + $scope.bucket.url);
        getBucketList($scope, $http);
    };
    //scope.bucket = { url: 'http://data.openspending.org.s3-eu-west-1.amazonaws.com' };
}
ListController.$inject = ['$scope','$http','$window'];

function getBucketList($scope, $http){
    $scope.success=$scope.error='';
    $http.defaults.useXDomain = true;
    $http.get($scope.bucket.url).
        success(function(data, status, headers, config) {
            var success = {
                statusMessage:'OK',
                statusCode: status,
                headers: headers,
                config: config,
                data: '' // unnecessary?
            };
            $scope.alert=success;
            console.log(success);
            var xml = angular.element(data);
            var s3contents = _.filter(xml.children(),function(x) { return x.tagName=='CONTENTS' });
            var contents = _.chain(s3contents).
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
            var files = _.filter(angular.element(contents),function(item){ return item.size > 0;});
            files = _.filter(angular.element(files),function(item){ return item.key.indexOf("files/") == 0;});
            $scope.bucket.files = files;
        }).
        error(function(data, status, headers, config) {
            var error = {
                statusMessage: 'Error',
                statusCode: status,
                headers: headers,
                config: config,
                data: data
            };
            $scope.alert = error;
            console.log(error);
        });
}