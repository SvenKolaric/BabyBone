# Collection

While a model is a representation of a single resource, we often find ourselves needing to
represent an entire collection of resources. While an array might be suitable for some cases,
it limits the behaviour we can expect from it. Instead, it is useful to have a class representing
this collection. This will become even more obvious in later tasks.

In this task, you are to implement a `Collection` class that represents this behaviour. Your task
is to implement the following methods and behaviour for this class.

## Functionality

### Instantiating and access to list of models

A collection can be instantiated empty, or be given an initial list of models. In the first case,
it should store them in some manner of internal storage. These models should be accesible via the
`models` property, but it should not be possible to set them directly using this property. For example:

```javascript
const collection = new Collection();
const collection2 = new Collection([new Model()]);

collection.models.length === 0; // true
collection2.models.length === 1; // true

collection.models = [1, 2, 3];
collection.models.length === 0; // true
```

### Emitting events

Like the `Model` class, the `Collection` should support the `trigger`, `on`, and `off` methods.
The behaviour of these methods is identical as for the `Model`.

### Adding and removing Models

Since the user cannot add or remove models from this collection directly, the model should have
external methods that allow this to be performed.

The `add` method should take a model and should add it to the internal array of models. Additionally,
it should emit an `add` event.

The `remove` methods should take a model and remove it from the internal array *by reference*. It
should also emit the `remove` event, but *only if* the model was found in the collection.

The collection should allow duplicate entries. If multiple instances of the same model exist in the
collection, *all* of them should be removed if the `remove` method is called with this model.

For example:

```javascript
const model1 = new Model();
const model2 = new Model();
const collection = new Collection([model1]);

collection.models.length === 1; // true

collection.add(model2);

collection.models.length === 2; // true

collection.remove(model1);

collection.models.length === 1; // true

collection.add(model2);

collection.models.length === 2; // true

collection.remove(model2);

collection.models.length === 0; // true
```

### Querying by uuid

Every model is guaranteed to have a unique `uuid`, as described in the previous
task. It should be possible to query collection for models using this identifier.

To allow for this behaviour, implement a `get` method that takes a `uuid` and returns
a model with the same `uuid`. If no such model exists, `undefined` should be returned.

```javascript
const model = new Model();
const collection = new Collection([model]);

const foundModel = collection.get(model.uuid);
const noModel = collection.get('totally-fake-uuid');

foundModel === model; // true
typeof noModel === 'undefined'; // true
```

### Array methods

Unlike the basic JavaScript array, our `Collection` does not yet support the basic (and very useful)
array methods. To remedy this, you should implement the following properties and methods on the
`Collection` class:

  - `length` - Read-only property that returns the number of models in the collection
  - `map` - Takes a function and applies it to every model in the collection, returning the same class (`Collection` or extending class) with the transformed values. The function is passed, in order, the model, index, and list of models, much like `Array#map`
  - `filter` - Takes a predicate function and applies it to every collection, returning the same collection class containing only the models for which the return value of the function was *truthy*. The function is passed the model, index, and array of models, like `Array#filter`.
  - `reduce` - Takes a function that accumulates the values and returns the accumulated value, as well as an initial value. The function is run on all methods in order, and passed the current accumulator value, current model, index, and array of models, much like `Array#reduce`.
  - `find` - Takes a predicate function and iterates it over the models, returning the first one for which the function evaluates to a truthy value. If no value is found, `undefined` is returned. The predicate function is passed the model, index, and array of models, much like `Array#find`.
  - `findIndex` - Behaves like `Collection#find`, but returns the index of the first match (or `-1` if there is no match).
  - `indexOf` - Takes a model, and returns the first index at which this model occurs in the collection. If it does not appear, `-1` is returned instead. Behaves like `Array#indexOf`.

These methods should allow for handling of most use cases, and to use collections like arrays without loss of flexibility.

Examples:

```javascript
const model1 = new Model({
  price: 10
});
const model2 = new Model({
  price: 14
});
const model3 = new Model({
  price: 3
});

const collection = new Collection([model1, model2, model3]);

// Double the price
const doublePriceCollection = collection.map((model) => new Model({
  price: model.get('price') * 2
}));

// Only models cheaper than 10
const cheapCollection = collection.filter((model) => model.get('price') < 10);

// Find the maximum price
const expensiveModel = collection.reduce((maxModel, model) => {
  if (!maxModel || model.get('price') > maxModel.get('price')) {
    return model;
  }

  return maxModel;
}, null);

// Find a model with the price of 12 (undefined in this case)
const noModel = collection.find((model) => model.get('price') === 12);

// Find the index of the first model with a price > 10
const secondModel = collection.find((model) => model.get('price') > 10);

// Find the index of model3 in the collection
const two = collection.indexOf(model3);
```

### Extending

Note that, like the `Model` class, the `Collection` will never be used raw.
Instead, specific collection instances will be extended by specific child classes.
Please keep this in mind when implementing the class.

## References
  * [MDN ES6 getters](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/get)
  * [MDN Equality and Sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
  * [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)