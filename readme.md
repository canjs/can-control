# can-control

[![Build Status](https://travis-ci.org/canjs/can-control.png?branch=master)](https://travis-ci.org/canjs/can-control)




- <code>[__can-control__ ](#can-control-)</code>
  - <code>[Control( [staticProperties,] instanceProperties )](#control-staticproperties-instanceproperties-)</code>
  - <code>[new Control( element, options )](#new-control-element-options-)</code>
    - _static_
      - <code>[Control.extend([staticProperties,] instanceProperties)](#controlextendstaticproperties-instanceproperties)</code>
      - <code>[defaults Object](#defaults-object)</code>
      - <code>[processors Object\<[can.Control.processor](#-functionelement-eventname-selector-handler-undefined)(element, eventName, selector, handler, undefined)\>](#processors-objectcancontrolprocessor-functionelement-eventname-selector-handler-undefinedelement-eventname-selector-handler-undefined)</code>
    - _prototype_
      - <code>[control.destroy()](#controldestroy)</code>
      - <code>[element can.NodeList](#element-cannodelist)</code>
      - <code>[control.on([el,] selector, eventName, func)](#controlonel-selector-eventname-func)</code>
      - <code>[control.on()](#controlon)</code>
      - <code>[options Object](#options-object)</code>
      - <code>[control.setup(element, options)](#controlsetupelement-options)</code>

## API


## <code>__can-control__ </code>
Create organized, memory-leak free, rapidly performing, stateful controls with declarative event binding. Use `can.Control` to create UI 
controls like tabs, grids, and context menus,
and organize them into higher-order business rules with
[can.route]. It can serve as both a traditional view and a traditional controller.



### <code>Control( [staticProperties,] instanceProperties )</code>


Create a new, extended, control constructor 
function. This functionality is inherited from [can.Construct] and is deprecated in favor of using 
[can.Control.extend]. 


1. __staticProperties__ <code>{Object}</code>:
  An object of properties and methods that are added the control constructor 
  function directly. The most common property to add is [can.Control.defaults].
  
1. __instanceProperties__ <code>{Object}</code>:
  An object of properties and methods that belong to 
  instances of the `Control` constructor function. These properties are added to the
  control's `prototype` object. Properties that
  look like event handlers (ex: `"click"` or `"li mouseenter"`) are setup
  as event handlers (see [Listening to events](#section_Listeningtoevents)).
  

- __returns__ <code>{constructor(element, options) => can.Construct}</code>:
  A control constructor function that has been
  extended with the provided `staticProperties` and `instanceProperties`.
  
  

### <code>new Control( element, options )</code>


Create an instance of a control. [can.Control.prototype.setup] processes
the arguments and sets up event binding. Write your initialization
code in [can.Control.prototype.init]. Note, you never call `new can.Control()` directly,
instead, you call it on constructor functions extended from `can.Control`.


1. __element__ <code>{HTMLElement|can.NodeList|CSSSelectorString}</code>:
  Specifies the element the control 
  will be created on.
  
1. __options__ <code>{Object}</code>:
  Option values merged with [can.Control.defaults can.Control.defaults]
  and set as [can.Control.prototype.options this.options].
  

- __returns__ <code>{}</code>:
  A new instance of the constructor function extending can.Control.
  

#### <code>Control.extend([staticProperties,] instanceProperties)</code>


Create a new, extended, control constructor 
function. 


1. __staticProperties__ <code>{Object}</code>:
  An object of properties and methods that are added the control constructor 
  function directly. The most common property to add is [can.Control.defaults].
  
1. __instanceProperties__ <code>{Object}</code>:
  An object of properties and methods that belong to 
  instances of the `can.Control` constructor function. These properties are added to the
  control's `prototype` object. Properties that
  look like event handlers (ex: `"click"` or `"li mouseenter"`) are setup
  as event handlers.
  

- __returns__ <code>{constructor(element, options) => can.Construct}</code>:
  A control constructor function that has been
  extended with the provided `staticProperties` and `instanceProperties`.
  
#### defaults `{Object}`

Default values for the Control's options. 



##### <code>Object</code>

#### processors `{Object\<[can.Control.processor](#-functionelement-eventname-selector-handler-undefined)(element, eventName, selector, handler, undefined)\>}`

A collection of hookups for custom events on Controls. 


##### <code>Object\<[can.Control.processor](#-functionelement-eventname-selector-handler-undefined)(element, eventName, selector, handler, undefined)\></code>


#### <code>control.destroy()</code>


Prepares a control for garbage collection and is a place to
reset any changes the control has made.

#### element `{can.NodeList}`

The element passed to the Control when creating a new instance. 



##### <code>can.NodeList</code>


#### <code>control.on([el,] selector, eventName, func)</code>


1. __el__ <code>{HTMLElement|jQuery|collection|Object}</code>:
  
  The element to be bound.  If no element is provided, the control's element is used instead.
1. __selector__ <code>{CSSSelectorString}</code>:
  A CSS selector for event delegation.
1. __eventName__ <code>{String}</code>:
  The name of the event to listen for.
1. __func__ <code>{function|String}</code>:
  A callback function or the String name of a control function.  If a control
  function name is given, the control function is called back with the bound element and event as the first
  and second parameter.  Otherwise the function is called back like a normal bind.

- __returns__ <code>{Number}</code>:
  The id of the binding in this._bindings.
  
  `on(el, selector, eventName, func)` binds an event handler for an event to a selector under the scope of the given element.
  

#### <code>control.on()</code>


Rebind all of a control's event handlers.


- __returns__ <code>{Number}</code>:
  The number of handlers bound to this Control.
  
#### options `{Object}`

Options used to configure a control. 



##### <code>Object</code>


#### <code>control.setup(element, options)</code>


1. __element__ <code>{HTMLElement|NodeList|String}</code>:
  The element as passed to the constructor.
1. __options__ <code>{Object}</code>:
  option values for the control.  These get added to
  this.options and merged with [can.Control.static.defaults defaults].

- __returns__ <code>{undefined|Array}</code>:
  return an array if you want to change what init is called with. By
  default it is called with the element and options passed to the control.
  
## Contributing

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm install
node build
```

### Running the tests

Tests can run in the browser by opening a webserver and visiting the `test.html` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```
