'use strict';

angular.module('LocaleModule', ['LocalStorageModule'])


    .controller('LocaleController', ['$scope', 'Locale', function ($scope, Locale) {
        $scope.language = Locale.activeLocale;

        $scope.changeLocale = function (locale) {
            Locale.changeLocale(locale || $scope.language);
            $scope.language = Locale.activeLocale;
        };
    }])

    .directive('localeWrapper', ['Locale', function (Locale) {
        return {
            link: function (scope, element) {
                scope.language = Locale.getLanguage();
                scope.$watch(
                    function () {
                        return Locale.getLanguage();
                    },
                    function (l1, l2) {
                        element.removeClass(l2);
                        element.addClass(l1);
                    }
                );
            }
        };
    }])

    .directive('localeString', ['Locale', function (Locale) {
        return {
            restrict: 'A',
            scope: {
                localeString: '@localeString',
                localeVariables: '=localeVariables'
            },
            link: function (scope, element, attrs) {
                scope.isTemplate = !!scope.localeVariables;
                angular.extend(scope, attrs.localeVariables);

                scope.$watch(
                    function () {
                        return Locale.getLocale();
                    },
                    function (locale) {
                        if (!scope.isTemplate) {
                            scope.outputString = Object.byString(Localization, attrs.localeString)[locale];
                        }
                        else {
                            scope.outputString = _.template(Object.byString(Localization, attrs.localeString)[locale], scope.localeVariables);
                        }
                    }
                );
            },
            template: '<span data-ng-bind-html="outputString"></span>'
        };
    }])

    .directive('localeTemplate', ['Locale', function (Locale) {
        return {
            restrict: 'A',
            replace: true,
            scope: true,
            link: function (scope, element, attrs) {
                scope.$watch(
                    function () {
                        return Locale.getLocale();
                    },
                    function () {
                        scope.templatePath = './partials/locale/' + Locale.getLanguage() + '/' + attrs.localeTemplate + '.html';
                    }
                );
            },
            template: '<div data-ng-include="templatePath"></div>'
        };
    }])

    .factory('Locale', ['$location', 'localStorageService', function ($location, LocalStorage) {
        return (function () {

            function Locale() {
                this.availableLocales = [
                    {name: 'Deutsch', value: 'de_DE'},
                    {name: 'English', value: 'en_GB'}
                ];
                this.defaultLocale = 'de_DE';
                this.activeLocale = undefined;
            }

            function checkForCookie(Locale) {
                return Locale.findLocale(LocalStorage.cookie.get('language'));
            }

            function checkForBrowserLanguage(Locale) {
                var browserLanguage, foundLanguage;
                // Chrome / Firefox
                if (window.navigator.language) {
                    browserLanguage = window.navigator.language.replace('-', '_');
                    foundLanguage = Locale.findLocale(browserLanguage);
                }
                // IE
                if (window.navigator.userLanguage) {
                    browserLanguage = window.navigator.userLanguage.replace('-', '_');
                    foundLanguage = Locale.findLocale(browserLanguage);
                }
                return foundLanguage;
            }

            function consumeLanguageLink(Locale) {
                var consumedLanguage = Locale.findLocale($location.search().language);
                if (consumedLanguage) {
                    if ($location.$$search.lang) {
                        delete $location.$$search.lang;
                        $location.$$compose();
                    }
                }
                return consumedLanguage;
            }

            function setDefaultLocale(Locale) {
                var defaultLocale = Locale.findLocale(Locale.defaultLocale);
                Locale.changeLocale(defaultLocale.value);
            }

            Locale.prototype.getLocale = function () {
                return this.activeLocale.value;
            };

            Locale.prototype.getLanguage = function () {
                return this.activeLocale.value.substring(0, 2);
            };

            Locale.prototype.getCountry = function () {
                return this.activeLocale.value.substring(3, 5);
            };

            Locale.prototype.findLocale = function (localeShortcut) {
                var foundSupportedLanguage = _.find(this.availableLocales, function (locale) {
                    return locale.value === localeShortcut;
                });
                if (foundSupportedLanguage) {
                    return foundSupportedLanguage;
                }
                else {
                    return undefined;
                }
            };

            Locale.prototype.changeLocale = function (locale) {
                var foundLocale = this.findLocale(locale);
                if (foundLocale) {
                    this.activeLocale = foundLocale;
                    LocalStorage.cookie.add('language', foundLocale.value);
                    LocalStorage.add('language', foundLocale.value);
                }
                else {
                    console.log('Locale ' + locale + ' not available');
                }
            };

            Locale.prototype.initLocale = function () {
                var self = this;
                var consumedLanguage = consumeLanguageLink(self);
                var cookieLanguage = checkForCookie(self);
                var browserLanguage = checkForBrowserLanguage(self);
                if (angular.isDefined(consumedLanguage)) {
                    this.changeLocale(consumedLanguage.value);
                }
                else if (angular.isDefined(cookieLanguage)) {
                    this.changeLocale(cookieLanguage.value);
                }
                else if (angular.isDefined(browserLanguage)) {
                    this.changeLocale(browserLanguage.value);
                }
                else {
                    setDefaultLocale(self);
                }
            };

            return new Locale();

        })();
    }]);