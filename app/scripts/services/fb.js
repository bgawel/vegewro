'use strict';

angular.module('vegewroApp')
  .factory('fb', ['$http', '$q', function($http, $q) {
    
    function graphUrl(fbName) {
      return 'https://graph.facebook.com/' + fbName;
    }
    
    function appendToken(url, token) {
      return url + '&access_token=' + token;
    }
    
    function postsUrl(fbName, token) {
      return appendToken(graphUrl(fbName) + '/posts?fields=message', token);
    }
    
    function findAllMessages(data) {
      var messages = [];
      angular.forEach(data, function(post) {
        if (post.message) {
          messages.push(post);
        }
      });
      return messages;
    }

    function isMessageYoungEnough(message, data, now) {
      var dateOfPost = new Date(message.created_time);
      dateOfPost.setTime(dateOfPost.getTime() + 2592000000);  //  + 30 days
      return (dateOfPost.getTime() - now.getTime() > 0);
    }
    
    function isToday(date1, date2) {
      return date1.toDateString() === date2.toDateString();
    }
    
    function collectYoungMessages(data, now) {
      var youngMessages = [];
      var messages = findAllMessages(data);
      if (messages.length > 0 && isMessageYoungEnough(messages[0], data, now)) {
        youngMessages.push(messages[0]);
        for (var i=1; i<messages.length; ++i) {
          if (isToday(now, new Date(messages[i].created_time))) {
            youngMessages.push(messages[i]);
          } else {
            break;
          }
        }
      }
      return youngMessages;
    }
    
    return {
      fetchLastPosts : function(fbName, token) {
        var now = new Date();
        return $http.get(postsUrl(fbName, token)).then(function(result) {
          return collectYoungMessages(result.data.data, now);
        }, function() {
          console.log('Error while reading post for ' + fbName);
          return undefined;
        });
      }
    };
  }]);