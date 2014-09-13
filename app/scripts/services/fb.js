'use strict';

angular.module('vegewroApp')
  .factory('fb', ['$http', 'script', function($http, script) {
    
    function graphUrl(fbName) {
      return 'https://graph.facebook.com/' + fbName;
    }
    
    function appendToken(url, token) {
      return url + '&access_token=' + token;
    }
    
    function postsUrl(fbName, token) {
      return appendToken(graphUrl(fbName) + '/posts?fields=message,link', token);
    }
    
    function makeFbAccountLink(uid) {
      return 'https://www.facebook.com/' + uid;
    }
    
    function isLinkToFbAccount(link, fbName) {
      return link.indexOf(makeFbAccountLink(fbName)) === 0;
    }
    
    function messageContainsLink(post) {
      return post.message.indexOf(post.link) >= 0;
    }
    
    function findAllPostsWithMessage(fbName, data) {
      var posts = [];
      angular.forEach(data, function(post) {
        if (post.message) {
          post.created = new Date(post.created_time);
          posts.push(post);
        }
      });
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
    
    function collectYoungPosts(fbName, data, now, postsNoOlderThan) {
      var youngPosts = [];
      var posts = findAllPostsWithMessage(fbName, data);
      if (posts.length > 0 && isPostYoungEnough(posts[0], now, postsNoOlderThan)) {
        youngPosts.push(fixLinkToMessage(posts[0], fbName));
        for (var i=1; i<posts.length; ++i) {
          if (isToday(now, posts[i].created)) {
            youngPosts.push(fixLinkToMessage(posts[i], fbName));
          } else {
            break;
          }
        }
      }
      return youngPosts;
    }
    
    return {
      loadSdk : function(appId, locale) {
        script.getScript('//connect.facebook.net/' + locale + '/sdk.js').then(function(){
          FB.init({appId: appId, xfbml: true, version: 'v2.0'});
        });
      },
      
      fetchLastPosts : function(fbName, token, postsNoOlderThan) {
        var now = new Date();
        return $http.get(postsUrl(fbName, token)).then(function(result) {
          return collectYoungPosts(fbName, result.data.data, now, postsNoOlderThan);
        }, function() {
          console.log('Error while reading post for ' + fbName);
          return undefined;
        });
      },
      
      makeAccountLink: function(uid) {
        return makeFbAccountLink(uid);
      }
    };
  }]);