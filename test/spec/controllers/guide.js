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

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
