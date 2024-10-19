import {
  MediocreDependency,
  MediocreDependencyResolverTypes,
  MediocreDependencyTypes
} from './MediocreDependency';

const resTypes = MediocreDependencyResolverTypes;

export default class MediocreContainer {
  constructor () {
    Object.assign(this, {
      classes: new Map(),
      factories: new Map(),
      singletons: new Map()
    });
  }

  provide (dependencies) {
    // resolve a collection of dependencies
    if (dependencies.length) {
      return dependencies.map(dep => this.provide(dep));
    }

    // resolve a single dependency
    if (dependencies instanceof MediocreDependency) {
      return this.provideSingle(dependencies);
    }

    // by default resolve dependencies as if they are a plain objects whose
    // whose values are the dependencies to be resolved
    const dependencyKeys = Object.keys(dependencies);
    const resolvedDependencies = {};
    for (let i = 0; i < dependencyKeys.length; i += 1) {
      const depKey = dependencyKeys[i];
      resolvedDependencies[depKey] = this.provideSingle(dependencies[depKey]);
    }
    return resolvedDependencies;
  }

  provideSingle (dependency) {
    if (!(dependency instanceof MediocreDependency)) {
      throw newErr(
        'dependencies must be MediocreDependency-classed',
        dependency);
    }

    let resolved = this.singletons.get(dependency);
    // undefined/null values are intentionally not allowed as dependency
    // resolutions so an undefined here means no singleton is yet defined
    // for this dependency
    if (resolved !== undefined && resolved !== null) {
      return resolved;
    }

    const resolvedSubDependencies = dependency.subdependencies
      ? this.provide(dependency.subdependencies)
      : undefined;

    switch (dependency.resolverType) {
      case resTypes.CLASS: {
        const ResolverClass = dependency.resolver;
        if (!ResolverClass) {
          throw newErr('class-type dependency has no resolver', dependency);
        }
        if (!(ResolverClass instanceof Function)) {
          throw newErr(
            'class-type dependency resolver must be constructable',
            dependency);
        }

        try {
          resolved = new ResolverClass(resolvedSubDependencies);
          break;
        } catch (cause) {
          throw newErr(
            'class-type dependency construction failed',
            dependency,
            cause);
        }
      }
      case resTypes.FACTORY: {
        const factory = dependency.resolver;
        if (!factory) {
          throw newErr('factory-type dependency has no resolver', dependency);
        }
        if (!(factory instanceof Function)) {
          throw newErr(
            'factory-type dependency resolver must be calleable',
            dependency);
        }

        try {
          resolved = factory(resolvedSubDependencies);
          break;
        } catch (cause) {
          throw newErr(
            'factory-type dependency construction failed',
            dependency,
            cause);
        }
      }
      case resTypes.INSTANCE: {
        const instance = dependency.resolver;
        if (dependency.type !== MediocreDependencyTypes.SINGLETON) {
          throw newErr(
            'instance-type resolver must be on a singleton-type dependency',
            dependency);
        }
        if (instance === null || instance === undefined) {
          throw newErr(
            'instance-type dependency must resolve to a value',
            dependency);
        }

        resolved = instance;
        break;
      }
      default: {
        throw newErr('unknown resolver type', dependency);
      }
    }

    if (dependency.type === MediocreDependencyTypes.SINGLETON) {
      this.singletons.set(dependency, resolved);
    }

    return resolved;
  }
}

function newErr (msg, dependency, cause) {
  const err = new Error(msg, { cause });
  Object.assign(err, { dependency });
  return err;
}
