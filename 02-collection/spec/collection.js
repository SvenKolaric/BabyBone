describe('Collection', () => {
  describe('constructing the Collection', () => {
    it('should be defined', () => {
      expect(Collection).toBeDefined();
    });

    it('should be possible to instantiate it', () => {
      const collection = new Collection();

      expect(collection instanceof Collection).toBeTruthy();
    });

    it('should have a models property', () => {
      const collection = new Collection();

      expect(collection.models).toBeDefined();
    });

    it('should use the constructor parameter as its models property, if passed', () => {
      const array = [1, 2, 3];

      const collection = new Collection(array);
      expect(collection.models).toEqual(array);
    });

    it('should throw an error if a non-array is passed to the constructor', () => {
      expect(() => new Collection(3)).toThrow(new Error('Constructor parameter must be an array'));
    });
  });

  describe('adding and removing models', () => {
    let collection;

    beforeEach(() => {
      collection = new Collection();
    });

    it('should have `add` and `remove` methods', () => {
      expect(typeof collection.add).toBe('function');
      expect(typeof collection.remove).toBe('function');
    });

    it('should add models with the `add` method', () => {
      const fakeModel = {};

      expect(collection.models.length).toBe(0);
      collection.add(fakeModel);

      expect(collection.models.length).toBe(1);
      expect(collection.models[0]).toEqual(fakeModel);
    });

    it('should support adding of multiple models with `add`', () => {
      collection.add({}, {}, {});

      expect(collection.models.length).toBe(3);
    });

    it('should remove models with the `remove` method', () => {
      const fakeModel = {};
      collection.add(fakeModel);

      collection.remove(fakeModel);
      expect(collection.models.length).toBe(0);
    });

    it('should not remove other models', () => {
      const model = {};
      const otherModel = {};

      collection.add(model, otherModel, otherModel);
      collection.remove(model);

      expect(collection.models.length).toBe(2);
      expect(collection.models[0]).toEqual(otherModel);
    });

    it('should remove all instances of the same model', () => {
      const model = {};
      const otherModel = {};

      collection.add(model, otherModel, model, otherModel);
      collection.remove(model);

      expect(collection.models.length).toBe(2);
      expect(collection.models[0]).toEqual(otherModel);
    });
  });

  describe('the `get` method', () => {
    it('should get an element by uuid', () => {
      const model = {uuid: 1};
      const collection = new Collection([model]);

      expect(collection.get(1)).toEqual(model);
    });

    it('should return undefined if there is no such model', () => {
      const model = {uuid: 1};

      const collection = new Collection([model]);

      expect(collection.get(2)).not.toBeDefined(model);
    });
  });

  describe('array-like properties and methods', () => {
    let array;
    let collection;

    beforeEach(() => {
      array = [1, 2, 3, 1];
      collection = new Collection(array);
    });

    describe('length', () => {
      it('should return the model count', () => {
        expect(collection.length).toBe(4);
      });
    });

    describe('map', () => {
      it('should call the callback on each element with the value, index and models array', () => {
        const callback = jasmine.createSpy('callback');

        collection.map(callback);

        expect(callback.calls.count()).toBe(4);

        [0, 1, 2, 3].forEach((index) => {
          console.log(callback.calls);
          expect(callback.calls.argsFor(index)[0]).toBe(array[index]);
          expect(callback.calls.argsFor(index)[1]).toBe(index);
          expect(callback.calls.argsFor(index)[2]).toBe(array);
        });
      });

      it('should return a collection', () => {
        const result = collection.map(function(){});

        expect(result instanceof Collection).toBe(true);
      });

      it('should return a collection with values transformed according to the function', () => {
        const cb = (value) => value * 2;

        const result = collection.map(cb);
        expect(result.models).toEqual(array.map(cb));
      });
    });

    describe('filter', () => {
      it('should call the callback on each element with the value, index and models array', () => {
        const callback = jasmine.createSpy('callback');

        collection.filter(callback);

        expect(callback.calls.count()).toBe(4);

        [0, 1, 2, 3].forEach((index) => {
          expect(callback.calls.argsFor(index)[0]).toBe(array[index]);
          expect(callback.calls.argsFor(index)[1]).toBe(index);
          expect(callback.calls.argsFor(index)[2]).toBe(array);
        });
      });

      it('should return a collection', () => {
        const result = collection.filter(function(){});

        expect(result instanceof Collection).toBe(true);
      });

      it('should return a collection with values for which the function returned a truthy value', () => {
        const cb = (value, index) => value > index;

        const result = collection.filter(cb);
        expect(result.models).toEqual(array.filter(cb));
      });
    });

    describe('reduce', () => {
      it('should call the callback on each element with the accumulator, value, index and models array', () => {
        const callback = jasmine.createSpy('callback2');
        collection.reduce(callback, 2);

        expect(callback.calls.count()).toBe(4);

        [0, 1, 2, 3].forEach((index) => {
          expect(callback.calls.argsFor(index)[1]).toBe(array[index]);
          expect(callback.calls.argsFor(index)[2]).toBe(index);
          expect(callback.calls.argsFor(index)[3]).toBe(array);
        });
      });

      it('should return the computed value', () => {
        const callback = (acc, value) => acc + value;
        const result = collection.reduce(callback, 1);

        expect(result).toBe(collection.models.reduce(callback, 1));
      });

      it('should not use the accumulator if not provided', () => {
        const callback = (acc, value) => acc + value;
        const result = collection.reduce(callback);

        expect(result).toBe(collection.models.reduce(callback));
      });
    });

    describe('find', () => {
      it('should call the callback on each element with the value, index and models array', () => {
        const callback = jasmine.createSpy('callback');

        collection.find(callback);

        expect(callback.calls.count()).toBe(4);

        [0, 1, 2, 3].forEach((index) => {
          expect(callback.calls.argsFor(index)[0]).toBe(array[index]);
          expect(callback.calls.argsFor(index)[1]).toBe(index);
          expect(callback.calls.argsFor(index)[2]).toBe(array);
        });
      });

      it('should return the first value that matches the query', () => {
        const cb = (value, index) => index === 2;
        const result = collection.find(cb);

        expect(result).toBe(array[2]);
      });

      it('should return `undefined` if there is no matching value', () => {
        const cb = (value, index) => index === -1;
        const result = collection.find(cb);

        expect(result).not.toBeDefined();
      });
    });

    describe('findIndex', () => {
      it('should call the callback on each element with the value, index and models array', () => {
        const callback = jasmine.createSpy('callback');

        collection.findIndex(callback);

        expect(callback.calls.count()).toBe(4);

        [0, 1, 2, 3].forEach((index) => {
          expect(callback.calls.argsFor(index)[0]).toBe(array[index]);
          expect(callback.calls.argsFor(index)[1]).toBe(index);
          expect(callback.calls.argsFor(index)[2]).toBe(array);
        });
      });

      it('should return the index of first value that matches the query', () => {
        const cb = (value, index) => index === 2;
        const result = collection.findIndex(cb);

        expect(result).toBe(2);
      });

      it('should return `-1` if there is no matching value', () => {
        const cb = (value, index) => index === -20;
        const result = collection.findIndex(cb);

        expect(result).toBe(-1);
      });
    });

    describe('indexOf', () => {
      it('should return the index of the model in the collection', () => {
        for (let i = 0; i < array.length; i++) {
          expect(collection.indexOf(array[i])).toBe(i);
        }
      });

      it('should return -1 if there is no such model in the collection', () => {
        expect(collection.indexOf('notHere')).toBe(-1);
      });
    });
  });
});
