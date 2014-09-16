'use strict';

importScripts('/ext_components/jquery-hive/jquery.hive.pollen.min.js');
importScripts('/int_components/fb/fbUtils.min.js');

$(function (config) {
  
  var fetchedFeeds = {};
  var feedsToCheck = config.fbFeeds;
  var numberOfFeedsToCheck = feedsToCheck.length;
  var token = config.token;
  var postsNoOlderThan = config.postsNoOlderThan;
  var now = new Date();
  var successCounter = 0;
  
  var sendResult = function(feeds) {
    $.send({feeds: feeds});
  };
  
  var sendResultIfFinished = function() {
    if (successCounter === numberOfFeedsToCheck) {
      sendResult(FbUtils.getTransformedFeedsWithPosts(feedsToCheck, fetchedFeeds));
    }
  };
  
  var fetchLastPostsForFbFeed = function(fbName, indexOfFeedToCheck) {
    $.ajax.get({
      url: FbUtils.postsUrl(fbName, token),
      dataType: 'json',
      success: function(data) {
        fetchedFeeds[indexOfFeedToCheck] = FbUtils.collectYoungPosts(fbName, data.data, now, postsNoOlderThan);
        sendResultIfFinished(++successCounter);
      }
    });
  };
  
  if (feedsToCheck.length > 0) {
    for (var i=0; i<numberOfFeedsToCheck; ++i) {
      fetchLastPostsForFbFeed(feedsToCheck[i].fb, i);
    }
  } else {
    sendResult([]);
  }
  
});