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
        veganOnly: 'Wegańskie jedzenie w mieście',
        vege: 'Wegetariańskie jedzenie w mieście',
        products: 'Vege sklepy',
        showOnMap: 'Wyświetl na mapie',
        storesWarning: 'Uwaga: niektóre sklepy oferują także produkty niewegetariańskie'
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
        veganOnly: 'Vegan places to eat',
        vege: 'Vegetarian places to eat',
        products: 'Vege stores',
        showOnMap: 'Display on map',
        storesWarning: 'Be careful: some shops offer also non-vegetarian products'
      }
    };
  }]);