import MediocreContainer from './MediocreContainer';

test('can construct useless object', () => {
  expect(new MediocreContainer()).not.toBeNull();
});
