'use-strict';

const lodash = require('lodash');
const moment = require('moment');

class TieHelper {
  constructor() {}

    /*!
  * Add a new item to an object
  * @param  {Object} obj   The original object
  * @param  {String} key   The key for the item to add
  * @param  {Any}    value The value for the new key to add
  * @param  {Number} index The position in the object to add the new key/value pair [optional]
  * @return {Object}       An immutable clone of the original object, with the new key/value pair added
  */
  addToObject(obj, key, value, index) {

    // Create a temp object and index variable
    var temp = {};
    var i = 0;

    // Loop through the original object
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        // If the indexes match, add the new item
        if (i === index && key && value) {
          temp[key] = value;
        }
        // Add the current item in the loop to the temp obj
        temp[prop] = obj[prop];
        // Increase the count
        i++;
      }
    }
    // If no index, add to the end
    if (!index && key) {
      temp[key] = value;
    }
    return temp;
  };

  /*!
  * Check if two arrays are equal
  * @param  {Array}   arr1 The first array
  * @param  {Array}   arr2 The second array
  * @return {Boolean}      If true, both arrays are equal
  */
  arraysMatch(arr1, arr2) {
    // Check if the arrays are the same length
    if (arr1.length !== arr2.length) return false;
    // Check if all items exist and are in the same order
    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    // Otherwise, return true
    return true;
  };

  /*!
  * Create an immutable clone of an array or object
  * @param  {Array|Object} obj The array or object to copy
  * @return {Array|Object}     The clone of the array or object
  */
  copy(obj) {

    //
    // Methods
    //

    /**
     * Create an immutable copy of an object
     * @return {Object}
     */
    var cloneObj = function () {

      // Create new object
      var clone = {};

      // Loop through each item in the original
      // Recursively copy it's value and add to the clone
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          clone[key] = copy(obj[key]);
        }
      }
      return clone;
    };
    /**
     * Create an immutable copy of an array
     * @return {Array}
     */
    cloneArr = function () {
      return obj.map(function (item) {
        return copy(item);
      });
    };
    //
    // Inits
    //
    // Get object type
    var type = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();

    // If an object
    if (type === 'object') {
      return cloneObj();
    }
    // If an array
    if (type === 'array') {
      return cloneArr();
    }
    // Otherwise, return it as-is
    return obj;
  };

  /*!
  * Remove duplicate items from an array
  * @param  {Array} arr The array
  * @return {Array}     A new array with duplicates removed
  */
  dedupe(arr) {
    return arr.filter(function (item, index) {
      return arr.indexOf(item) === index;
    });
  };

  /*!
 * Find the differences between two objects and push to a new object 
 * @param  {Object} obj1 The original object
 * @param  {Object} obj2 The object to compare against it
 * @return {Object}      An object of differences between the two
 */
  diff(obj1, obj2) {

  // Make sure an object to compare is provided
  if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
      return obj1;
  }

  //
  // Variables
  //

  var diffs = {};
  var key;


  //
  // Methods
  //

  /**
   * Check if two arrays are equal
   * @param  {Array}   arr1 The first array
   * @param  {Array}   arr2 The second array
   * @return {Boolean}      If true, both arrays are equal
   */
  var arraysMatch = function (arr1, arr2) {

      // Check if the arrays are the same length
      if (arr1.length !== arr2.length) return false;

      // Check if all items exist and are in the same order
      for (var i = 0; i < arr1.length; i++) {
          if (arr1[i] !== arr2[i]) return false;
      }

      // Otherwise, return true
      return true;

  };

  /**
   * Compare two items and push non-matches to object
   * @param  {*}      item1 The first item
   * @param  {*}      item2 The second item
   * @param  {String} key   The key in our object
   */
  var compare = function (item1, item2, key) {

      // Get the object type
      var type1 = Object.prototype.toString.call(item1);
      var type2 = Object.prototype.toString.call(item2);

      // If type2 is undefined it has been removed
      if (type2 === '[object Undefined]') {
          diffs[key] = null;
          return;
      }

      // If items are different types
      if (type1 !== type2) {
          diffs[key] = item2;
          return;
      }

      // If an object, compare recursively
      if (type1 === '[object Object]') {
          var objDiff = diff(item1, item2);
          if (Object.keys(objDiff).length > 1) {
              diffs[key] = objDiff;
          }
          return;
      }

      // If an array, compare
      if (type1 === '[object Array]') {
          if (!arraysMatch(item1, item2)) {
              diffs[key] = item2;
          }
          return;
      }

      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (type1 === '[object Function]') {
          if (item1.toString() !== item2.toString()) {
              diffs[key] = item2;
          }
      } else {
          if (item1 !== item2 ) {
              diffs[key] = item2;
          }
      }

  };

  //
  // Compare our objects
  //

  // Loop through the first object
  for (key in obj1) {
      if (obj1.hasOwnProperty(key)) {
          compare(obj1[key], obj2[key], key);
      }
  }
  // Loop through the second object and find missing items
  for (key in obj2) {
      if (obj2.hasOwnProperty(key)) {
          if (!obj1[key] && obj1[key] !== obj2[key] ) {
              diffs[key] = obj2[key];
          }
      }
  }
    // Return the object of differences
    return diffs;
  };

  /*!
  * Check if two objects or arrays are equal
  * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
  * @param  {Object|Array}  value  The first object or array to compare
  * @param  {Object|Array}  other  The second object or array to compare
  * @return {Boolean}              Returns true if they're equal
  */
  isEqual(value, other) {

    // Get the value type
    var type = Object.prototype.toString.call(value);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) return false;

    // If items are not an object or array, return false
    if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

    // Compare the length of the length of the two items
    var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
    var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) return false;

    // Compare two items
    var compare = function (item1, item2) {

      // Get the object type
      var itemType = Object.prototype.toString.call(item1);

      // If an object or array, compare recursively
      if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
        if (!isEqual(item1, item2)) return false;
      }

      // Otherwise, do a simple comparison
      else {

        // If the two items are not the same type, return false
        if (itemType !== Object.prototype.toString.call(item2)) return false;

        // Else if it's a function, convert to a string and compare
        // Otherwise, just compare
        if (itemType === '[object Function]') {
          if (item1.toString() !== item2.toString()) return false;
        } else {
          if (item1 !== item2) return false;
        }

      }
    };

    // Compare properties
    if (type === '[object Array]') {
      for (var i = 0; i < valueLen; i++) {
        if (compare(value[i], other[i]) === false) return false;
      }
    } else {
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          if (compare(value[key], other[key]) === false) return false;
        }
      }
    }

    // If nothing failed, return true
    return true;
  };

  /*!
  * Check if an item is a plain object or not
  * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
  * @param  {Object}  obj  The item to check
  * @return {Boolean}      Returns true if the item is a plain object
  */
  isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };
}

const test = new TieHelper;

module.exports = TieHelper;