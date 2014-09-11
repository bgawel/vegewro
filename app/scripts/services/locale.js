'use strict';

angular.module('vegewroApp')
  .factory('locale', [function() {
    
    var supportedLangs = ['en', 'pl'];
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
      return window.navigator.userLanguage || window.navigator.language;
    }
    
    function detectUserLang() {
      var locale = detectUserLocale();
      if (locale) {
        return locale.split('-')[0];
      }
      return undefined;
    }
    
    function determineUserLang() {
      var lang = detectUserLang();
      return isSupportedLang(lang) ? lang : defaultLang;
    }
    
    return {
      getLang : function(urlLang) {
        return isSupportedLang(urlLang) ? urlLang : determineUserLang();
      },
      
      valueFor : function(fromObject, lang) {
        var value = fromObject[lang];
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