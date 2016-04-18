/*global WeirdBind*/
/* jshint asi:true*/
var Control = require('can-control');
var QUnit = require('steal-qunit');
var fragment = require('can-util/dom/fragment/');
var domData = require('can-util/dom/data/');
var dev = require('can-util/js/dev/');
var domDispatch = require('can-util/dom/dispatch/');
var domMutate = require('can-util/dom/mutate/');
var canEvent = require('can-event');

QUnit.module('can-control',{
    setup: function(){
        this.fixture = document.getElementById('qunit-fixture');
    }
});

test('data', function () {
	var Things = Control.extend({});
    this.fixture.appendChild( fragment('<div id=\'things\'>div<span>span</span></div>') )

    var things = document.getElementById('things')
	new Things('#things', {});
	new Things('#things', {});

	equal(domData.get.call(things, 'controls')
		.length, 2, 'there are 2 items in the data array');
});

test('parameterized actions', function () {

	var called = false,
		WeirderBind = Control.extend({
			'{parameterized}': function () {
				called = true;
			}
		}),
		a;
    this.fixture.appendChild( fragment('<div id=\'crazy\'></div>'));

	a = document.getElementById('crazy');
	new WeirderBind(a, {
		parameterized: 'sillyEvent'
	});
	domDispatch.call(a, 'sillyEvent');
	ok(called, 'heard the trigger');
});
test('windowresize', function () {
	var called = false,
		WindowBind = Control.extend('', {
			'{window} resize': function () {
				called = true;
			}
		});

	this.fixture.appendChild( fragment( '<div id=\'weird\'>') );
	new WindowBind('#weird');
	domDispatch.call(window, 'resize');
	ok(called, 'got window resize event');
});

test('on', 9, function () {
	var called = false,
		DelegateTest = Control.extend({
			click: function () {}
		}),
		Tester = Control.extend({
			init: function (el, ops) {
				this.on(window, 'click', function (ev) {
					ok(true, 'Got window click event');
				});
				this.on(window, 'click', 'clicked');
				this.on('click', function () {
					ok(true, 'Directly clicked element');
				});
				this.on('click', 'clicked');
			},
			clicked: function (context) {
                console.log(context);
				ok(true, 'Controller action delegated click triggered, too');
			}
		}),
		div = document.createElement('div');
	this.fixture.appendChild( div );

    var rb = new Tester(div);
	this.fixture.appendChild( fragment( '<div id=\'els\'><span id=\'elspan\'><a href=\'javascript://\' id=\'elsa\'>click me</a></span></div>') );

	var dt = new DelegateTest('#els');

	dt.on(document.querySelector('#els span'), 'a', 'click', function () {
		called = true;
	});

	domDispatch.call(document.querySelector('#els a'), 'click');

	ok(called, 'delegate works');

    domMutate.removeChild.call(this.fixture, document.querySelector('#els') );

	domDispatch.call(div, 'click');
    domDispatch.call(window, 'click');

	rb.destroy();
});

test('inherit', function () {
	var called = false,
		Parent = Control.extend({
			click: function () {
				called = true;
			}
		}),
		Child = Parent.extend({});
	this.fixture.appendChild( fragment( '<div id=\'els\'><span id=\'elspan\'><a href=\'#\' id=\'elsa\'>click me</a></span></div>') );

	new Child('#els');
	domDispatch.call(document.querySelector('#els'), 'click');
	ok(called, 'inherited the click method');
});
test('space makes event', 1, function () {

	var Dot = Control.extend({
		' foo': function () {
			ok(true, 'called');
		}
	});
	this.fixture.appendChild( fragment( '<div id=\'els\'><span id=\'elspan\'><a href=\'#\' id=\'elsa\'>click me</a></span></div>') );

	new Dot('#els');
	domDispatch.call(document.querySelector('#els'), 'foo');
});
test('custom events with hyphens work', 1, function () {
	this.fixture.appendChild( fragment( '<div id=\'customEvent\'><span></span></div>') );
	var FooBar = Control.extend({
		'span custom-event': function () {
			ok(true, 'Custom event was fired.');
		}
	});
	new FooBar('#customEvent');
	domDispatch.call(document.querySelector('#customEvent span'), 'custom-event');
});
test('inherit defaults', function () {
	var BASE = Control.extend({
		defaults: {
			foo: 'bar'
		}
	}, {});
	var INHERIT = BASE.extend({
		defaults: {
			newProp: 'newVal'
		}
	}, {});
	ok(INHERIT.defaults.foo === 'bar', 'Class must inherit defaults from the parent class');
	ok(INHERIT.defaults.newProp === 'newVal', 'Class must have own defaults');
	var inst = new INHERIT(document.createElement('div'), {});
	ok(inst.options.foo === 'bar', 'Instance must inherit defaults from the parent class');
	ok(inst.options.newProp === 'newVal', 'Instance must have defaults of it`s class');
});
var bindable = function (b) {
	if (window.jQuery) {
		return b;
	} else {}
	return b;
};
test('on rebinding', 2, function () {
	var first = true;
	var Rebinder = Control.extend({
		'{item} foo': function (item, ev) {
			if (first) {
				equal(item.id, 1, 'first item');
				first = false;
			} else {
				equal(item.id, 2, 'first item');
			}
		}
	});
	var item1 = bindable({
		id: 1
	}),
		item2 = bindable({
			id: 2
		}),
		rb = new Rebinder(document.createElement('div'), {
			item: item1
		});
	canEvent.trigger.call(item1, 'foo');
	rb.options = {
		item: item2
	};
	rb.on();
	canEvent.trigger.call(item2, 'foo');
});
test("actions provide method names", function () {
	var Tester = Control.extend({
		"{item1} foo": "food",
		"{item2} bar": "food",
		food: function (item, ev, data) {
			ok(true, "food called")
			ok(item === item1 || item === item2, "called with an item")
		}
	});

	var item1 = {},
		item2 = {};

	new Tester(document.createElement('div'), {
		item1: item1,
		item2: item2
	});

	canEvent.trigger.call(item1, "foo");
	canEvent.trigger.call(item2, "bar");
});
test("Don\'t bind if there are undefined values in templates", function () {
	Control.processors.proc = function () {
		ok(false, 'This processor should never be called');
	};
	var C = Control.extend({}, {
		'{noExistStuff} proc': function () {}
	});
	var c = new C(document.createElement('div'));
	equal(c._bindings.user.length, 1, 'There is only one binding');
});
test('Multiple calls to destroy', 2, function () {
	var C = Control.extend({
		destroy: function () {
			ok(true);
			Control.prototype.destroy.call(this);
		}
	}),
		div = document.createElement('div'),
		c = new C(div);
	c.destroy();
	c.destroy();
});
// Added support for drag and drop events (#1955)
test("drag and drop events", function() {
	expect(7);
	var DragDrop = Control.extend("", {
		" dragstart": function() {
			ok(true, "dragstart called");
		},
		" dragenter": function() {
			ok(true, "dragenter called");
		},
		" dragover": function() {
			ok(true, "dragover called");
		},
		" dragleave": function() {
			ok(true, "dragleave called");
		},
		" drag": function() {
			ok(true, "drag called");
		},
		" drop": function() {
			ok(true, "drop called");
		},
		" dragend": function() {
			ok(true, "dragend called");
		}
	});
	this.fixture.appendChild( fragment( '<div id="draggable"/>') );
	new DragDrop("#draggable");

    var draggable = document.getElementById("draggable");

	domDispatch.call(draggable, "dragstart");
	domDispatch.call(draggable, "dragenter");
	domDispatch.call(draggable, "dragover");
	domDispatch.call(draggable, "dragleave");
	domDispatch.call(draggable, "drag");
	domDispatch.call(draggable, "drop");
	domDispatch.call(draggable, "dragend");
});
if (dev) {
	test('Control is logging information in dev mode', function () {
		expect(2);
		var oldlog = dev.log;
		var oldwarn = dev.warn;
		dev.log = function (text) {
			equal(text, 'can/control/control.js: No property found for handling {dummy} change', 'Text logged as expected');
		};
		var C = Control.extend({
			'{dummy} change': function () {}
		});
		var instance = new C(document.createElement('div'));
		dev.warn = function (text) {
			equal(text, 'can/control/control.js: Control already destroyed');
		};
		instance.destroy();
		instance.destroy();
		dev.warn = oldwarn;
		dev.log = oldlog;
	});
}
