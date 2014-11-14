'use strict';

/**
 * based on buggy Angucomplete
 */
angular.module('angucomplete', [])
  .directive('angucomplete', ['$timeout', function($timeout) {
    return {
      restrict : 'EA',
      scope : {
        'id' : '@id',
        'placeholder' : '@placeholder',
        'selectedObject' : '=selectedobject',
        'dataField' : '@datafield',
        'titleField' : '@titlefield',
        'descriptionField' : '@descriptionfield',
        'inputClass' : '@inputclass',
        'userPause' : '@pause',
        'localData' : '=localdata',
        'searchFields' : '@searchfields',
        'minLengthUser' : '@minlength',
        'matchClass' : '@matchclass',
        'searchText' : '@searchtext',
        'noResultText' : '@noresulttext',
        'limit' : '@limit',
        'joinTitlesChar' : '@jointitleschar',
      },
      template :
        '<div class="angucomplete-holder">' +
          '<input id="{{id}}_value" ng-model="searchStr" type="text" placeholder="{{placeholder}}" class="{{inputClass}}" ' +
                 'onmouseup="this.select();" ng-focus="resetHideResults()" ng-blur="hideResults()"/>' +
          '<div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-if="showDropdown && searchStr && searchStr.length > 0" role="navigation">' +
            '<div class="angucomplete-searching" ng-show="searching">{{searchText}}</div>' +
            '<div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)">{{noResultText}}</div>' +
            '<div class="angucomplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ng-mouseover="hoverRow()"' +
                 'ng-class="{\'angucomplete-selected-row\': $index === currentIndex}">' +
              '<div ng-if="imageField" class="angucomplete-image-holder">' +
                '<img ng-if="result.image" ng-src="{{result.image}}" class="angucomplete-image"/>' +
                '<div ng-if="!result.image" class="angucomplete-image-default"></div>' +
              '</div>' +
            '<div class="angucomplete-title">' +
              '<span ng-bind-html="result.title"></span>' +
            '</div>' +
            '<div ng-if="result.description" class="angucomplete-description">' +
              '<span ng-bind-html="result.description"></span>' +
            '</div>' +
          '</div>' +
        '</div>',
      link : function($scope, elem) {
        var lastSearchTerm = null;
        var searchTimer = null;
        var hideTimer = null;
        var pause = 500;
        var minLength = 3;
        var limit = 5;
        var titleFields = [];
        var matchClass = 'match';
        var joinTitlesChar = ' – ';
        var searchFields = $scope.searchFields.split(',');
        
        $scope.currentIndex = null;
        $scope.searching = false;
        $scope.searchStr = null;
        
        if ($scope.minLengthUser) {
          minLength = $scope.minLengthUser;
        }
        if ($scope.userPause) {
          pause = $scope.userPause;
        }
        if ($scope.titleField) {
          titleFields = $scope.titleField.split(',');
        }
        if ($scope.limit) {
          limit = $scope.limit;
        }
        if ($scope.matchClass) {
          matchClass = $scope.matchClass;
        }
        if ($scope.joinTitlesChar) {
          joinTitlesChar = $scope.joinTitlesChar;
        }
        
        var isNewSearchNeeded = function(newTerm, oldTerm) {
          return newTerm.length >= minLength && newTerm !== oldTerm;
        };
        
        var replaceMatchInValue = function(value, re, match) {
          return value.replace(re, '<span class="' + $scope.matchClass + '">' + match[0] + '</span>');
        };
        
        var processResults = function(responseData, str) {
          $scope.results = [];
          if (responseData && responseData.length > 0) {
            var re = new RegExp(str, 'i');
            var titles, title, match, item;
            var processTitleField = function(titleField) {
              title = item[titleField];
              if (!match) {
                match = title.match(re);
                if (match) {
                  title = replaceMatchInValue(title, re, match);
                }
              }
              titles.push(title);
            };
            for (var i = 0; i < responseData.length; i++) {
              item = responseData[i];
              titles = [];
              match = undefined;
              angular.forEach(titleFields, processTitleField);
              var description = '';
              if ($scope.descriptionField) {
                description = item[$scope.descriptionField];
                if (!match) {
                  match = description.match(re);
                  if (match) {
                    description = replaceMatchInValue(description, re, match);
                  }
                }
              }
              titles[0] = '<span class="name">' + titles[0] + '</span>';
              $scope.results.push({
                title : titles.join(' – '),
                description : description,
                image : '',
                name : item[titleFields[0]],
                originalObject : item
              });
            }
          }
        };
        
        var searchTimerComplete = function(str) {
          if (str.length >= minLength) {
            var matches = [], match, item;
            str = str.toLowerCase();
            for (var i = 0; i < $scope.localData.length && matches.length < limit; i++) {
              item = $scope.localData[i];
              match = false;
              for (var j = 0; j < searchFields.length && !match; j++) {
                match = item[searchFields[j]].toLowerCase().indexOf(str) >= 0;
              }
              if (match) {
                matches.push(item);
              }
            }
            $scope.searching = false;
            processResults(matches, str);
          }
        };
        
        
        $scope.hideResults = function() {
          hideTimer = $timeout(function() {
            $scope.showDropdown = false;
          }, pause);
        };
        
        $scope.resetHideResults = function() {
          if (hideTimer) {
            $timeout.cancel(hideTimer);
          }
        };
              
        $scope.hoverRow = function(index) {
          $scope.currentIndex = index;
        };
              
        var keyPressed = function(event) {
          if (!(event.which === 38 || event.which === 40)) {
            if (!$scope.searchStr) {
              $scope.showDropdown = false;
              lastSearchTerm = null;
            } else if (isNewSearchNeeded($scope.searchStr, lastSearchTerm) ||
                (event.which === 13 && ($scope.currentIndex === undefined || $scope.currentIndex < 0))) {
              lastSearchTerm = $scope.searchStr;
              $scope.showDropdown = true;
              $scope.currentIndex = 0;
              $scope.results = [];
              if (searchTimer) {
                $timeout.cancel(searchTimer);
              }
              $scope.searching = true;
              searchTimer = $timeout(function() {
                searchTimerComplete($scope.searchStr);
              }, pause);
            }
          } else {
            event.preventDefault();
          }
        };
        
        $scope.selectResult = function(result) {
          lastSearchTerm = null;
          $scope.searchStr = result.name;
          $scope.selectedObject = result;
          $scope.showDropdown = false;
          $scope.results = [];
        };
        
        var inputField = elem.find('input');
        inputField.on('keyup', keyPressed);
        elem.on('keyup', function(event) {
          if (event.which === 40) {
            if ($scope.results && $scope.results.length > 0) {
              if ($scope.currentIndex + 1 < $scope.results.length) {
                $timeout(function() {
                  $scope.currentIndex++;
                }, 0);
              } else {
                $timeout(function() {
                  $scope.currentIndex = 0;
                }, 0);
              }
              event.preventDefault();
              event.stopPropagation();
            }
          } else if (event.which === 38) {
            if ($scope.results && $scope.results.length > 0) {
              if ($scope.currentIndex > 0) {
                $timeout(function() {
                  $scope.currentIndex--;
                }, 0, true);
              } else {
                $timeout(function() {
                  $scope.currentIndex = $scope.results.length - 1;
                }, 0);
              }
              event.preventDefault();
              event.stopPropagation();
            }
          } else if (event.which === 13) {
            if ($scope.results && $scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
              $timeout(function() {
                $scope.selectResult($scope.results[$scope.currentIndex]);
              }, 0);
            } else {
              $timeout(function() {
                $scope.results = [];
              }, 0);
            }
            event.preventDefault();
            event.stopPropagation();
          } else if (event.which === 27) {
            $timeout(function() {
              $scope.results = [];
              $scope.showDropdown = false;
            }, 0);
          } else if (event.which === 8) {
            $timeout(function() {
              $scope.selectedObject = null;
            }, 0);
          }
        });
      }
    };
  }]);