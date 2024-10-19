export const MediocreDependencyTypes = {
  PER_PROVIDE_REQUEST: Symbol('PerProvideRequestMediocreDependencyType'),
  SINGLETON: Symbol('SingletonMediocreDependencyType')
};

export const MediocreDependencyResolverTypes = {
  CLASS: Symbol('ClassMediocreDependencyResolverType'),
  FACTORY: Symbol('FactoryMediocreDependencyResolverType'),
  INSTANCE: Symbol('InstanceMediocreDependencyResolverType')
};

export class MediocreDependency {
  constructor (resolver, {
    resolverType = MediocreDependencyResolverTypes.CLASS,
    subdependencies = undefined,
    type = MediocreDependencyTypes.SINGLETON
  } = {}) {
    if (resolver === undefined || resolver === null) {
      throw new Error('resolver required when creating a dependency');
    }

    Object.assign(this, { resolver, resolverType, subdependencies, type });
  }
}
