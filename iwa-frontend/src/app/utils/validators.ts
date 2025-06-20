import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {

  /**
   * Validator for phone numbers - requires exactly 9 digits
   * Allows only numbers, spaces, and hyphens for formatting
   */
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const phoneValue = control.value.toString();

      // Remove all non-digit characters to count actual digits
      const digitsOnly = phoneValue.replace(/\D/g, '');

      // Check if it contains only allowed characters (digits, spaces, hyphens)
      const allowedCharsPattern = /^[\d\s\-]+$/;
      if (!allowedCharsPattern.test(phoneValue)) {
        return {
          phoneNumber: {
            message: 'Phone number can only contain numbers, spaces, and hyphens'
          }
        };
      }

      // Check for exactly 9 digits
      if (digitsOnly.length !== 9) {
        return {
          phoneNumber: {
            message: 'Phone number must contain exactly 9 digits'
          }
        };
      }

      return null;
    };
  }

  /**
   * Validator for names - allows only letters, spaces, hyphens, and apostrophes
   * Rejects numbers and most special characters
   */
  static nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const nameValue = control.value.toString().trim();

      // Allow only letters, spaces, hyphens, and apostrophes
      const namePattern = /^[a-zA-ZÀ-ÿ\s\-']+$/;

      if (!namePattern.test(nameValue)) {
        return {
          nameValidator: {
            message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
          }
        };
      }

      // Check for consecutive special characters
      if (/[\-']{2,}/.test(nameValue) || /\s{2,}/.test(nameValue)) {
        return {
          nameValidator: {
            message: 'Name cannot contain consecutive special characters or spaces'
          }
        };
      }

      // Name cannot start or end with special characters
      if (/^[\-'\s]|[\-'\s]$/.test(nameValue)) {
        return {
          nameValidator: {
            message: 'Name cannot start or end with special characters or spaces'
          }
        };
      }

      return null;
    };
  }

  /**
   * Enhanced email validator that's more strict than the default
   */
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const emailValue = control.value.toString().trim().toLowerCase();

      // More comprehensive email regex
      const emailPattern = /^[a-z0-9]([a-z0-9._-]*[a-z0-9])?@[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/;

      if (!emailPattern.test(emailValue)) {
        return {
          emailValidator: {
            message: 'Please enter a valid email address'
          }
        };
      }

      // Check for valid domain format
      const [localPart, domain] = emailValue.split('@');

      if (localPart.length > 64) {
        return {
          emailValidator: {
            message: 'Email local part cannot exceed 64 characters'
          }
        };
      }

      if (domain.length > 253) {
        return {
          emailValidator: {
            message: 'Email domain cannot exceed 253 characters'
          }
        };
      }

      // Prevent consecutive dots
      if (localPart.includes('..') || domain.includes('..')) {
        return {
          emailValidator: {
            message: 'Email cannot contain consecutive dots'
          }
        };
      }

      return null;
    };
  }

  /**
   * Strong password validator
   */
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value.toString();
      const errors: any = {};

      if (password.length < 8) {
        errors.minLength = 'Password must be at least 8 characters long';
      }

      if (!/[a-z]/.test(password)) {
        errors.lowercase = 'Password must contain at least one lowercase letter';
      }

      if (!/[A-Z]/.test(password)) {
        errors.uppercase = 'Password must contain at least one uppercase letter';
      }

      if (!/\d/.test(password)) {
        errors.number = 'Password must contain at least one number';
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.specialChar = 'Password must contain at least one special character';
      }

      return Object.keys(errors).length > 0 ? { strongPassword: errors } : null;
    };
  }

  /**
   * Trim whitespace from input
   */
  static trimWhitespace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && typeof control.value === 'string') {
        const trimmedValue = control.value.trim();
        if (trimmedValue !== control.value) {
          control.setValue(trimmedValue, { emitEvent: false });
        }
      }
      return null;
    };
  }
}
