'use strict';

(function() {

  var fbUtils = this.FbUtils = {};
  
  function graphUrl(fbName) {
    return 'https://graph.facebook.com/' + fbName;
  }

  function appendToken(url, token) {
    return url + '&access_token=' + token;
  }

  function isLinkToFbAccount(link, fbName) {
    return link.indexOf(fbUtils.makeAccountLink(fbName)) === 0;
  }

  function messageContainsLink(post) {
    var lastIndexOfLink = post.link.length - 1;
    return post.message.indexOf(post.link[lastIndexOfLink] === '/' ? post.link.substring(0, lastIndexOfLink)
        : post.link) >= 0;
  }
  
  function fbStringToDate(dateString) {
    return new Date(dateString.replace(/\+0000/g, 'Z')); // IE support
  }

  function findAllPostsWithMessage(fbName, data) {
    var posts = [];
    if (data) {
      var post;
      for (var i=0; i<data.length; ++i) {
        post = data[i];
        if (post.message) {
          /*jshint camelcase:false*/
          post.created = fbStringToDate(post.created_time);
          posts.push(post);
        }
      }
    }
    return posts;
  }

  function isPostYoungEnough(post, now, postsNoOlderThan) {
    return post.created.getTime() + postsNoOlderThan > now.getTime();
  }

  function isToday(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  function fixLinkToMessage(post, fbName) {
    if (post.link && (isLinkToFbAccount(post.link, fbName) || messageContainsLink(post))) {
      post.link = '';
    }
    return post;
  }

  fbUtils.postsUrl = function(fbName, token) {
    return appendToken(graphUrl(fbName) + '/posts?fields=message,link', token);
  };
  
  fbUtils.collectYoungPosts = function(fbName, data, now, postsNoOlderThan) {
    var youngPosts = [];
    var posts = findAllPostsWithMessage(fbName, data);
    if (posts.length > 0 && isPostYoungEnough(posts[0], now, postsNoOlderThan)) {
      youngPosts.push(fixLinkToMessage(posts[0], fbName));
      for (var i = 1; i < posts.length; ++i) {
        if (isToday(now, posts[i].created)) {
          youngPosts.push(fixLinkToMessage(posts[i], fbName));
        } else {
          break;
        }
      }
    }
    return youngPosts;
  };

  fbUtils.getTransformedFeedsWithPosts = function(fbFeedsToCheck, fetchedFbFeeds) {
    var output = [], fbPosts, feed;
    for (var i=0; i<fbFeedsToCheck.length; ++i) {
      feed = fbFeedsToCheck[i];
      fbPosts = fetchedFbFeeds[i];
      if (fbPosts && fbPosts.length > 0) {
        feed.time = fbPosts[0].created;
        feed.posts = fbPosts;
        output.push(feed);
      }
    }
    return output;
  };

  fbUtils.makeAccountLink = function(uid) {
    return 'https://www.facebook.com/' + uid;
  };
  
  fbUtils.deserializeFeeds = function(feeds, postProcessing) {
    if (feeds) {
      var feed, post, posts;
      for (var j,i=0; i<feeds.length; ++i) {
        feed = feeds[i];
        posts = feed.posts;
        /*jshint camelcase:false*/
        feed.time = fbStringToDate(posts[0].created_time);
        for (j=0; j<posts.length; ++j) {
          post = posts[j];
          /*jshint camelcase:false*/
          post.created = fbStringToDate(post.created_time);
        }
        if (postProcessing) {
          postProcessing(feed);
        }
      }
      return feeds;
    }
    return [];
  };
/*jshint validthis:true*/
}.call(this));