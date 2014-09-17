'use strict';

angular.module('vegewroApp')
  .factory('fbUseWorker', [function() {
        
    return {
      fetchLastPosts : function(fbFeeds, token, postsNoOlderThan, deferred) {
        $.Hive.create({
          worker: 'workers/fbFetchPostsWorker.min.js',
          
          created: function() {
            $($.Hive.get(0)).send({
              fbFeeds: fbFeeds,
              token: token,
              postsNoOlderThan: postsNoOlderThan
            });
          },
          
          receive: function (data) {
            deferred.resolve(data.feeds);
          }
        });
      }
    };
  }]);