# Event Bus

So far, both `Model` and `Collection` classes implement basic event-handling behaviour through
the `on`, `off`, and `trigger` methods. When taking an object-oriented approach, it is desireable
to extract such behaviour into a shared class, which would allow for both of the classes to extend it.

Your task is to implement the `EventBus` class which provides this behaviour. Additionally, both
the `Model` and `Collection` classes should inherit from it instead of defining their own behaviour.

## Functionality

### `trigger`

The `EventBus` should implement the `trigger` method. It should behave like the `trigger` method of
the `Model` class, with one important difference: it should also permit multiple events to be emitted
at once. The first argument (the event string) can now be a space-delimited list of events, where an
event will be emitted for each non-empty event name. For example:

```javascript
const bus = new EventBus();

bus.trigger('change change:name ', 1, 2);
// change and change:name will be emitted with the arguments (1, 2)
```

### `on`

The `EventBus` should also implement the `on` method. Like the `trigger` method, it should be possible
to register a listener for multiple listeners at once. The format is the same - a space-delimited list
of events. For example:

```javascript
const listener = (data) => console.log(data);
const bus = new EventBus();

bus.on('change delete', listener); // Registers listener for both events

bus.trigger('change', 15); // logs 15
bus.trigger('delete', ':(')); // logs :(
```

### `off`

Finally, the `EventBus` should also implement an `off` method. Similarly to the last method, it should
allow for deregistration of a handler for multiple events. If there is no such handler for the given
event, a noop is performed (that is, nothing happens). For example:

```javascript
const listener = (data) => console.log(data);
const bus = new EventBus();

bus.on('change update delete', listener);
bus.off('delete other', listener);

bus.trigger('change update delete', 'Boom!'); // logs 'Boom!' twice
```

### References
  * [noop](https://en.wikipedia.org/wiki/NOP)