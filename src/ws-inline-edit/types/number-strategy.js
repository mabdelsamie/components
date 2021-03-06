import {AbstractTypeStrategy} from './abstract-type-strategy';

const english = '([0-9]*(,[0-9]{3})*)(\\.[0-9]+)?';
const german = '([0-9]*(\\.[0-9]{3})*)(,[0-9]+)?';
const strip = str => str.replace(/[.,]/g, '');

/**
 * Strategy to handle number type of inline edit
 */
export class NumberStrategy extends AbstractTypeStrategy {

  /**
   * Receives locale option
   * @param {Object} options Type options
   * @param {string} options.locale Locale can be optional specified to force de or en number style
   */
  constructor(options) {
    super(options);
    this.locale = options.locale;
  }

  /**
   * Get matching pattern for specified locale
   * @param {string} locale de or en
   * @returns {RegExp}
   * @private
   */
  static getPattern(locale) {
    switch (locale) {
      case 'de': return new RegExp(`^${german}$`);
      case 'en': return new RegExp(`^${english}$`);
      default: return new RegExp(`^${english}$`);
    }
  }

  /**
   * Converts a localized number string to float or int (no thousand separator, decimal with dot)
   * @param {string} match Unused
   * @param {Array<string>} parts Matched groups of applied reg ex. Depending on the applied regexp only some
   * indexes are filled. For german or english index 0 - 2 will be filled. If no locale specified 0-2 will be filled
   * if the number is in english format and 3-5 if it is in english format.
   * @returns {string}
   */
  static convertToDecimal(match, ...parts) {
    let combined = strip(parts[0] || parts[3]);
    if (parts[2] || parts[5]) {
      combined += `.${strip(parts[2] || parts[5])}`;
    }
    return combined;
  }

  /**
   * Validate if the given value is a valid number
   * @param {string} value The input value
   * @returns {boolean}
   */
  validate(value) {
    if (!value) {
      return false;
    }

    if (this.locale) {
      return NumberStrategy.getPattern(this.locale).test(value);
    }
    return NumberStrategy.getPattern('en').test(value) ||
      NumberStrategy.getPattern('de').test(value);
  }

  /**
   * Converts the localized string number to a decimal
   * @param {string} value The input value
   * @returns {number}
   */
  convert(value) {
    let simple;
    if (this.locale) {
      simple = value.replace(NumberStrategy.getPattern(this.locale), NumberStrategy.convertToDecimal);
    } else if (NumberStrategy.getPattern('en').test(value)) {
      simple = value.replace(NumberStrategy.getPattern('en'), NumberStrategy.convertToDecimal);
    } else if (NumberStrategy.getPattern('de').test(value)) {
      simple = value.replace(NumberStrategy.getPattern('de'), NumberStrategy.convertToDecimal);
    }
    return parseFloat(simple);
  }
}
