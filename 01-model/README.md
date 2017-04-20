# Model

Models are object representations of data in an application. They keep track of
values and their changes. In most use cases, every model will actually be a class
of its own. However, they should all have the same interface. To make this possible,
all models should inherit from a common `Model` class.

Your task is to implement the basic methods and behaviour for this base class.

## Functionality

### Unique Identifier

Each instance of a model should have a UUID (universally unique identifier), which may be a string
or a number. This identifier should be unique even between classes that inherit from `Model`.

```javascript
const model1 = new Model();
const model2 = new Model();

model1.uuid !== model2.uuid;
```

### Setters and Getters

Your model should support setting and getting of values. It should adhere to the
following interface:

```javascript
const model = new Model();

model.set('name', 'SomeName');
model.get('name'); // should return 'SomeName'
```

### Initial Values

When a model is constructed with an object as its first parameter, it should automatically
copy assign all the key-value pairs of that object as its own attributes. At this point,
these attributes should be gettable. The existing model properties and methods (such as `get` and `set`)
**must not** be overwritten by the properties.

Additionally, a shallow copy should be made of the passed object. If the object is modified after
initialisation, it should not alter the values in the model.

```javascript
const values = {
  name: 'Tester',
  set: new Set([1, 2, 3])
};

const model = new Model(values);

model.get('name') === values.name; // true
model.get('set') === values.set; // true

model.set('name', 'User');
model.get('name') === 'User'; // true

values.name = 'Mark';

model.get('name') === 'User'; // true
```

### Events

The model should keep track of all changes of its attribute values. To allow other parts
of your application to be notified of these events, the `Model` class must offer `on`, `off`,
and `trigger` methods.

For every attribute change, the `change` and `change:{{attributeName}}` events should be emitted.

```javascript
const model = new Model();
const onAgeChange = () => console.log('Changed age');

model.on('change', () => console.log('Changed'));
model.on('change:name', (name, oldName) => console.log(`Changed name: ${name} from ${oldName}`));
model.on('change:age', onAgeChange);
model.off('change:age', onAgeChange);

model.set('name', 'User1');
// Logs:
// "Changed"
// "Changed name: User1 from undefined"

model.set('name', 'User2');
// Logs:
// "Changed"
// "Changed name: User2 from User1"

model.set('age', 31);
// Logs:
// "Changed"
```

### Extending the Model

The main purpose of the model is to serve as a base for concrete models, which can
then add the extra methods. These models should have all the methods of the base
`Model` class, and should be initialised with the passed properties, provided they
call the `super()` method on initialisation.

```javascript
class Dog extends Model {
  constructor(options) {
    super(options);

    this.set('isDog', true);
    this.set('isAlive', true);
  }

  speak() {
    const name = this.get('name');

    if (this.get('isAlive')) {
      console.log(`Woof woof, my name is ${name}`);
    } else {
      console.log('*crickets*');
    }
  }
}

const dog = new Dog({name: 'Lassie'});

dog.get('isDog'); // True
dog.speak(); // Woof woof, my name is Lassie
```

## References
  * [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)
  * [MDN ES6 classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
  * [MDN Object#assign](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)