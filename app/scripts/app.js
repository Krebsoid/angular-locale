'use strict';

/**
 * @ngdoc overview
 * @name app
 * @description
 * # app
 *
 * Main module of the application.
 */
angular
    .module('app', ['LocaleModule'], function(LocaleProvider) {
        LocaleProvider.setAvailableLocales([
            {name: 'Deutsch', value: 'de_DE'},
            {name: 'English', value: 'en_GB'},
            {name: 'Espanol', value: 'es_ES'}
        ]);
    })

    .run(['Locale', function(Locale) {
        Locale.initLocale();
    }]);