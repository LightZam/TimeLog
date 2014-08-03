angular.module("ui.bootstrap.zam.calendar", ["ui.bootstrap.position", "ui.bootstrap.dialog", "ui.bootstrap.calendar"]);
angular.module('ui.bootstrap.transition', [])

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
.factory('$transition', ['$q', '$timeout', '$rootScope',
    function($q, $timeout, $rootScope) {

        var $transition = function(element, trigger, options) {
            options = options || {};
            var deferred = $q.defer();
            var endEventName = $transition[options.animation ? "animationEndEventName" : "transitionEndEventName"];

            var transitionEndHandler = function(event) {
                $rootScope.$apply(function() {
                    element.unbind(endEventName, transitionEndHandler);
                    deferred.resolve(element);
                });
            };

            if (endEventName) {
                element.bind(endEventName, transitionEndHandler);
            }

            // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
            $timeout(function() {
                if (angular.isString(trigger)) {
                    element.addClass(trigger);
                } else if (angular.isFunction(trigger)) {
                    trigger(element);
                } else if (angular.isObject(trigger)) {
                    element.css(trigger);
                }
                //If browser does not support transitions, instantly resolve
                if (!endEventName) {
                    deferred.resolve(element);
                }
            });

            // Add our custom cancel function to the promise that is returned
            // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
            // i.e. it will therefore never raise a transitionEnd event for that transition
            deferred.promise.cancel = function() {
                if (endEventName) {
                    element.unbind(endEventName, transitionEndHandler);
                }
                deferred.reject('Transition cancelled');
            };

            return deferred.promise;
        };

        // Work out the name of the transitionEnd event
        var transElement = document.createElement('trans');
        var transitionEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'transition': 'transitionend'
        };
        var animationEndEventNames = {
            'WebkitTransition': 'webkitAnimationEnd',
            'MozTransition': 'animationend',
            'OTransition': 'oAnimationEnd',
            'transition': 'animationend'
        };

        function findEndEventName(endEventNames) {
            for (var name in endEventNames) {
                if (transElement.style[name] !== undefined) {
                    return endEventNames[name];
                }
            }
        }
        $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
        $transition.animationEndEventName = findEndEventName(animationEndEventNames);
        return $transition;
    }
]);


// The `$dialogProvider` can be used to configure global defaults for your
// `$dialog` service.
var dialogModule = angular.module('ui.bootstrap.dialog', ['ui.bootstrap.transition']);

dialogModule.controller('MessageBoxController', ['$scope', 'dialog', 'model',
    function($scope, dialog, model) {
        $scope.title = model.title;
        $scope.message = model.message;
        $scope.buttons = model.buttons;
        $scope.close = function(res) {
            dialog.close(res);
        };
    }
])

.controller('TimelogController', ['$scope', '$http', '$filter', 'dialog', 'model',
    function($scope, $http, $filter, dialog, model) {
        var startTime, endTime, startHour, startMin, endHour, endMin;
        startHour = model.startTime != undefined ? model.startTime.split(':')[0] : model.startHour;
        startMin = model.startTime != undefined ? model.startTime.split(':')[1] : model.startMin;
        endHour = model.endTime != undefined ? model.endTime.split(':')[0] : model.endHour;
        endMin = model.endTime != undefined ? model.endTime.split(':')[1] : model.endMin;
        $scope.id = model._id;
        $scope.date = model.date;
        $scope.startHour = startHour;
        $scope.startMin = startMin;
        $scope.endHour = endHour;
        $scope.endMin = endMin;
        $scope.interruptTime = model.interruptTime;
        $scope.description = model.description;
        $scope.isEditMode = model.isEditMode;
        $http.get('/get/eventType').success(function(result) {
            if (result.length > 0) {
                $scope.types = result;
                angular.forEach(result, function(value, key) {
                    if (model.eventType == undefined) {
                        $scope.type = result[0];
                    } else if (value.name == model.eventType.name) {
                        $scope.type = value;
                    }
                });
            }
        });

        $scope.close = function() {
            dialog.close();
        }

        $scope.addTimelog = function() {
            if (!($scope.startHour && $scope.startMin && $scope.endHour && $scope.endMin)) {
                console.log('error');
                $scope.error = 'Please, input the time period and event type.';
                return;
            }
            if ($scope.startHour >= $scope.endHour) {
                if ($scope.startHour == $scope.endHour) {
                    if ($scope.startMin >= $scope.endMin) {
                        $scope.error = 'Please, input correct time period.';
                        return;
                    }
                } else {
                    $scope.error = 'Please, input correct time period.';
                    return;
                }
            }
            if ($scope.startHour > 24 || $scope.startHour < 0 || $scope.endHour > 24 || $scope.endHour < 0 || $scope.startMin > 60 || $scope.startMin < 0 || $scope.endMin > 60 || $scope.endMin < 0) {
                $scope.error = 'Please, input correct time period.';
                return;
            }

            $http.post('add/timelog', getData()).success(function(result) {
                if (result == 'Success') {
                    $scope.close();
                }
            });
        }

        $scope.updateTimelog = function() {
            $http.put('edit/timelog', getData()).success(function(result) {
                if (result == 'Success') {
                    $scope.close();
                }
            });
        }

        $scope.askDelete = function() {

        }

        $scope.deleteTimelog = function() {
            $http.delete('delete/timelog/' + $scope.id).success(function(result) {
                if (result == 'Success') {
                    $scope.close();
                }
            });
        }

        function getData() {
            var data = new Object();
            data._id = $scope.id;
            data.date = $filter('date')($scope.date, 'yyyy-MM-dd');
            data.startTime = [$scope.startHour, $scope.startMin].join(':');
            data.endTime = [$scope.endHour, $scope.endMin].join(':');
            var startDate = [data.date, data.startTime].join(' ');
            var endDate = [data.date, data.endTime].join(' ');
            data.interruptTime = $scope.interrupt == undefined ? 0 : $scope.interrupt;
            var interruptTime = data.interruptTime * 60 * 1000;
            data.deltaTime = calDeltaTime(startDate, endDate, interruptTime);
            data.durationTime = calDurationTime(startDate, endDate, interruptTime);
            data.eventType = $scope.type._id;
            data.description = $scope.description;
            return data;
        }

        function calDeltaTime(startDate, endDate, interruptTime) {
            var dateStart = new Date(startDate).getTime();
            var dateEnd = new Date(endDate).getTime();
            var datePeriod = new Date(dateEnd - dateStart - interruptTime);
            var hour = datePeriod.getUTCHours();
            var min = datePeriod.getUTCMinutes();
            if (hour.toString().length <= 1) {
                hour = [0, hour].join('');
            }
            if (min.toString().length <= 1) {
                min = [0, min].join('');
            }
            return [hour, min].join(':');
        }

        function calDurationTime(startDate, endDate, interruptTime) {
            var dateStart = new Date(startDate);
            var dateEnd = new Date(endDate);
            return dateEnd.getTime() - dateStart.getTime() - interruptTime;
        }
    }
]);

dialogModule.provider("$dialog", function() {

    // The default options for all dialogs.
    var defaults = {
        backdrop: true,
        dialogClass: 'modal',
        backdropClass: 'modal-backdrop',
        transitionClass: 'fade',
        triggerClass: 'in',
        resolve: {},
        backdropFade: false,
        dialogFade: false,
        keyboard: true, // close with esc key
        backdropClick: true // only in conjunction with backdrop=true
        /* other options: template, templateUrl, controller */
    };

    var globalOptions = {};

    var activeBackdrops = {
        value: 0
    };

    this.options = function(value) {
        globalOptions = value;
    };

    // Returns the actual `$dialog` service that is injected in controllers
    this.$get = ["$http", "$document", "$compile", "$rootScope", "$controller", "$templateCache", "$q", "$transition", "$injector",
        function($http, $document, $compile, $rootScope, $controller, $templateCache, $q, $transition, $injector) {

            var body = $document.find('body');

            function createElement(clazz) {
                var el = angular.element("<div>");
                el.addClass(clazz);
                return el;
            }

            function Dialog(opts) {

                var self = this,
                    options = this.options = angular.extend({}, defaults, globalOptions, opts);
                this._open = false;

                this.backdropEl = createElement(options.backdropClass);
                if (options.backdropFade) {
                    this.backdropEl.addClass(options.transitionClass);
                    this.backdropEl.removeClass(options.triggerClass);
                }

                this.modalEl = createElement(options.dialogClass);
                if (options.dialogFade) {
                    this.modalEl.addClass(options.transitionClass);
                    this.modalEl.removeClass(options.triggerClass);
                }

                this.handledEscapeKey = function(e) {
                    if (e.which === 27) {
                        self.close();
                        e.preventDefault();
                        self.$scope.$apply();
                    }
                };

                this.handleBackDropClick = function(e) {
                    self.close();
                    e.preventDefault();
                    self.$scope.$apply();
                };
            }

            // The `isOpen()` method returns wether the dialog is currently visible.
            Dialog.prototype.isOpen = function() {
                return this._open;
            };

            // The `open(templateUrl, controller)` method opens the dialog.
            // Use the `templateUrl` and `controller` arguments if specifying them at dialog creation time is not desired.
            Dialog.prototype.open = function(templateUrl, controller) {
                var self = this,
                    options = this.options;

                if (templateUrl) {
                    options.templateUrl = templateUrl;
                }
                if (controller) {
                    options.controller = controller;
                }

                if (!(options.template || options.templateUrl)) {
                    throw new Error('Dialog.open expected template or templateUrl, neither found. Use options or open method to specify them.');
                }

                this._loadResolves().then(function(locals) {
                    var $scope = locals.$scope = self.$scope = locals.$scope ? locals.$scope : $rootScope.$new();

                    self.modalEl.html(locals.$template);

                    if (self.options.controller) {
                        var ctrl = $controller(self.options.controller, locals);
                        self.modalEl.children().data('ngControllerController', ctrl);
                    }

                    $compile(self.modalEl)($scope);
                    self._addElementsToDom();

                    // trigger tranisitions
                    setTimeout(function() {
                        if (self.options.dialogFade) {
                            self.modalEl.addClass(self.options.triggerClass);
                        }
                        if (self.options.backdropFade) {
                            self.backdropEl.addClass(self.options.triggerClass);
                        }
                    });

                    self._bindEvents();
                });

                this.deferred = $q.defer();
                return this.deferred.promise;
            };

            // closes the dialog and resolves the promise returned by the `open` method with the specified result.
            Dialog.prototype.close = function(result) {
                var self = this;
                var fadingElements = this._getFadingElements();

                if (fadingElements.length > 0) {
                    for (var i = fadingElements.length - 1; i >= 0; i--) {
                        $transition(fadingElements[i], removeTriggerClass).then(onCloseComplete);
                    }
                    return;
                }

                this._onCloseComplete(result);

                function removeTriggerClass(el) {
                    el.removeClass(self.options.triggerClass);
                }

                function onCloseComplete() {
                    if (self._open) {
                        self._onCloseComplete(result);
                    }
                }
            };

            Dialog.prototype._getFadingElements = function() {
                var elements = [];
                if (this.options.dialogFade) {
                    elements.push(this.modalEl);
                }
                if (this.options.backdropFade) {
                    elements.push(this.backdropEl);
                }

                return elements;
            };

            Dialog.prototype._bindEvents = function() {
                if (this.options.keyboard) {
                    body.bind('keydown', this.handledEscapeKey);
                }
                if (this.options.backdrop && this.options.backdropClick) {
                    this.backdropEl.bind('click', this.handleBackDropClick);
                }
            };

            Dialog.prototype._unbindEvents = function() {
                if (this.options.keyboard) {
                    body.unbind('keydown', this.handledEscapeKey);
                }
                if (this.options.backdrop && this.options.backdropClick) {
                    this.backdropEl.unbind('click', this.handleBackDropClick);
                }
            };

            Dialog.prototype._onCloseComplete = function(result) {
                this._removeElementsFromDom();
                this._unbindEvents();

                this.deferred.resolve(result);
            };

            Dialog.prototype._addElementsToDom = function() {
                body.append(this.modalEl);

                if (this.options.backdrop) {
                    if (activeBackdrops.value === 0) {
                        body.append(this.backdropEl);
                    }
                    activeBackdrops.value++;
                }

                this._open = true;
            };

            Dialog.prototype._removeElementsFromDom = function() {
                this.modalEl.remove();

                if (this.options.backdrop) {
                    activeBackdrops.value--;
                    if (activeBackdrops.value === 0) {
                        this.backdropEl.remove();
                    }
                }
                this._open = false;
            };

            // Loads all `options.resolve` members to be used as locals for the controller associated with the dialog.
            Dialog.prototype._loadResolves = function() {
                var values = [],
                    keys = [],
                    templatePromise, self = this;

                if (this.options.template) {
                    templatePromise = $q.when(this.options.template);
                } else if (this.options.templateUrl) {
                    templatePromise = $http.get(this.options.templateUrl, {
                        cache: $templateCache
                    })
                        .then(function(response) {
                            return response.data;
                        });
                }

                angular.forEach(this.options.resolve || [], function(value, key) {
                    keys.push(key);
                    values.push(angular.isString(value) ? $injector.get(value) : $injector.invoke(value));
                });

                keys.push('$template');
                values.push(templatePromise);

                return $q.all(values).then(function(values) {
                    var locals = {};
                    angular.forEach(values, function(value, index) {
                        locals[keys[index]] = value;
                    });
                    locals.dialog = self;
                    return locals;
                });
            };

            function updatePosition() {
                scope.position = $position.position(element);
                scope.position.top = scope.position.top + element.prop('offsetHeight');
            }
            // The actual `$dialog` service that is injected in controllers.
            return {
                // Creates a new `Dialog` with the specified options.
                dialog: function(opts) {
                    return new Dialog(opts);
                },
                // creates a new `Dialog` tied to the default message box template and controller.
                //
                // Arguments `title` and `message` are rendered in the modal header and body sections respectively.
                // The `buttons` array holds an object with the following members for each button to include in the
                // modal footer section:
                //
                // * `result`: the result to pass to the `close` method of the dialog when the button is clicked
                // * `label`: the label of the button
                // * `cssClass`: additional css class(es) to apply to the button for styling
                messageBox: function(title, message, buttons) {
                    return new Dialog({
                        templateUrl: '../template/dialog/timelog-modal.html',
                        controller: 'MessageBoxController',
                        resolve: {
                            model: function() {
                                return {
                                    title: title,
                                    message: message,
                                    buttons: buttons
                                };
                            }
                        }
                    });
                }
            };
        }
    ];
});

angular.module('ui.bootstrap.position', [])
/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
.factory('$position', ['$document', '$window',
    function($document, $window) {

        var mouseX, mouseY;

        $document.bind('mousemove', function mouseMoved(event) {
            mouseX = event.pageX;
            mouseY = event.pageY;
        });

        function getStyle(el, cssprop) {
            if (el.currentStyle) { //IE
                return el.currentStyle[cssprop];
            } else if ($window.getComputedStyle) {
                return $window.getComputedStyle(el)[cssprop];
            }
            // finally try and get inline style
            return el.style[cssprop];
        }

        /**
         * Checks if a given element is statically positioned
         * @param element - raw DOM element
         */

        function isStaticPositioned(element) {
            return (getStyle(element, "position") || 'static') === 'static';
        }

        /**
         * returns the closest, non-statically positioned parentOffset of a given element
         * @param element
         */
        var parentOffsetEl = function(element) {
            var docDomEl = $document[0];
            var offsetParent = element.offsetParent || docDomEl;
            while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || docDomEl;
        };

        return {
            /**
             * Provides read-only equivalent of jQuery's position function:
             * http://api.jquery.com/position/
             */
            position: function(element) {
                var elBCR = this.offset(element);
                var offsetParentBCR = {
                    top: 0,
                    left: 0
                };
                var offsetParentEl = parentOffsetEl(element[0]);
                if (offsetParentEl != $document[0]) {
                    offsetParentBCR = this.offset(angular.element(offsetParentEl));
                    offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
                    offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
                }

                return {
                    width: element.prop('offsetWidth'),
                    height: element.prop('offsetHeight'),
                    top: elBCR.top - offsetParentBCR.top,
                    left: elBCR.left - offsetParentBCR.left
                };
            },

            /**
             * Provides read-only equivalent of jQuery's offset function:
             * http://api.jquery.com/offset/
             */
            offset: function(element) {
                var boundingClientRect = element[0].getBoundingClientRect();
                return {
                    width: element.prop('offsetWidth'),
                    height: element.prop('offsetHeight'),
                    top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop),
                    left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft)
                };
            },

            /**
             * Provides the coordinates of the mouse
             */
            mouse: function() {
                return {
                    x: mouseX,
                    y: mouseY
                };
            }
        };
    }
]);

angular.module('ui.bootstrap.calendar', ['ui.bootstrap.position'])

.constant('calendarConfig', {
    dayFormat: 'dd',
    monthFormat: 'MMMM',
    yearFormat: 'yyyy',
    dayHeaderFormat: 'EEE',
    dayTitleFormat: 'MMMM yyyy',
    monthTitleFormat: 'yyyy',
    showWeeks: true,
    startingDay: 0,
    yearRange: 20,
    minDate: null,
    maxDate: null
})

.controller('CalendarController', ['$scope', '$attrs', '$dialog', 'dateFilter', 'calendarConfig',
    function($scope, $attrs, $dialog, dateFilter, dtConfig) {
        $scope.hours = [
            {'hour12': '0 am', 'hour24': '00'},
            {'hour12': '1 am', 'hour24': '01'},
            {'hour12': '2 am', 'hour24': '02'},
            {'hour12': '3 am', 'hour24': '03'},
            {'hour12': '4 am', 'hour24': '04'},
            {'hour12': '5 am', 'hour24': '05'},
            {'hour12': '6 am', 'hour24': '06'},
            {'hour12': '7 am', 'hour24': '07'},
            {'hour12': '8 am', 'hour24': '08'},
            {'hour12': '9 am', 'hour24': '09'},
            {'hour12': '10 am', 'hour24': '10'},
            {'hour12': '11 am', 'hour24': '11'},
            {'hour12': '12 pm', 'hour24': '12'},
            {'hour12': '1 pm', 'hour24': '13'},
            {'hour12': '2 pm', 'hour24': '14'},
            {'hour12': '3 pm', 'hour24': '15'},
            {'hour12': '4 pm', 'hour24': '16'},
            {'hour12': '5 pm', 'hour24': '17'},
            {'hour12': '6 pm', 'hour24': '18'},
            {'hour12': '7 pm', 'hour24': '19'},
            {'hour12': '8 pm', 'hour24': '20'},
            {'hour12': '9 pm', 'hour24': '21'},
            {'hour12': '10 pm', 'hour24': '22'},
            {'hour12': '11 pm', 'hour24': '23'}
        ];        
        var format = {
            day: getValue($attrs.dayFormat, dtConfig.dayFormat),
            month: getValue($attrs.monthFormat, dtConfig.monthFormat),
            year: getValue($attrs.yearFormat, dtConfig.yearFormat),
            dayHeader: getValue($attrs.dayHeaderFormat, dtConfig.dayHeaderFormat),
            dayTitle: getValue($attrs.dayTitleFormat, dtConfig.dayTitleFormat),
            monthTitle: getValue($attrs.monthTitleFormat, dtConfig.monthTitleFormat)
        },
            startingDay = getValue($attrs.startingDay, dtConfig.startingDay),
            yearRange = getValue($attrs.yearRange, dtConfig.yearRange);

        this.minDate = dtConfig.minDate ? new Date(dtConfig.minDate) : null;
        this.maxDate = dtConfig.maxDate ? new Date(dtConfig.maxDate) : null;

        function getValue(value, defaultValue) {
            return angular.isDefined(value) ? $scope.$parent.$eval(value) : defaultValue;
        }

        function getDaysInMonth(year, month) {
            return new Date(year, month, 0).getDate();
        }

        function getDates(startDate, n) {
            var dates = new Array(n);
            var current = startDate,
                i = 0;
            while (i < n) {
                dates[i++] = new Date(current);
                current.setDate(current.getDate() + 1);
            }
            return dates;
        }

        function makeDate(date, format, isSelected, isSecondary) {
            return {
                date: date,
                label: dateFilter(date, format),
                selected: !! isSelected,
                secondary: !! isSecondary
            };
        }

        this.modes = [{
            name: 'day',
            getVisibleDates: function(date, selected) {
                var year = date.getFullYear(),
                    month = date.getMonth(),
                    firstDayOfMonth = new Date(year, month, 1);
                var difference = startingDay - firstDayOfMonth.getDay(),
                    numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference,
                    firstDate = new Date(firstDayOfMonth),
                    numDates = 0;

                if (numDisplayedFromPreviousMonth > 0) {
                    firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
                    numDates += numDisplayedFromPreviousMonth; // Previous
                }
                numDates += getDaysInMonth(year, month + 1); // Current
                numDates += (7 - numDates % 7) % 7; // Next

                var days = getDates(firstDate, numDates),
                    labels = new Array(7);
                var today = new Date();
                for (var i = 0; i < numDates; i++) {
                    var dt = new Date(days[i]);
                    var isSelected = false;
                    /**
                     * 1. 如果已經被選中則顯示選中的資訊
                     * 2. 如果沒有被選中，則顯示當天的時間
                     */
                     if (selected) {
                        if (selected.getDate() === dt.getDate() && selected.getMonth() === dt.getMonth() && selected.getFullYear() === dt.getFullYear()) {
                            isSelected = true;
                        }
                    } else {
                        if (today.getDate() === dt.getDate() && today.getMonth() === dt.getMonth() && today.getFullYear() === dt.getFullYear()) {
                            isSelected = true;
                        } else {
                            isSelected = false;
                        }
                    }
                    days[i] = makeDate(dt, format.day, isSelected, dt.getMonth() !== month);
                }
                for (var j = 0; j < 7; j++) {
                    labels[j] = dateFilter(days[j].date, format.dayHeader);
                }
                return {
                    objects: days,
                    title: dateFilter(date, format.dayTitle),
                    labels: labels
                };
            },
            compare: function(date1, date2) {
                return (new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()));
            },
            split: 7,
            step: {
                months: 1
            }
        }];

        this.isDisabled = function(date, mode) {
            var currentMode = this.modes[mode || 0];
            return ((this.minDate && currentMode.compare(date, this.minDate) < 0) || (this.maxDate && currentMode.compare(date, this.maxDate) > 0) || ($scope.dateDisabled && $scope.dateDisabled({
                date: date,
                mode: currentMode.name
            })));
        };
    }
])

.directive('calendar', ['dateFilter', '$parse', 'calendarConfig', '$log', '$dialog', '$timeout', '$http', '$filter',
    function(dateFilter, $parse, calendarConfig, $log, $dialog, $timeout, $http, $filter) {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: '../template/calendar/calendar.html',
            scope: {
                dateDisabled: '&'
            },
            require: ['calendar', '?^ngModel'],
            controller: 'CalendarController',
            link: function(scope, element, attrs, ctrls) {
                var calendarCtrl = ctrls[0],
                    ngModel = ctrls[1];

                if (!ngModel) {
                    return; // do nothing if no ng-model
                }

                // Configuration parameters
                var mode = 0,
                    selected = new Date(),
                    showWeeks = calendarConfig.showWeeks;

                if (attrs.showWeeks) {
                    scope.$parent.$watch($parse(attrs.showWeeks), function(value) {
                        showWeeks = !! value;
                        updateShowWeekNumbers();
                    });
                } else {
                    updateShowWeekNumbers();
                }

                if (attrs.min) {
                    scope.$parent.$watch($parse(attrs.min), function(value) {
                        calendarCtrl.minDate = value ? new Date(value) : null;
                        refill();
                    });
                }
                if (attrs.max) {
                    scope.$parent.$watch($parse(attrs.max), function(value) {
                        calendarCtrl.maxDate = value ? new Date(value) : null;
                        refill();
                    });
                }

                function updateShowWeekNumbers() {
                    scope.showWeekNumbers = mode === 0 && showWeeks;
                }

                // Split array into smaller arrays

                function split(arr, size) {
                    var arrays = [];
                    while (arr.length > 0) {
                        arrays.push(arr.splice(0, size));
                    }
                    return arrays;
                }

                function refill(updateSelected) {
                    var date = null,
                        valid = true;

                    if (ngModel.$modelValue) {
                        date = new Date(ngModel.$modelValue);

                        if (isNaN(date)) {
                            valid = false;
                            $log.error('calendar directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
                        } else if (updateSelected) {
                            selected = date;
                        }
                    }
                    ngModel.$setValidity('date', valid);

                    var currentMode = calendarCtrl.modes[mode],
                        data = currentMode.getVisibleDates(selected, date);
                    angular.forEach(data.objects, function(obj) {
                        obj.disabled = calendarCtrl.isDisabled(obj.date, mode);
                    });

                    ngModel.$setValidity('date-disabled', (!date || !calendarCtrl.isDisabled(date)));

                    scope.rows = split(data.objects, currentMode.split);
                    scope.labels = data.labels || [];
                    scope.title = data.title;
                }

                ngModel.$render = function() {
                    refill(true);
                };

                // scope.counter = 0;
                // scope.clicked = true;
                // scope.stopped = false;
                scope.select = function(date) {
                    // showTimelogModal(date);
                    // scope.clicked = $timeout(function() {
                    //     if (scope.stopped == false) {
                    //         scope.counter = scope.counter + 1;
                    //     }
                    // }, 500);
                    var query = ['/get/timelog/', $filter('date')(date, 'yyyy-MM-dd')].join('');
                    $http.get(query).success(function(result) {
                        scope.groups = result;
                    });
                    var dt = new Date(ngModel.$modelValue);
                    dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    ngModel.$setViewValue(dt);
                    refill(true);
                };

                function showTimelogModal(data) {
                    // scope.stopped = $timeout.cancel(scope.clicked);
                    if (timelogModal) timelogModal.close();
                    var diaglogOpts = {
                        backdrop: false,
                        keyboard: true,
                        backdropClick: true,
                        templateUrl: '../template/dialog/timelog-modal.html',
                        controller: 'TimelogController',
                        resolve: {
                            model: function() {
                                return data;
                            }
                        }
                    };
                    timelogModal = $dialog.dialog(diaglogOpts);
                    timelogModal.open().then(function(result) {});
                }

                scope.move = function(direction) {
                    var step = calendarCtrl.modes[mode].step;
                    selected.setMonth(selected.getMonth() + direction * (step.months || 0));
                    selected.setFullYear(selected.getFullYear() + direction * (step.years || 0));
                    refill();
                };

                scope.getWeekNumber = function(row) {
                    return (mode === 0 && scope.showWeekNumbers && row.length === 7) ? getISO8601WeekNumber(row[0].date) : null;
                };

                function getISO8601WeekNumber(date) {
                    var checkDate = new Date(date);
                    checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
                    var time = checkDate.getTime();
                    checkDate.setMonth(0); // Compare with Jan 1
                    checkDate.setDate(1);
                    return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
                }

                var startHour, endHour, startMin, endMin;
                var startX, startY;
                var isDrag; // 判斷是否有在小時區按下滑鼠，如果有則可以拖拉選時間
                scope.cancel = function() {
                    if (timelogModal) timelogModal.close();
                    $('.drag-hour-wrap').css('height', 0).css('top', 0);
                }

                scope.mouseDown = function(event) {
                    isDrag = true;
                    startX = event.pageX - event.offsetX;
                    startY = event.pageY - event.offsetY;
                    startHour = $(event.currentTarget).data('hour');
                    startMin = $(event.currentTarget).data('minute');
                    // $('.drag-hour-wrap').css('height', 0).css('top', 0);
                    scope.dragStyle = {
                        height: 0,
                        top: 0
                    };
                }

                scope.mouseUp = function(event) {
                    if (!isDrag) return;
                    isDrag = false;
                    if (timelogModal) timelogModal.close();
                    showTimelogModal({
                        date: new Date(ngModel.$modelValue),
                        startHour: startHour,
                        startMin: startMin,
                        endHour: endHour,
                        endMin: endMin
                    });
                }

                scope.mouseOver = function(event) {
                    if (!isDrag) return;
                    endHour = $(event.currentTarget).data('hour');
                    endMin = $(event.currentTarget).data('minute');
                    if (endMin == '00') {
                        endMin = '30';
                    } else if (endMin == '30') {
                        endHour = parseInt(endHour) + 1;
                        endMin = '00';
                    }
                    var endY = event.pageY + event.currentTarget.offsetHeight - event.offsetY;
                    var dragHourHint = [startHour, ' : ', startMin, ' - ', endHour, ' : ', endMin].join('');
                    $('.drag-hour-wrap').html(dragHourHint);
                    scope.dragStyle = {
                        top: startY + 'px',
                        left: $(event.currentTarget).position().left + 'px',
                        height: endY - startY + 'px'
                    };
                }   

                scope.getPeriod = function(group) {
                    var startTime = group.startTime.split(':');
                    var endTime = group.endTime.split(':');
                    var startHour = startTime[0], startMin = startTime[1];
                    var endHour = endTime[0], endMin = endTime[1];
                    if (startMin < 30) startMin = '00'; else startMin = '30';
                    if (endMin < 30) endMin = '00'; else endMin = '30';
                    var startSelecter = ['.hour-item div[data-hour="', startHour, '"][data-minute="', startMin, '"]'].join('');
                    var endSelecter = ['.hour-item div[data-hour="', endHour, '"][data-minute="', endMin, '"]'].join('');
                    return {
                        top: $(startSelecter).position().top + 'px',
                        left: $(startSelecter).position().left + 'px',
                        height: ($(endSelecter).position().top - $(startSelecter).position().top) + 'px'
                    }
                }

                scope.editTimelog = function(group) {
                    group.isEditMode = true;
                    showTimelogModal(group);
                }
            }
        };
    }
]);