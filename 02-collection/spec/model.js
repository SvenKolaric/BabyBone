describe('Model', () => {
  describe('constructing the Collection', () => {
    it('should be defined', () => {
      expect(Collection).toBeDefined();
    });

    it('should be possible to instantiate it', () => {
      const collection = new Collection();

      expect(collection instanceof Collection).toBeTruthy();
    });
  });

});
