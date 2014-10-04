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
        veganOnly: 'Kuchnia wegańska',
        vege: 'Kuchnia wegańsko-wegetariańska',
        products: 'Sklepy przyjazne wegetarianom',
        showOnMap: 'Pokaż miejsce na mapie',
        storesWarning: 'Uwaga: niektóre sklepy oferują także produkty niewegetariańskie',
        map: 'mapa',
        mapFilters: 'filtry mapy',
        news: 'wiadomości',
        bNews: 'Wiadomości',
        loading: 'Pobieranie...',
        online: 'Sklepy internetowe',
        stationary: 'Sklepy stacjonarne',
        onlyOnlineShop: 'Tylko sklep internetowy',
        stationaryAndOnlineShop: 'Sklep stacjonarny i internetowy',
        search: 'znajdź miejsce',
        searching: 'Wyszukiwanie...',
        noResult: 'Brak wyników wyszukiwania'
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
        veganOnly: 'Vegan cuisine',
        vege: 'Vegan-vegetarian cuisine',
        products: 'Vege-friendly stores',
        showOnMap: 'Show place on map',
        storesWarning: 'Be careful, some shops offer also non-vegetarian products',
        map: 'map',
        mapFilters: 'map\'s filters',
        news: 'news',
        bNews: 'News',
        loading: 'Loading...',
        online: 'Online shopping',
        stationary: 'Stationery shopping',
        onlyOnlineShop: 'Only online shopping',
        stationaryAndOnlineShop: 'Stationery and online shopping',
        search: 'find a place',
        searching: 'Searching...',
        noResult: 'No results found'
      }
    };
  }]);