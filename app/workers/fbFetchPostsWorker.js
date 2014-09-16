'use strict';

importScripts('/ext_components/jquery-hive/jquery.hive.pollen.min.js');
importScripts('/int_components/fb/fbUtils.min.js');

$(function (config) {
  
  var fetchedFeeds = [];
  var feedsToCheck = config.fbFeeds;
  var numberOfFeedsToCheck = feedsToCheck.length;
  var token = config.token;
  var postsNoOlderThan = config.postsNoOlderThan;
  var now = new Date();
  
  var sendResultIfFinished = function() {
    if (fetchedFeeds.length === numberOfFeedsToCheck) {
      $.send( {feeds: FbUtils.getTransformedFeedsWithPosts(feedsToCheck, fetchedFeeds)} );
    }
  };
  
  var fetchLastPostsForFbFeed = function(fbName) {
    $.ajax.get({
      url: FbUtils.postsUrl(fbName, token),
      dataType: 'json',
      success: function(data) {
        fetchedFeeds.push(FbUtils.collectYoungPosts(fbName, data.data, now, postsNoOlderThan));
        sendResultIfFinished();
      }
    });
  };
  
  for (var i=0; i<numberOfFeedsToCheck; ++i) {
    fetchLastPostsForFbFeed(feedsToCheck[i].fb);
  }
});