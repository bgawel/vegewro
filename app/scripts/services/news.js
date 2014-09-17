'use strict';

angular.module('vegewroApp')
  .factory('news', ['$q', 'fb', 'backend', function($q, fb, backend) {
    
    function hasFbCacheExpired(now, timestamp, cacheFor) {
      return now - timestamp > cacheFor;
    }
    
    function deserializeFeeds(feeds, postProcessing) {
      angular.forEach(feeds, function(feed) {
        feed.time = new Date(feed.posts[0].created_time);
        angular.forEach(feed.posts, function(post) {
          post.created = new Date(post.created_time);
        });
        if (postProcessing) {
          postProcessing(feed);
        }
      });
      return feeds;
    }
    
    function readFbFeeds(fbFeedsSnapshot, fbFeedsToCheck, config) {
      var deferred = $q.defer();
      var now = new Date().getTime();
      if (hasFbCacheExpired(now, fbFeedsSnapshot.timestamp, config.cacheFeedsFor)) {
        fb.fetchLastPosts(fbFeedsToCheck, config.fbToken, config.fbPostsNoOlderThan).then(function(fbFeeds) {
          deferred.resolve(fbFeeds);
          backend.save('news/fbFeeds', {timestamp: now, data: fbFeeds});
        });
      } else {
        deferred.resolve(deserializeFeeds(fbFeedsSnapshot.data));
      }
      return deferred.promise;
    }
    
    function readFixedFeeds(fixedFeeds) {
      return deserializeFeeds(fixedFeeds, function(feed) {
        feed.fixed = true;
      });
    }
    
    return {
      read : function(newsSnapshot, fbFeedsToCheck, config) {
        return readFbFeeds(newsSnapshot.fbFeeds, fbFeedsToCheck, config).then(function(feeds) {
          if (!feeds) {
            feeds = [];
          }
          if (newsSnapshot.fixed) {
            feeds = feeds.concat(readFixedFeeds(newsSnapshot.fixed));
          }
          return feeds;
        });
      }
    };
  }]);