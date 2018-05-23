/* jshint asi:true*/
var Control = require('can-control');
var QUnit = require('steal-qunit');
var fragment = require('can-util/dom/fragment/fragment');
var dev = require('can-log/dev/dev');
var domEvents = require('can-dom-events');
var domMutateNode = require('can-dom-mutate/node');

var SimpleMap = require('can-simple-map');
var DefineMap = require('can-define/map/');
var SimpleObservable = require("can-simple-observable");

QUnit.module('can-control',{
    setup: function(){
        this.fixture = document.getElementById('qunit-fixture');
    }
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
	domEvents.dispatch(a, 'sillyEvent');
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
	domEvents.dispatch(window, 'resize');
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

	domEvents.dispatch(document.querySelector('#els a'), 'click');

	ok(called, 'delegate works');

    domMutateNode.removeChild.call(this.fixture, document.querySelector('#els') );

	domEvents.dispatch(div, 'click');
	domEvents.dispatch(window, 'click');

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
	domEvents.dispatch(document.querySelector('#els'), 'click');
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
	domEvents.dispatch(document.querySelector('#els'), 'foo');
});
test('custom events with hyphens work', 1, function () {
	this.fixture.appendChild( fragment( '<div id=\'customEvent\'><span></span></div>') );
	var FooBar = Control.extend({
		'span custom-event': function () {
			ok(true, 'Custom event was fired.');
		}
	});
	new FooBar('#customEvent');
	domEvents.dispatch(document.querySelector('#customEvent span'), 'custom-event');
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

test('on rebinding', 2, function () {
	var first = true;
	var Rebinder = Control.extend({
		'{item} foo': function (item, ev) {
			if (first) {
				equal(item.get("id"), 1, 'first item');
				first = false;
			} else {
				equal(item.get("id"), 2, 'first item');
			}
		}
	});
	var item1 = new SimpleMap({
		id: 1
	}),
		item2 = new SimpleMap({
			id: 2
		}),
		rb = new Rebinder(document.createElement('div'), {
			item: item1
		});

    item1.dispatch('foo');
	rb.options = {
		item: item2
	};
	rb.on();
	item2.dispatch('foo');
});
test("actions provide method names", function () {
	var item1 = new SimpleMap({});
	var item2 = new SimpleMap({});
	var Tester = Control.extend({
		"{item1} foo": "food",
		"{item2} bar": "food",
		food: function (item, ev, data) {
			ok(true, "food called")
			ok(item === item1 || item === item2, "called with an item")
		}
	});

	new Tester(document.createElement('div'), {
		item1: item1,
		item2: item2
	});
    item1.dispatch("foo");
    item2.dispatch("bar");
});
test("Don\'t bind if there are undefined values in templates", function () {
	var C = Control.extend({}, {
		'{noExistStuff} proc': function () {}
	});
	var c = new C(document.createElement('div'));
	equal(c._bindings.user.length, 1, 'There is only one binding');

	var C2 = Control.extend({
		'{noExistStuff} click': function () {
			ok(false, 'should not fall through to click handler');
		}
	});

	var div = document.createElement('div');
	new C2(div, {});

	domEvents.dispatch(div, "click");
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

	domEvents.dispatch(draggable, "dragstart");
	domEvents.dispatch(draggable, "dragenter");
	domEvents.dispatch(draggable, "dragover");
	domEvents.dispatch(draggable, "dragleave");
	domEvents.dispatch(draggable, "drag");
	domEvents.dispatch(draggable, "drop");
	domEvents.dispatch(draggable, "dragend");
});

test("beforeremove event", function() {
  expect(1);
  var Foo = Control.extend("", {
    "beforeremove": function() {
      ok(true, "beforeremove called");
    }
  });
  var el = fragment('<div id="foo"/>');
  new Foo(el);
  domEvents.dispatch(el, "beforeremove");
});

if (System.env.indexOf('production') < 0) {
	test('Control is logging information in dev mode', function () {
		expect(2);
		var oldlog = dev.log;
		var oldwarn = dev.warn;
		dev.log = function (text) {
			equal(text, 'can-control: No property found for handling {dummy} change', 'Text logged as expected');
		};
		var C = Control.extend({
			'{dummy} change': function () {}
		});
		var instance = new C(document.createElement('div'));
		dev.warn = function (text) {
			equal(text, 'can-control: Control already destroyed', "control destroyed warning");
		};
		instance.destroy();
		instance.destroy();
		dev.warn = oldwarn;
		dev.log = oldlog;
	});
}

test("event handlers should rebind when target is replaced", function () {
	var nameChanges = 0;

	var MyControl = Control.extend("MyControl",{
		"{person.name} first": function () {
			nameChanges++;
		},
		name: function(name) {
			this.options.person.set('name', name);
		}
	});

	var c = new MyControl(document.createElement('div'), {
		person: new SimpleMap({
			name: new SimpleMap({ first: 'Kevin' })
		})
	});

	c.options.person.get('name').set('first', 'Tracy');

	c.name(new SimpleMap({ first: 'Kim' }));

	c.options.person.get('name').get('first', 'Max');

	equal(nameChanges, 2);
});

test("{element} event handling", function() {
	expect(3);
	stop();

	var MyControl = Control.extend({
		"{element} click": function(element){
			if (element === this.element) {
				ok(true, "`{element} click` should catch clicking on the element");
			} else {
				ok(true, "`{element} click` should catch clicking on a child of the element");
			}
		},
		"{element} p click": function(){
			ok(true, "`{element} p click` works");
			start();
		}
	});

	var div = document.createElement('div');
	var p = document.createElement('p');
	div.appendChild(p);

	new MyControl(div, { foo: 'bar' });

	domEvents.dispatch(div, "click");
	domEvents.dispatch(p, "click");
});

test("Passing a Map as options works", function() {
	expect(2);
	stop();

	var MyControl = Control.extend({
		defaults: {
			testEndEvent: 'mouseleave'
		}
	}, {
		'{element} {eventType}': function(){
			ok(true, 'catches handler from options');
		},
		'{element} {testEndEvent}': function(){
			ok(true, 'catches handler from defaults');
			start();
		}
	});
	var map = new SimpleMap({
		eventType: 'click'
	});

	var div = document.createElement('div');

	new MyControl(div, map);

	// change event declared in options map and trigger it
	map.attr('eventType', 'mouseenter');
	domEvents.dispatch(div, 'mouseenter');

	// trigger event from defaults
	domEvents.dispatch(div, 'mouseleave');
});

test("Passing a DefineMap as options works", function() {
	expect(2);
	stop();

	var MyControl = Control.extend({
		defaults: {
			testEndEvent: 'mouseleave'
		}
	}, {
		'{element} {eventType}': function(){
			ok(true, 'catches handler from options');
		},
		'{element} {testEndEvent}': function(){
			ok(true, 'catches handler from defaults');
			start();
		}
	});
	var MyMap = DefineMap.extend({
		eventType: 'string',
		testEndEvent: 'string'
	});

	var map = new MyMap();
	map.eventType = 'click';

	var div = document.createElement('div');

	new MyControl(div, map);

	// change event declared in options map and trigger it
	map.eventType = 'mousenter';
	domEvents.dispatch(div, 'mousenter');

	// trigger event from defaults
	domEvents.dispatch(div, 'mouseleave');
});

test("Creating an instance of a named control without passing an element", function() {

	var MyControl = Control.extend('MyControl');
	try {
		new MyControl();
	}
	catch(e) {
		ok(true, 'Caught an exception');
	}

});

test("Creating an instance of a named control passing a selector", function() {

	this.fixture.appendChild( fragment('<div id=\'my-control\'>d</div>') );

	var MyControl = Control.extend('MyControl');
	var myControlInstance = new MyControl('#my-control');
	ok(myControlInstance.element.classList.contains('MyControl'), "Element has the correct class name");
});

QUnit.test("can watch SimpleObservable", function(){
    var MyControl = Control.extend({
		"{simple}": function(simple, newVal){
			QUnit.equal(newVal, 6);
		}
	});

	var div = document.createElement('div');
    var simple = new SimpleObservable(5);

	new MyControl(div, { simple: simple });

    simple.set(6);
});
