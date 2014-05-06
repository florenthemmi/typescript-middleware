/**
 * @fileoverview
 * @author Taketoshi Aono
 */

'use strict';

var fs = require('fs');
var util = require('util');
var pathutil = require('./pathutil');
var TypeScript = require('./typescript.inject');
var HostBase = require('./host-base');


/**
 * @constructor
 * @extends {HostBase}
 */
function ReferenceResolverHost() {
  HostBase.call(this);
}
util.inherits(ReferenceResolverHost, HostBase);


/**
 * @param {string} filename
 * @returns {TypeScript.ScriptSnapshot} 
 */
ReferenceResolverHost.prototype.getScriptSnapshot = function(filename) {
  return this.getSourceFile(filename).scriptSnapshot;
};



ReferenceResolverHost.prototype.resolveRelativePath = function(path, directory) {
  var unQuotedPath = TypeScript.stripStartAndEndQuotes(path);
  var normalizedPath;

  if (TypeScript.isRooted(unQuotedPath) || !directory) {
    normalizedPath = unQuotedPath;
  } else {
    normalizedPath = pathutil.join(directory, unQuotedPath);
  }
  
  return pathutil.resolve(normalizedPath);
};


/**
 * @param {string} path
 * @returns {boolean} 
 */
ReferenceResolverHost.prototype.fileExists = function(path) {
  return fs.existsSync(path);
};


/**
 * @param {string} path
 * @returns {boolean} 
 */
ReferenceResolverHost.prototype.directoryExists = function(path) {
  return fs.exists(path);
};


/**
 * @param {string} path
 * @returns {string} 
 */
ReferenceResolverHost.prototype.getParentDirectory = function(path) {
  return pathutil.dirname(path);
};


/**
 * @constructor
 */
function ReferenceResolver() {
  /**
   * @private {ReferenceResolverHost}
   */
  this._referenceResolverHost = new ReferenceResolverHost();
}


/**
 * @param {string} file
 * @returns {{
 *   resolved: TypeScript.ReferenceResolutionResults,
 *   diagnostics: Array.<string>
 * }} 
 */
ReferenceResolver.prototype.resolve = function(file) {
  var resolutionResults = TypeScript.ReferenceResolver.resolve([file], this._referenceResolverHost, true);
  var resolvedFiles = resolutionResults.resolvedFiles;

  resolutionResults.diagnostics.forEach(function (diagnostic) {
    this._referenceResolverHost.addDiagnostic(diagnostic);
  }, this);
  
  return {
    resolved: resolvedFiles,
    diagnostics: this._referenceResolverHost.getDiagnostics()
  };
};


module.exports = ReferenceResolver;
