# Views

With fully fleshed out models and collections, we now find ourselves in need of displaying
them to the user. While doing so manually is certainly possible, the MVC architecture offers
us a better solution. In this task, you will implement the `View` class, which stands somewhere
between the View and Controller concepts of the MVC architecture. Its task will be to render
the view, update it when changes occur, and to keep track of user events on the view (e.g., clicks).

## Functionality

### Attaching the View

Views should only be constructable after inheriting them. The main reason for this is that views
are essentially useless if they are not attached to the DOM. To allow for this behaviour, extending
instances of the view should define an `el` property. This property should be either a string selector.
Each time the View is rendered, it will be rendered _inside_ that element.

The class should also make accessible an `$el` property (which should not be explicitly defined by
the user), which represents the selected element as a learnQuery element.

Both of this properties should be read-only and should not be changed at runtime.

For example:

```javascript
class ChickenView extends View {
  get el() {
    return '.js-chicken-view';
  }
}

const chickenView = new ChickenView();

chickenView.el; // '.js-chicken-view'
chickenView.$el; // Same as learnQuery(chickenView.el)
```

### Constructing a view

As mentioned, the view should be constructable unless it has an `el` property defined.
If such a property is not defined, the constructor should throw an error. Additionally,
the view should have some extra behaviour when constructed. It is passed an object with
key-value pairs. For each of these pairs, if the value is an instance of `EventBus`, it
should automatically be listened for all standard Puppet `Model` and `Collection` events.
The handler for this should call the `View#render` method (more on this method later). This
will allow the views to auto-update when their values change.

### Templates

While the `View` class handles the logic of rendering and changing the view, it needs to
have an HTML template defined somewhere. To allow for this, classes inheriting `View` will
have to define `template` method. This method should take in an object containing arbitrary
values and should return the relevant HTML computed after processing those values. By default,
the `View#template` method should always return an empty string.

The return value of this method is meant to be rendered in the DOM. Additionally, making this
a method allows for easy outsourcing of template computations, allowing us to e.g. load views
from an external object/template cache.

For example, an inheriting class might define it like this:

```javascript
class ChickenView extends View {
  get el() {
    return '.js-chicken-view';
  };

  template(params = {}) {
    if (params.chickens && params.chickens.length > 0) {
      return `<div class="chickens">There are ${params.chickens.length} chickens!</div>`;
    }

    return '<b>Sorry, we are out of chickens!</b>';
  }
}

const chickenView = new ChickenView();
chickenView.template(); // <b>Sorry, we are out of chickens!</b>
chickenView.template({chickens: []}); // <b>Sorry, we are out of chickens!</b>
chickenView.template({
  chickens: [1, 2, 3]
}); // <div class="chickens">There are 3 chickens!</div>
```

### Render method

To go from template to DOM, there needs to be a `render` method. This method will
compile the view (by calling the `template` method) and inserting it into the DOM
(via the `$el` property and its methods).

By default, the method should simply compile the template using all the parameters
it was passed in the view construction (or an empty object by default) and attach
the result to the DOM. This will cover the most basic use case. If an inheriting
view needs to define more complex behaviour, it can easily do so by overriding the
method.

```javascript
class ChickenView extends View {
  get el() {
    return '.js-chicken-view';
  };

  template(params = {}) {
    if (params.chickens && params.chickens.length > 0) {
      return `<div class="chickens">There are ${params.chickens.length} chickens!</div>`;
    }

    return '<b>Sorry, we are out of chickens!</b>';
  }
}

const chickenView = new ChickenView({
  chickens: [1, 2, 3, 4]
});

chickenView.render();

document.querySelector('.js-chicken-view').innerHTML;
// <div class="chickens">There are 4 chickens!</div>
```

### UI events

Manually handling UI events in the DOM can be a hassle. Therefore, a _read only_ `events`
property can be defined on classes that inherit `View`. This property will then automatically
attach event listeners and their handlers. Note that these events should be **delegated** on
the `$el` instance, to avoid event listener duplication and make use of them easier.

The syntax should be:

```javascript
{
  'event_name selector': 'handler'
}
```

Where `handler` should be a method on the view instance. This method should be called with `this`
bound to the view instance, and should be passed the DOM event. For example:

```javascript
class ChickenView extends View {
  get el() {
    return '.js-chicken-view';
  };

  get events() {
    return {
      'click .cluck-button': 'cluck'
    };
  };

  cluck(event) {
    event.preventDefault();

    console.log('Cluck, I am a chicken!');
  }
}
```

### Detaching views

Finally, we should be able to detach views from the DOM. This will be done via the `View#detach`
method. This method will clear the inner HTML of the `$el` element, and will detach all event
listeners that were bound when the view was initialised.

## References
  * [MDN Template Literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals)