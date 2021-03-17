import { isEmpty } from '@ember/utils';
import { object } from 'yup';
import { tracked } from '@glimmer/tracking';

class Validation {
  @tracked
  validationError;

  @tracked
  fieldValidationErrors = [];

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
    const { validationError, fieldValidationErrors } = this;
    const errors = [validationError?.inner, ...fieldValidationErrors]
      .flat()
      .filter(Boolean);

    return errors.reduce((fieldErrors, fieldValidationError) => {
      fieldErrors[fieldValidationError.path] = fieldValidationError.errors;
      return fieldErrors;
    }, {})
  }

  get errors() {
    return Object.assign({}, this.validationErrors);
  }

  get isValid() {
    return isEmpty(Object.values(this.errors).flat());
  }

  validate() {
      this.resetErrors();
    return new Promise((resolve, reject) => {
      const validationTarget = this.parent;
      this.validationSchema
        .validate(validationTarget, { abortEarly: false, context: this.parent })
        .then((validationResult) => {
          return resolve(validationResult);
        })
        .catch((validationError) => {
          this.validationError = validationError;
          return reject(validationError);
        })
    });
  }

  validateField(field) {
    return new Promise((resolve, reject) => {
      const validationTarget = this.parent;
      this.validationSchema
        .validateAt(field, validationTarget, { abortEarly: false, context: this.parent })
        .then((validationResult) => {
          return resolve(validationResult);
        })
        .catch((validationError) => {
          this.fieldValidationErrors = [validationError, ...this.fieldValidationErrors];
          return reject(validationError);
        })
    });
  }

  resetErrors() {
    this.validationError = {};
    this.fieldValidationErrors = [];
  }
}

export { Validation as default }
