'use strict';

angular.module('vegewroApp')
  .factory('i18n', [function() {
    
    return {
      pl : {
        addresses : 'adresy',
        newPlace: 'zgłoś nowe miejsce',
        newPlaceText: 'Jeśli znasz miejsce, które powinno zostać dodane do mapy, napisz do nas',
        close: 'Zamknij',
        setAll: 'zaznacz wszystkie',
        clearAll: 'odznacz wszystkie',
        loadingMap: 'Ładowanie mapy...',
        filters: 'Filtry',
        bAddresses: 'Adresy',
        from: 'od',
        contact: 'kontakt',
        directions: 'wskazówki dojazdu',
        veganOnly: 'Tylko wegańskie',
        vege: 'Wegańsko-wegetariańskie'
      },
      
      en : {
        addresses : 'addresses',
        newPlace: 'submit a new place',
        newPlaceText: 'If you know about a place, that should be added to this map, write to us',
        close: 'Close',
        setAll: 'set all',
        clearAll: 'clear all',
        loadingMap: 'Loading map...',
        filters: 'Filters',
        bAddresses: 'Addresses',
        from: 'from',
        contact: 'contact',
        directions: 'directions',
        veganOnly: 'Only vegan',
        vege: 'Vegan-vegeterian'
      }
    };
  }]);