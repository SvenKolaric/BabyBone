# CRUD

While the currently implemented `Model` and `Collection` classes certainly have their uses,
we have no good way of persisting them. In this task, you will implement the basic CRUD methods on
these classes to allow for them to be persisted and fetched via a HTTP API.

You will be using your implementation of learnQuery, in particular `learnQuery#ajax` for this task.

## Functionality

### Serialization

It would be wildly impractical to try and save and load our entire `Model` and `Collection` instances.
Instead, we are only interested in the data contained within them. To allow us to easily access this
data, both `Model` and `Collection` should implement a `toJSON` method.

The `Model#toJSON` method should work like so:
  * The returned value should be a JavaScript object
  * The keys should be the attribute names
  * If the attribute has a `toJSON` method (e.g., is a model or collection), the value should be the result of its `toJSON` call
  * Otherwise, the value should simply be assigned without changes

The `Collection#toJSON` method should simply return an array. The contents of the array should be the
results of the `toJSON` call on each of the models contained in the collection.

For example:

```javascript
const dog = new Model({name: 'Lassie'});
const human = new Model({
  name: 'Steve',
  age: 35,
  pet: dog
});
const humans = new Collection([human]);

humans.toJSON() === {
  name: 'Steve',
  age: 35,
  pet: {
    name: 'Lassie'
  }
}; // true
```

### The URL

To allow for communication with a server, classes extending `Model` and `Collection` should define
a *read-only* `url` property. This property should be used when communicating with the server.

This property should allow for dynamic properties. These properties should be defined as `:propertyName`
and will not be intermixed with regular strings, but instead delimited by slashes or the end of string.

A utility function called `parseUrl` should be implemented to allow for parsing of URLs with dynamic
properties. It should take the dynamic string, and (optionally) an object containing key-value pairs.
When a key exists in the object, the dynamic property placeholder should be replaced with the given value
in the string. Otherwise, an empty string should be inserted. Additionally, trailing slashes and multiple
slash instances should be collapsed.

For example:

```javascript
const url = 'https://my-farm.com/farm/:id/chickens/';
const params = {
  id: 13
};

parseUrl(url) === 'https://my-farm.com/farm/chickens';
parseUrl(url, params) === 'https://my-farm.com/farm/13/chickens';
```

### Model identifying property

Internally, our models are identified using the `uuid` property. However, in almost all real-world cases,
the back-end will also have an identifier for the model representation. The `Model` class have this property,
as a *read-only* value, and it should default to `id` (as this is the most common name). Extending classes
should be at liberty to change the value of this property.

For example:

```javascript
class Chicken extends Model {
  get url() {
    return 'https://my-farm.com/chickens/:_id';
  };

  get id() {
    return '_id';
  };
}
```

### Collection model specification

If we wish to deserialize a `Model` from a JSON object, the approach is simple - after all,
the `Model` constructor already can receive such an object. However, when trying to do the same
with `Collection` instances, we run into a problem: the collection does not know which concrete
class the models should implement.

For this reason, the `Collection` should have a `model` *read-only* property (which should default
to plain `Model`). When creating the Collection from an array, a check should be performed on each
member of the array: if it is not an instance of `Model`, the constructor of the class specified by
the `model` property should be run on it.

For example:

```javascript
const data = [{name: 'John', age: 42}];

class Person extends Model {}

const People extends Collection {
  get model() {
    return Person;
  };
}

// Results in the same thing!
const people = new People(data);
const people2 = new People([
  new Person(data[0])
]);
```

### Fetching models

To begin with, you will need to implement the `Model#fetch` method, which will allow you to
get a specific instance of a model from the server. This method takes only one mandatory parameter - the
value of the identifier used on the server. It will also make use of the `id` and `url` properties
describe in the previous sections.

This method **must** return a promise, which resolves with the response when the data is fetched, or
rejects with an error when a HTTP error occurs.


For example, we wish to fetch the chicken identified by an `id` of value `35`:

```javascript
class Chicken extends Model {
  get url() {
    return 'https://my-farm.com/chickens/:id';
  };

  get id() {
    return 'id'; // Same as default, here for demonstrative purposes
  };
}

const chicken = new Chicken();

chicken
  .fetch(13)
  .then((response) => {
    console.log('Loaded chicken:', response);
  })
  .catch((err) => {
    console.error('No chicken!', err);
  });
```

### Saving models

### Deleting models

### Fetching collections

## References