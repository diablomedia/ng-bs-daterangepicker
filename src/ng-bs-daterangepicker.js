/**
 * @license ng-bs-daterangepicker v0.0.4
 * (c) 2013 Luis Farzati http://github.com/luisfarzati/ng-bs-daterangepicker
 * License: MIT
 */
(function (angular) {
'use strict';

angular.module('ngBootstrap', []).directive('input', function ($compile, $parse) {
    return {
        restrict: 'E',
        require: 'ngModel',
        link: function ($scope, $element, $attributes, ngModel) {
            if ($attributes.type !== 'daterange' || ngModel === null) {
                return;
            }

            var options = {};
            // This options object is passed to the datepicker's constructor, should match
            // options defined here: http://www.daterangepicker.com/#options
            options.minDate = $attributes.minDate && moment($attributes.minDate);
            options.maxDate = $attributes.maxDate && moment($attributes.maxDate);
            options.dateLimit = $attributes.limit && moment.duration.apply(this, $attributes.limit.split(' ').map(function (elem, index) { return index === 0 && parseInt(elem, 10) || elem; }) );
            options.timeZone = $attributes.timeZone && $parse($attributes.timeZone)($scope);
            options.showDropdowns = ($attributes.showDropdowns == 'true' || $attributes.showDropdowns === true);
            options.showWeekNumbers = ($attributes.showWeekNumbers == 'true' || $attributes.showWeekNumbers === true);
            options.timePicker = ($attributes.timePicker == 'true' || $attributes.timePicker === true);
            options.timePickerIncrement = parseInt($attributes.timePickerIncrement, 10);
            options.timePicker12Hour = ($attributes.timePicker12Hour == 'true' || $attributes.timePicker12Hour === true);
            options.timePickerSeconds = ($attributes.timePickerSeconds == 'true' || $attributes.timePickerSeconds === true);
            options.ranges = $attributes.ranges && $parse($attributes.ranges)($scope);
            options.opens = $attributes.opens && $parse($attributes.opens)($scope) || 'right';
            options.drops = $attributes.drops && $parse($attributes.drops)($scope) || 'down';
            options.buttonClasses = $attributes.buttonClasses || ['btn', 'btn-small'];
            options.applyClass = $attributes.applyClass || '';
            options.cancelClass = $attributes.cancelClass || '';
            options.format = $attributes.format || 'YYYY-MM-DD';
            options.separator = ' - ';
            if ($attributes.$attr.separator) {
                // Allows spaces on outside of separator, otherwise angular trims them off
                options.separator = $element.attr($attributes.$attr.separator) || options.separator;
            }
            options.singleDatePicker = ($attributes.singleDatePicker == 'true' || $attributes.singleDatePicker === true);
            options.locale = $attributes.locale && $parse($attributes.locale)($scope)|| {};
            options.parentEl = ($attributes.parentEl && angular.element($attributes.parentEl)) || null;

            var condenseSameDay = ($attributes.condenseSameDay == 'true' || $attributes.condenseSameDay === true);
            var initialized = false;

            function momentify (date){
                return moment.isMoment(date) ? moment(date) : date;
            }

            function format(date) {
                return date.format(options.format);
            }

            function formatted(dates) {
                if (condenseSameDay === true && angular.equals(format(dates.startDate), format(dates.endDate))) {
                    return format(dates.startDate);
                } else {
                    return [format(dates.startDate), format(dates.endDate)].join(options.separator);
                }
            }

            ngModel.$render = function () {
                if (!ngModel.$modelValue || !ngModel.$modelValue.startDate) {
                    return;
                }
                $element.val(formatted(ngModel.$modelValue));
            };

            ngModel.$parsers.push(function (value) {
                if (value.startDate) {
                    return value;
                } else {
                    var parts = value.split(options.separator);

                    return {startDate: moment(parts[0], options.format), endDate: moment(parts[1], options.format)};
                }

                ngModel.$rollbackViewValue();
            });

            ngModel.$formatters.push(function (value) {
                if (value.startDate) {
                    return formatted(value);
                }
            });

            $scope.$watch($attributes.ngModel, function (modelValue, oldModelValue) {
                if (!modelValue || !modelValue.startDate) {
                    return;
                }

                $element.data('daterangepicker').setStartDate(momentify(modelValue.startDate));
                $element.data('daterangepicker').setEndDate(momentify(modelValue.endDate));
                $element.data('daterangepicker').updateView();
                $element.data('daterangepicker').updateCalendars();
                $element.data('daterangepicker').updateInputText();

                ngModel.$render();
            });

            // Make sure we remove our generated picker element when the scope is destroyed
            // so that we don't end up re-creating another, and another, and another
            $scope.$on('$destroy', function () {
                $element.data('daterangepicker').remove();
            });

            $element.daterangepicker(options);
        }
    };
});

})(angular);
