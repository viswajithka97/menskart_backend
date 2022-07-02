goog.provide('tk.PromiseQueue');

goog.require('lang.Promise');

goog.scope(function () {
  /**
   * @constructor
   *
   * @template T
   */
  tk.PromiseQueue = function () {
    /**
     * @type {lang.Promise.<T>}
     */
    this.promise = lang.Promise.resolve();
  };

  var PromiseQueue = tk.PromiseQueue;

  /**
   * @param {function(T):lang.Promise.<T>} fn
   *
   * @return {lang.Promise.<T>}
   */
  PromiseQueue.prototype.enqueue = function (fn) {
    this.promise = this.promise.then(fn);
    return this.promise;
  };
});
