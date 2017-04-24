# CRUD methods

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
get a specific instance of a model from the server. The method takes one mandatory parameter
and two optional parameters. The first, mandatory, parameter is the identifier (id) used on
the server. The second parameter are the query parameters, as a key-value object store. The
third parameter are the headers, in the same format.

It will also make use of the `id` and `url` properties described in the previous sections.
The method should then make a GET request using the resolved URL, and assign the returned values
to the model.

When this method is successfully executed, a `load` event should be emitted.

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

// GET https://my-farm.com/chickens/13?include=eggs
// Sends 'Authentication: Basic 123' header
chicken
  .fetch(13, {include: 'eggs'}, {Authentication: 'Basic 123'})
  .then((response) => {
    console.log('Loaded chicken:', response);
  })
  .catch((err) => {
    console.error('No chicken!', err);
  });
```

### Saving models

We must also be capable of persisting models on the server. This will be implemented
via the `Model#save` method. The method should take one optional parameter - the headers as
a key-value object. It behaves differently depending on whether the model instance has a value
for its defined id field (that is, if its identifier field is `id`, it checks whether
`model.get('id')` is a defined value). If the value is not defined, a POST request is made.
If it is defined, a PUT request is made instead.

When a model is saved and the server returns a response body, the model should be updated
with these fields. For example, if the model is saved via POST, and the server returns the `id`
field, the model should be updated with it.

When this method is successfully executed, a `save` event should be emitted.

This method **must** return a promise, which resolves with the response when the data is fetched, or
rejects with an error when a HTTP error occurs.

For example:

```javascript
const jakov = new Chicken({
  name: 'Jakov',
  powerLevel: 7500,
  finalForm: false
});

// Jakov has no id when saving, POST https://my-farm.com/chickens
// Sends header 'Authentication: Basic 123'
jakov
  .save({Authentication: 'Basic 123'})
  .then((response) => {
    console.log('Saved Jakov', response);

    // Jakov now has an id, since it was returned by the server.
    // We will assume this id is 100
    jakov.set('powerLevel', 100000);
    jakov.set('finalForm', true);

    // Jakov has an id, PUT https://my-farm.com/chickens/100
    return jakov.save();
  })
  .then((response) => {
    console.log('Saved even more powerful Jakov', response);
  })
  .catch((err) => {
    console.error('Could not save Jakov!', err);
  });
```

### Deleting models

Finally, models can be deleted, thus removing them from the server. You will implement this
behaviour via the `Model#destroy` method. It should make a DELETE request to the URL, using
the model's identifier field. The method optionally takes headers a key-value object.

When this method is successfully executed, a `destroy` event should be emitted.

This method **must** return a promise, which resolves with the response when the data is deleted, or
rejects with an error when a HTTP error occurs.

Additionally, `Collection` should listen to the `destroy` event on all of its instances. When it
receives that event from one of its members, it should automatically remove it from its internal
list of models.

For example:

```javascript
class Dog extends Model {
  get url() {
    return 'https://my-farm.com/dogs/:id';
  }
}

const dog = new Dog();
const dogs = new DogCollection([dog]);

dog
  .get(10)
  .then(() => {
    console.log(dogs.models.length === 1); // logs true

    // DELETE https://my-farm.com/dogs/10
    // Sends header 'Authentication: Basic 123'
    return dog.delete({
      Authentication: 'Basic 123'
    });
  })
  .then((response) => {
    console.log('Deleted the dog');
    console.log(dogs.models.length === 0); // logs false
  })
  .catch((err) => {
    console.err('Failed to process the dog', err);
  });
```

### Fetching collections

The remaining common use case is fetching entire collections of data at once. To allow
for this behaviour, implement the `Collection#fetch` method. It should take two optional
parameters: the query parameters and the headers, both as objects.

When this method is successfully executed, a `load` event should be emitted.

This method **must** return a promise, which resolves with the response when the data is fetched, or
rejects with an error when a HTTP error occurs.

For example:

```javascript
const chickens = new ChickenCollection();

// GET https://my-farm.com/chickens?sort=head_size
// Sends header 'Authentication: Basic 123'
chickens
  .fetch({sort: 'head_size'}, {Authentication: 'Basic 123'})
  .then((response) => {
    console.log('Chickens loaded!', response);
  })
  .catch((err) => {
    console.error('Don\'t count your chickens before they hatch', err);
  });
```

## References