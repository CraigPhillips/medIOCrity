import {
  MediocreDependency,
  MediocreDependencyResolverTypes,
  MediocreDependencyTypes
} from './MediocreDependency';

class ExampleClass {}

describe('MediocreDependency', () => {
  describe('happy path object creation', () => {
    test('creates class-type resolvers by default', () => {
      const dependency = new MediocreDependency(ExampleClass);

      expect(dependency.resolver).toBe(ExampleClass);
      expect(dependency.resolverType)
        .toBe(MediocreDependencyResolverTypes.CLASS);
      expect(dependency.type).toBe(MediocreDependencyTypes.SINGLETON);
    });

    test('creates factory-type resolvers', () => {
      const object = new ExampleClass();

      const dependency = new MediocreDependency(() => object, {
        resolverType: MediocreDependencyResolverTypes.FACTORY
      });

      expect(dependency.resolver()).toBe(object);
      expect(dependency.resolverType)
        .toBe(MediocreDependencyResolverTypes.FACTORY);
      expect(dependency.type).toBe(MediocreDependencyTypes.SINGLETON);
    });

    test('creates instance-type resolvers', () => {
      const object = new ExampleClass();

      const dependency = new MediocreDependency(object, {
        resolverType: MediocreDependencyResolverTypes.INSTANCE
      });

      expect(dependency.resolver).toBe(object);
      expect(dependency.resolverType)
        .toBe(MediocreDependencyResolverTypes.INSTANCE);
      expect(dependency.type).toBe(MediocreDependencyTypes.SINGLETON);
    });
  });

  describe('constructor validation', () => {
    test('throws error on null resolver', () => {
      expect(() => new MediocreDependency(null))
        .toThrow('resolver required when creating a dependency');
    });

    test('throws error on undefined resolver', () => {
      expect(() => new MediocreDependency())
        .toThrow('resolver required when creating a dependency');
    });
  });
});
