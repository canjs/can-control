/*can-control@3.0.0-pre.3#can-control*/
define(function (require, exports, module) {
    var Construct = require('can-construct');
    var namespace = require('can-util/namespace');
    var string = require('can-util/js/string');
    var assign = require('can-util/js/assign');
    var isFunction = require('can-util/js/is-function');
    var isArray = require('can-util/js/is-array');
    var each = require('can-util/js/each');
    var dev = require('can-util/js/dev');
    var domData = require('can-util/dom/data');
    var className = require('can-util/dom/class-name');
    var domEvents = require('can-util/dom/events');
    var canEvent = require('can-event');
    var processors;
    require('can-util/dom/dispatch');
    require('can-util/dom/events/delegate');
    var bind = function (el, ev, callback) {
            canEvent.on.call(el, ev, callback);
            return function () {
                canEvent.off.call(el, ev, callback);
            };
        }, slice = [].slice, paramReplacer = /\{([^\}]+)\}/g, delegate = function (el, selector, ev, callback) {
            canEvent.on.call(el, ev, selector, callback);
            return function () {
                canEvent.off.call(el, ev, selector, callback);
            };
        }, binder = function (el, ev, callback, selector) {
            return selector ? delegate(el, selector.trim(), ev, callback) : bind(el, ev, callback);
        }, basicProcessor;
    var Control = Construct.extend({
        setup: function () {
            Construct.setup.apply(this, arguments);
            if (Control) {
                var control = this, funcName;
                control.actions = {};
                for (funcName in control.prototype) {
                    if (control._isAction(funcName)) {
                        control.actions[funcName] = control._action(funcName);
                    }
                }
            }
        },
        _shifter: function (context, name) {
            var method = typeof name === 'string' ? context[name] : name;
            if (!isFunction(method)) {
                method = context[method];
            }
            return function () {
                context.called = name;
                return method.apply(context, [this].concat(slice.call(arguments, 0)));
            };
        },
        _isAction: function (methodName) {
            var val = this.prototype[methodName], type = typeof val;
            return methodName !== 'constructor' && (type === 'function' || type === 'string' && isFunction(this.prototype[val])) && !!(Control.isSpecial(methodName) || processors[methodName] || /[^\w]/.test(methodName));
        },
        _action: function (methodName, options) {
            paramReplacer.lastIndex = 0;
            if (options || !paramReplacer.test(methodName)) {
                var convertedName = options ? string.sub(methodName, this._lookup(options)) : methodName;
                if (!convertedName) {
                    return null;
                }
                var arr = isArray(convertedName), name = arr ? convertedName[1] : convertedName, parts = name.split(/\s+/g), event = parts.pop();
                return {
                    processor: processors[event] || basicProcessor,
                    parts: [
                        name,
                        parts.join(' '),
                        event
                    ],
                    delegate: arr ? convertedName[0] : undefined
                };
            }
        },
        _lookup: function (options) {
            return [
                options,
                window
            ];
        },
        processors: {},
        defaults: {},
        convertElement: function (element) {
            return typeof element === 'string' ? document.querySelector(element) : element;
        },
        isSpecial: function (eventName) {
            return eventName === 'inserted' || eventName === 'removed';
        }
    }, {
        setup: function (element, options) {
            var cls = this.constructor, pluginname = cls.pluginName || cls.shortName, arr;
            this.element = cls.convertElement(element);
            if (pluginname && pluginname !== 'can_control') {
                className.add.call(element, pluginname);
            }
            arr = domData.get.call(this.element, 'controls');
            if (!arr) {
                arr = [];
                domData.set.call(this.element, 'controls', arr);
            }
            arr.push(this);
            this.options = assign(assign({}, cls.defaults), options);
            this.on();
            return [
                this.element,
                this.options
            ];
        },
        on: function (el, selector, eventName, func) {
            if (!el) {
                this.off();
                var cls = this.constructor, bindings = this._bindings, actions = cls.actions, element = this.element, destroyCB = Control._shifter(this, 'destroy'), funcName, ready;
                for (funcName in actions) {
                    if (actions.hasOwnProperty(funcName)) {
                        ready = actions[funcName] || cls._action(funcName, this.options, this);
                        if (ready) {
                            bindings.control[funcName] = ready.processor(ready.delegate || element, ready.parts[2], ready.parts[1], funcName, this);
                        }
                    }
                }
                domEvents.addEventListener.call(element, 'removed', destroyCB);
                bindings.user.push(function (el) {
                    domEvents.removeEventListener.call(el, 'removed', destroyCB);
                });
                return bindings.user.length;
            }
            if (typeof el === 'string') {
                func = eventName;
                eventName = selector;
                selector = el;
                el = this.element;
            }
            if (func === undefined) {
                func = eventName;
                eventName = selector;
                selector = null;
            }
            if (typeof func === 'string') {
                func = Control._shifter(this, func);
            }
            this._bindings.user.push(binder(el, eventName, func, selector));
            return this._bindings.user.length;
        },
        off: function () {
            var el = this.element[0], bindings = this._bindings;
            if (bindings) {
                each(bindings.user || [], function (value) {
                    value(el);
                });
                each(bindings.control || {}, function (value) {
                    value(el);
                });
            }
            this._bindings = {
                user: [],
                control: {}
            };
        },
        destroy: function () {
            if (this.element === null) {
                return;
            }
            var Class = this.constructor, pluginName = Class.pluginName || Class.shortName && string.underscore(Class.shortName), controls;
            this.off();
            if (pluginName && pluginName !== 'can_control') {
                className.remove.call(this.element, pluginName);
            }
            controls = domData.get.call(this.element, 'controls');
            controls.splice(controls.indexOf(this), 1);
            canEvent.dispatch.call(this, 'destroyed');
            this.element = null;
        }
    });
    processors = Control.processors;
    basicProcessor = function (el, event, selector, methodName, control) {
        return binder(el, event, Control._shifter(control, methodName), selector);
    };
    each([
        'change',
        'click',
        'contextmenu',
        'dblclick',
        'keydown',
        'keyup',
        'keypress',
        'mousedown',
        'mousemove',
        'mouseout',
        'mouseover',
        'mouseup',
        'reset',
        'resize',
        'scroll',
        'select',
        'submit',
        'focusin',
        'focusout',
        'mouseenter',
        'mouseleave',
        'touchstart',
        'touchmove',
        'touchcancel',
        'touchend',
        'touchleave',
        'inserted',
        'removed',
        'dragstart',
        'dragenter',
        'dragover',
        'dragleave',
        'drag',
        'drop',
        'dragend'
    ], function (v) {
        processors[v] = basicProcessor;
    });
    module.exports = namespace.Control = Control;
});