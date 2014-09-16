'use strict';

angular.module('vegewroApp')
  .factory('fb', ['$http', 'script', '$q', 'fbUseWorker', function($http, script, $q, fbUseWorker) {
    
    function fetchLastPostsForFbFeed(fbName, token, postsNoOlderThan, now) {
      return $http.get(FbUtils.postsUrl(fbName, token)).then(function(result) {
        return FbUtils.collectYoungPosts(fbName, result.data.data, now, postsNoOlderThan);
      }, function() {
        console.log('Error while reading post for ' + fbName);
        return undefined;
      });
    }
    
    function fetchLastPostsForFbFeeds(fbFeeds, token, postsNoOlderThan) {
      var fetched = [];
      var now = new Date();
      angular.forEach(fbFeeds, function(feed) {
        fetched.push(fetchLastPostsForFbFeed(feed.fb, token, postsNoOlderThan, now));
      });
      return fetched;
    }
    
    function fetchLastPostsDefault(fbFeeds, token, postsNoOlderThan, deferred) {
      $q.all(fetchLastPostsForFbFeeds(fbFeeds, token, postsNoOlderThan)).then(function(fetchedFbFeeds) {
        deferred.resolve(FbUtils.getTransformedFeedsWithPosts(fbFeeds, fetchedFbFeeds));
      });
    }
    
    return {
      loadSdk : function(appId, locale) {
        script.getScript('//connect.facebook.net/' + locale + '/sdk.js').then(function(){
          FB.init({appId: appId, xfbml: true, version: 'v2.0'});
        });
      },
      
      makeAccountLink: function(uid) {
        return FbUtils.makeAccountLink(uid);
      },
      
      fetchLastPosts : function(fbFeeds, token, postsNoOlderThan) {
        var deferred = $q.defer();
        if (typeof(Worker) !== 'undefined') {
          fbUseWorker.fetchLastPosts(fbFeeds, token, postsNoOlderThan, deferred);
        } else {
          fetchLastPostsDefault(fbFeeds, token, postsNoOlderThan, deferred);
        }
        return deferred.promise;
      }
    };
  }]);