"use strict";

var _ = require("underscore");
var Document = require('../../../node_modules/lens/substance/document/index');
var Composite = Document.Composite;

// Lens.Box
// -----------------
//

var bookMeta = function(node, doc) {
  Composite.call(this, node, doc);
};

// Type definition
// -----------------
//

bookMeta.type = {
  "id": "book_meta",
  "parent": "content",
  "properties": {
      "children":{
        "abstract":"abstract",

      },
      "authors": ["array", "paragraph"],
      "abstract":["array", "abstract"],
    }


};

// This is used for the auto-generated docs
// -----------------
//

bookMeta.description = {
  "name": "Section",
  "remarks": [
    "Section Element for metadata",
  ],
  "properties": {
    "children": {
      "abstract": "abstract element"
    }
  }
};


// Example Section Metadata
// -----------------
//

bookMeta.example = {
  "id": "book_meta_1",
  "type": "book_meta",

  "children": {
      "abstract":"abstract_id"}
};

bookMeta.Prototype = function() {

  this.getChildrenIds = function() {
    return this.properties.children;
  };

  this.getAuthors = function() {
        return _.map(this.properties.authors, function(paragraphId) {
            return this.document.get(paragraphId);
        }, this);
    };

    this.getAbstract = function() {
        return _.map(this.properties.abstract, function(paragraphId) {
            return this.document.get(paragraphId);
        }, this);
    };

};

bookMeta.Prototype.prototype = Composite.prototype;
bookMeta.prototype = new bookMeta.Prototype();
bookMeta.prototype.constructor = bookMeta;

Document.Node.defineProperties(bookMeta);

module.exports = bookMeta;
