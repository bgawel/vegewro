'use strict';

angular.module('vegewroApp')
  .factory('news', ['$q', 'fb', 'backend', function($q, fb, backend) {
    
    function hasFbCacheExpired(now, timestamp, cacheFor) {
      return now - timestamp > cacheFor;
    }
    
    function readFbFeeds(fbFeedsSnapshot, fbFeedsToCheck, config) {
      var deferred = $q.defer();
      var now = new Date().getTime();
      if (hasFbCacheExpired(now, fbFeedsSnapshot.timestamp, config.cacheFeedsFor)) {
        fb.fetchLastPosts(fbFeedsToCheck, config.fbToken, config.fbPostsNoOlderThan).then(function(fbFeeds) {
          if (fbFeeds && fbFeeds.length > 0) {
            deferred.resolve(fbFeeds);
            backend.save('news/fbFeeds', {timestamp: now, data: fbFeeds});
          } else {
            deferred.resolve(FbUtils.deserializeFeeds(fbFeedsSnapshot.data));
          }
        });
      } else {
        deferred.resolve(FbUtils.deserializeFeeds(fbFeedsSnapshot.data));
      }
      return deferred.promise;
    }
    
    function readFixedFeeds(fixedFeeds) {
      return FbUtils.deserializeFeeds(fixedFeeds, function(feed) {
        feed.fixed = true;
      });
    }
    
    return {
      read : function(newsSnapshot, fbFeedsToCheck, config) {
        return readFbFeeds(newsSnapshot.fbFeeds, fbFeedsToCheck, config).then(function(feeds) {
          if (newsSnapshot.fixed) {
            feeds = feeds.concat(readFixedFeeds(newsSnapshot.fixed));
          }
          return feeds;
        });
      }
    };
  }]);