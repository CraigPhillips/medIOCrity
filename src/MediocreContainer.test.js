import MediocreContainer from './MediocreContainer';
import {
  MediocreDependency,
  MediocreDependencyResolverTypes,
  MediocreDependencyTypes
} from './MediocreDependency';

function getId () {
  return Math.random(1000000000000);
}

/*
  classes which would ordinarily be defined in their own files
*/
class UselessActionTaker {
  constructor ({ uselessAction, uselessTarget }) {
    Object.assign(this, { id: getId(), uselessAction, uselessTarget });
  }
}

class Target {
  constructor ({ targetAppendage }) {
    Object.assign(this, { id: getId(), targetAppendage });
  }
}

class Thumb {
  constructor () {
    this.id = getId();
  }
}

class Twiddler {
  constructor () {
    this.id = getId();
  }
}

/*
  dependencies which would be defined in one or more dependency files, separate
  from the actual definitions of the classes
*/
const uselessAction = new MediocreDependency(Twiddler);
const targetAppendage = new MediocreDependency(Thumb);
const uselessTarget = new MediocreDependency(Target, {
  subdependencies: { targetAppendage }
});
const uselessActionTakingDependency = new MediocreDependency(
  UselessActionTaker, {
    subdependencies: { uselessAction, uselessTarget }
  });

describe('MediocreContainer', () => {
  let container;
  beforeEach(() => {
    container = new MediocreContainer();
  });

  describe('happy path path dependency resolution', () => {
    test('can build full dependency tree', () => {
      const resolved = container.provide(uselessActionTakingDependency);

      expect(resolved).toBeInstanceOf(UselessActionTaker);
      expect(resolved.uselessAction).toBeInstanceOf(Twiddler);
      expect(resolved.uselessTarget).toBeInstanceOf(Target);
      expect(resolved.uselessTarget.targetAppendage).toBeInstanceOf(Thumb);
    });

    test('can build dependencies list', () => {
      const resolved = container.provide([uselessAction, targetAppendage]);

      expect(resolved.length).toBe(2);
      const [twiddler, thumb] = resolved;
      expect(twiddler).toBeInstanceOf(Twiddler);
      expect(thumb).toBeInstanceOf(Thumb);
    });

    test('singletons are provided repeatedly', () => {
      const resolvedFirst = container.provide(targetAppendage);
      const resolvedSecond = container.provide(targetAppendage);

      expect(resolvedFirst.id).not.toBeFalsy();
      expect(resolvedSecond.id).toBe(resolvedFirst.id);
    });

    test('factory-type resolvers default to providing singletons', () => {
      const dependency = new MediocreDependency(() => new Thumb(), {
        resolverType: MediocreDependencyResolverTypes.FACTORY
      });

      const resolved1 = container.provide(dependency);
      const resolved2 = container.provide(dependency);

      expect(resolved1).toBeInstanceOf(Thumb);
      expect(resolved1.id).toBe(resolved2.id);
    });

    test('factory-type resolvers with non-singleton dependencies work', () => {
      const dependency = new MediocreDependency(() => new Thumb(), {
        resolverType: MediocreDependencyResolverTypes.FACTORY,
        type: MediocreDependencyTypes.PER_PROVIDE_REQUEST
      });

      const resolved1 = container.provide(dependency);
      const resolved2 = container.provide(dependency);

      expect(resolved1).toBeInstanceOf(Thumb);
      expect(resolved2).toBeInstanceOf(Thumb);
      expect(resolved1.id).not.toBe(resolved2.id);
    });

    test('instance-type resolvers provide configured object', () => {
      const toResolveTo = new Thumb();
      const dependency = new MediocreDependency(toResolveTo, {
        resolverType: MediocreDependencyResolverTypes.INSTANCE
      });

      const resolved = container.provide(dependency);

      expect(resolved).toBeInstanceOf(Thumb);
      expect(resolved.id).toBe(toResolveTo.id);
    });
  });

  describe('error handling', () => {
    test('non-Mediocre dependency resolution fails', () => {
      const badDependency = {};

      validateErr(
        () => container.provide({ test: badDependency }),
        'dependencies must be MediocreDependency-classed',
        badDependency);
    });

    test('dependency with missing class-type resolver fails', () => {
      const badDependency = new MediocreDependency(Thumb);
      badDependency.resolver = null;

      validateErr(
        () => container.provide(badDependency),
        'class-type dependency has no resolver',
        badDependency);
    });

    test('dependency with non-cconstructable class-type resolver fails', () => {
      const badDependency = new MediocreDependency('not a class');

      validateErr(
        () => container.provide(badDependency),
        'class-type dependency resolver must be constructable',
        badDependency);
    });

    test('dependency with failing class-type resolver fails', () => {
      const failError = new Error('can not be constructed');
      class FailingConstructor {
        constructor () { throw failError; }
      }
      const badDependency = new MediocreDependency(FailingConstructor);

      validateErr(
        () => container.provide(badDependency),
        'class-type dependency construction failed',
        badDependency,
        failError);
    });

    test('dependency with missing factory-type resolver fails', () => {
      const badDependency = new MediocreDependency(() => {}, {
        resolverType: MediocreDependencyResolverTypes.FACTORY
      });
      badDependency.resolver = undefined;

      validateErr(
        () => container.provide(badDependency),
        'factory-type dependency has no resolver',
        badDependency);
    });

    test('dependency with non-calleable factory-type resolver fails', () => {
      const badDependency = new MediocreDependency('not calleable', {
        resolverType: MediocreDependencyResolverTypes.FACTORY
      });

      validateErr(
        () => container.provide(badDependency),
        'factory-type dependency resolver must be calleable',
        badDependency);
    });

    test('dependency with failing factory-type resolver fails', () => {
      const failingError = new Error('can not be called');
      const badDependency = new MediocreDependency(
        () => { throw failingError; }, {
          resolverType: MediocreDependencyResolverTypes.FACTORY
        });

      validateErr(
        () => container.provide(badDependency),
        'factory-type dependency construction failed',
        badDependency,
        failingError);
    });

    test('non-singleton instance-type resolver fails', () => {
      const toBeResolved = new Thumb();
      const badDependency = new MediocreDependency(toBeResolved, {
        resolverType: MediocreDependencyResolverTypes.INSTANCE,
        type: MediocreDependencyTypes.PER_PROVIDE_REQUEST
      });

      validateErr(
        () => container.provide(badDependency),
        'instance-type resolver must be on a singleton-type dependency',
        badDependency);
    });

    test('missing instance-type resolver fails', () => {
      const badDependency1 = new MediocreDependency(Thumb, {
        resolverType: MediocreDependencyResolverTypes.INSTANCE
      });
      badDependency1.resolver = null;
      const badDependency2 = new MediocreDependency(Thumb, {
        resolverType: MediocreDependencyResolverTypes.INSTANCE
      });
      badDependency2.resolver = undefined;

      validateErr(
        () => container.provide(badDependency1),
        'instance-type dependency must resolve to a value',
        badDependency1);
      validateErr(
        () => container.provide(badDependency2),
        'instance-type dependency must resolve to a value',
        badDependency2);
    });

    test('unknown resolve type fails', () => {
      const badDependency = new MediocreDependency(Thumb, {
        resolverType: 'not a real resolver type'
      });

      validateErr(
        () => container.provide(badDependency),
        'unknown resolver type',
        badDependency);
    });
  });
});

function validateErr (toRun, msg, dependency, cause) {
  let thrownErr = new Error('expected test to throw an error; it did not');
  try {
    toRun();
  } catch (err) {
    thrownErr = err;
  }

  const expectedError = new Error(msg);

  expect(thrownErr).toEqual(expectedError);
  expect(thrownErr.dependency).toBe(dependency);
  expect(thrownErr.cause).toEqual(cause);
}
