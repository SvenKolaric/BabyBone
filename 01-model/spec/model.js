describe('Model', () => {
  describe('constructing the Model', () => {
    it('should be defined', () => {
      expect(Model).toBeDefined();
    });

    it('should be possible to instantiate it', () => {
      const model = new Model();

      expect(model instanceof Model).toBeTruthy();
    });
  });

  describe('uuid', () => {
    it('should have an uuid', () => {
      const model = new Model();

      expect(model.uuid).toBeDefined();
    });

    it('should have a different uuid for each instance', () => {
      const models = [];

      for (let i = 0; i < 20; i++) {
        models.push(new Model());
      }

      const uuids = new Set(models.map((model) => model.uuid));

      expect(models.length).toBe(uuids.size);
    });
  });

  describe('setters and getters', () => {
    let model;

    beforeEach(() => {
      model = new Model();
    });

    it('should have the set method', () => {
      expect(model.set).toBeDefined();
    });

    it('should have the get method', () => {
      expect(model.get).toBeDefined();
    });

    it('should return `undefined` when getting undefined properties', () => {
      expect(model.get('name')).not.toBeDefined();
    });

    it('should set the attribute when using `set`', () => {
      model.set('name', 'Name');
      expect(model.get('name')).toBe('Name');
    });

    it('should allow use of existing method/property names as attributes', () => {
      model.set('set', 'setString');
      model.set('get', 'getString');
      model.set('on', 'onString');

      expect(model.get('set')).toBe('setString');
      expect(model.get('get')).toBe('getString');
      expect(model.get('on')).toBe('onString');
    });
  });

  describe('initial values', () => {
    let model;
    let options;

    beforeEach(() => {
      options = {
        name: 'Andrei',
        job: 'Developer',
        hypeLevel: 100
      };

      model = new Model(options);
    });

    it('should copy initial values to the object if provided', () => {
      Object.keys(options).forEach((key) => {
        const value = options[key];

        expect(model.get(key)).toBe(value);
      });
    });

    it('should not override existing methods', () => {
      const otherModel = new Model({get: true});

      expect(typeof otherModel.get === 'function').toBeTruthy();
      expect(otherModel.get('get')).toBe(true);
    });
  });

  describe('events', () => {
    let model;
    let callback;
    let otherCallback;

    beforeEach(() => {
      model = new Model();
      callback = jasmine.createSpy('callback');
      otherCallback = jasmine.createSpy('otherCallback');
    });

    it('should have the `on`, `off` and `trigger` methods', () => {
      expect(model.on).toBeDefined();
      expect(typeof model.on === 'function').toBeTruthy();

      expect(model.off).toBeDefined();
      expect(typeof model.off === 'function').toBeTruthy();

      expect(model.trigger).toBeDefined();
      expect(typeof model.trigger === 'function').toBeTruthy();
    });

    it('should emit the change event when a property changes', () => {
      model.on('change', callback);

      expect(callback).not.toHaveBeenCalled();

      model.set('name', 'name');

      expect(callback).toHaveBeenCalled();
    });

    it('should emit the change:{{propName}} event when a property changes', () => {
      model.on('change:name', callback);

      expect(callback).not.toHaveBeenCalled();

      model.set('name', 'name');

      expect(callback).toHaveBeenCalled();
    });

    it('should allow the same callback to be added twice', () => {
      model.on('change', callback);
      model.on('change', callback);

      expect(callback).not.toHaveBeenCalled();

      model.set('name', 'name');
      expect(callback.calls.count()).toBe(2);
    });

    it('should remove listeners with off', () => {
      model.on('change', callback);
      model.on('change', otherCallback);

      expect(callback).not.toHaveBeenCalled();
      expect(otherCallback).not.toHaveBeenCalled();

      model.off('change', otherCallback);

      model.set('name', 'name');

      expect(callback).toHaveBeenCalled();
      expect(otherCallback).not.toHaveBeenCalled();
    });

    it('should trigger custom events with trigger', () => {
      model.on('custom', callback);

      expect(callback).not.toHaveBeenCalled();

      model.trigger('custom');

      expect(callback).toHaveBeenCalled();
    });

    it('should pass parameters given to trigger to handlers', () => {
      model.on('custom', callback);

      expect(callback).not.toHaveBeenCalled();

      model.trigger('custom', 1, 2, 3);

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(1, 2, 3);
    });
  });

  describe('extending Model', () => {
    let model;
    let options;

    beforeEach(() => {
      class MyModel extends Model {
        constructor(options) {
          super(options);

          this.set('isMine', true);
        }
      }

      options = {
        name: 'model'
      };

      model = new MyModel(options);
    });

    it('should attach initial properties if super was called', () => {
      expect(model.get('name')).toEqual('model');
    });
  });
});
