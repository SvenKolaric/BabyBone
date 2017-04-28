describe('Event Bus', () => {
  describe('constructing the event bus', () => {
    it('should be defined', () => {
      expect(EventBus).toBeDefined();
    });

    it('should be constructable', () => {
      const eventBus = new EventBus();

      expect(eventBus).toBeDefined();
      expect(eventBus instanceof EventBus).toBe(true);
    });
  });

  describe('methods', () => {
    let eventBus;

    beforeEach(() => {
      eventBus = new EventBus();
    });

    describe('trigger', () => {
      it('should be a method', () => {
        expect(typeof eventBus.trigger === 'function').toBe(true);
      });
    });

    describe('on', () => {
      it('should be a method', () => {
        expect(typeof eventBus.on === 'function').toBe(true);
      });
    });

    describe('off', () => {
      it('should be a method', () => {
        expect(typeof eventBus.off === 'function').toBe(true);
      });
    });

    describe('method interaction', () => {
      it('should work for the basic adding, triggering and removing', () => {
        const callback = jasmine.createSpy('callback');

        eventBus.on('a', callback);

        expect(callback).not.toHaveBeenCalled();

        eventBus.trigger('a', 1, 2, 3);

        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(1, 2, 3);

        eventBus.off('a', callback);
        eventBus.trigger('a');

        expect(callback.calls.count()).toBe(1);
      });

      it('should add an event listener for each spaced string in `on`', () => {
        const callback = jasmine.createSpy('callback');
        eventBus.on('a b', callback);
        expect(callback.calls.count()).not.toHaveBeenCalled();

        eventBus.trigger('a');
        expect(callback.calls.count()).toBe(1);

        eventBus.trigger('b');
        expect(callback.calls.count()).toBe(2);
      });

      it('should allow multiple instances of the same listener', () => {
        const callback = jasmine.createSpy('callback');
        eventBus.on('a', callback);
        eventBus.on('a', callback);

        expect(callback.calls.count()).not.toHaveBeenCalled();

        eventBus.trigger('a');

        expect(callback.calls.count()).toBe(2);
      });

      it('should allow multiple events on trigger', () => {
        const callback = jasmine.createSpy('callback');
        eventBus.on('a b', callback);

        expect(callback.calls.count()).not.toHaveBeenCalled();

        eventBus.trigger('a b');

        expect(callback.calls.count()).toBe(2);
      });

      it('should remove all instances of an event handler with off', () => {
        const callback = jasmine.createSpy('callback');
        eventBus.on('a', callback);
        eventBus.on('a', callback);
        eventBus.off('a', callback);
        eventBus.trigger('a');

        expect(callback.calls.count()).not.toHaveBeenCalled();
      });
    });
  });
});
