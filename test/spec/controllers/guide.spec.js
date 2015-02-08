'use strict';

describe('Controller: GuideCtrl', function () {

  // load the controller's module
  beforeEach(module('vegewroApp'));

  var GuideCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GuideCtrl = $controller('GuideCtrl', {
      $scope: scope
    });
  }));

  it('should fool jshint by using the scope to get rid of warning', function () {
    expect(scope.jshint).toBe('scope is used');
  });
});
