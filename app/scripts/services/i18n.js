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
        showOnMap: 'Pokaż miejsce na mapie',
        storesWarning: 'Uwaga: niektóre sklepy oferują także produkty niewegetariańskie',
        map: 'mapa',
        mapFilters: 'filtry mapy',
        news: 'wiadomości',
        bNews: 'Wiadomości',
        loading: 'Pobieranie...'
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
        showOnMap: 'Show place on map',
        storesWarning: 'Be careful, some shops offer also non-vegetarian products',
        map: 'map',
        mapFilters: 'map\'s filters',
        news: 'news',
        bNews: 'News',
        loading: 'Loading...'
      }
    };
  }]);