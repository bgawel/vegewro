'use strict';

angular.module('vegewroApp')
  .factory('locale', ['$rootScope', '$window', '$timeout', '$location', '$routeParams', 'i18n',
                      function($rootScope, $window, $timeout, $location, $routeParams, i18n) {

    var supportedLangs = ['en', 'pl'];
    var langToLocale = {'en': 'en_US', 'pl': 'pl_PL'};
    var defaultLang = supportedLangs[0];
    var fallbackLang = supportedLangs[1];

    function isSupportedLang(lang) {
      return supportedLangs.indexOf(lang) >= 0;
    }
    
    function isBlank(value) {
      return !value || value.trim().length === 0;
    }
    
    function detectUserLocale() {
      // see http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
      return $window.navigator.userLanguage || $window.navigator.language;
    }
    
    function detectUserLang() {
      var locale = detectUserLocale();
      if (locale) {
        return locale.split('-')[0];
      }
    }
    
    function determineUserLang() {
      var lang = detectUserLang();
      return isSupportedLang(lang) ? lang : defaultLang;
    }
    
    function getLang(urlLang) {
      return isSupportedLang(urlLang) ? urlLang : determineUserLang();
    }
    
    function changePathForLang(lang) {
      $location.path('/' + lang, false);
    }
    
    $rootScope.changeLang = function(lang) {
      changePathForLang(lang);
      $rootScope.reload();
    };
    
    var lang = $rootScope.lang = getLang($routeParams.lang);
    $rootScope.locale = langToLocale[lang];
    $rootScope.i18n = i18n[lang];
    changePathForLang(lang === fallbackLang ? '' : lang);
    
    return {
      valueFor : function(fromObject) {
        var value = fromObject[$rootScope.lang];
        if (isBlank(value)) {
          value = fromObject[defaultLang];
          if (isBlank(value)) {
            value = fromObject[fallbackLang];
          }
        }
        return value;
      }
    };
  }]);