import { isEmpty } from '@ember/utils';
import { object } from 'yup';
import { tracked } from '@glimmer/tracking';

class Validation {
  @tracked
  validationError;

  @tracked
  validations;
  
  parent = null;
  canValidate = true;

  constructor(parent, validations) {
    if (!parent) {
      throw new Error("You didn't provide parent context to validation class");
    }

    if (!validations) {
      /* eslint-disable no-console */
      console.warn(`You didn't provide validations for ${parent.toString()}`);
    }

    this.validations = validations;
    this.parent = parent;

    this.validationSchema = object().shape(validations);
    this.resetErrors();
  }

  get validationErrors() {
    const { validationError } = this;
    const errors = validationError && validationError.inner;

    if (errors) {
      return errors.reduce((fieldErrors, fieldValidationError) => {
        fieldErrors[fieldValidationError.path] = fieldValidationError.errors;
        return fieldErrors;
      }, {})
    }

    return {};
  }

  get errors() {
    return Object.assign({}, this.validationErrors);
  }

  get isValid() {
    return isEmpty(Object.values(this.errors).flat());
  }

  validate() {
    return new Promise((resolve, reject) => {
      const validationTarget = this.parent;
      this.validationSchema
        .validate(validationTarget, { abortEarly: false, context: this.parent })
        .then((validationResult) => {
          this.resetErrors();
          return resolve(validationResult);
        })
        .catch((validationError) => {
          this.validationError = validationError;
          return reject(validationError);
        })
    });
  }

  resetErrors() {
    this.validationError = {}; 
  }
}

export { Validation as default }
