import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Validation from 'tomster-player/validations';
import { string } from 'yup';

class ValidationTestSubject {
  name = null;

  validations = new Validation(this, {
    name: string().nullable().required()
  })
}

module('Unit | Validations', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.subject = new ValidationTestSubject();  
  });

  test('it can be initialized', function(assert) {
    assert.expect(1);
    const { subject } = this;

    assert.ok(subject.validations instanceof Validation);
  });

  test('there is no validation error until validated explicitly', function(assert) {
    assert.expect(2);
    const { subject } = this;

    subject.name = null;
    assert.equal(subject.validations.errors.name, undefined);

    subject.name = "my name";
    assert.equal(subject.validations.errors.name, undefined);
  });

  test('there is validation error when validated and name is not set', function(assert) {
    assert.expect(1);
    const { subject } = this;
    const done = assert.async();

    subject.validations
      .validate(subject)
      .catch(() => {
        assert.deepEqual(subject.validations.errors.name, ['name is a required field']);
      })
      .finally(done);
  });

  test('there is no validation error when name is present', function(assert) {
    assert.expect(1);
    const { subject } = this;
    const done = assert.async();

    subject.name = "my name";

    subject.validations
      .validate()
      .then(() => {
        assert.equal(subject.validations.errors.name, undefined);
      })
      .finally(done);
  });

  test('errors are cleared between validation calls', function(assert) {
    assert.expect(2);
    const { subject } = this;
    const done = assert.async();

    subject.validations
      .validate()
      .catch(() => {
        assert.deepEqual(subject.validations.errors.name, ['name is a required field']);
       
        subject.name = "my name";

        return subject.validations.validate();
      })
      .then(() => {
        assert.equal(subject.validations.errors.name, undefined);
      })
      .finally(done);
  });

  test('is valid when there are no errors', function(assert) {
    assert.expect(1);
    const { subject } = this;

    assert.ok(subject.validations.isValid)
  });

  test('is not valid when there are validation errors', function(assert) {
    assert.expect(1);
    const { subject } = this;
    const done = assert.async();

    subject.validations
      .validate()
      .catch(() => {}) // prevent validationError exception from stopping test
      .finally(() => {
        assert.notOk(subject.validations.isValid);

        done()
      });
  });

  test('errors can be reset', function(assert) {
    assert.expect(2);
    const { subject } = this;
    const done = assert.async();

    subject.validations
      .validate()
      .catch(() => {}) // prevent validationError exception from stopping test
      .finally(() => {
        assert.notOk(subject.validations.isValid);

        subject.validations.resetErrors();
        assert.ok(subject.validations.isValid);

        done()
      });
  });
});
