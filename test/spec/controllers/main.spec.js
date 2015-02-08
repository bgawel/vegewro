'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('vegewroApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should initialize feedsLoading with true', function () {
    expect(scope.feedsLoading).toBe(true);
  });
});
