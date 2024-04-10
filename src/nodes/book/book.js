"use strict";

var Document = require('../../../node_modules/lens/substance/document/index');
var Composite = Document.Composite;

// Lens.Box
// -----------------
//

var Book = function(node, doc) {
    Composite.call(this, node, doc);
};

// Type definition
// -----------------
//

Book.type = {
    "id": "book",
    "parent": "content",
    "properties": {
        "title":"text",
        "children": ["array", "paragraph"]
    }


};

// This is used for the auto-generated docs
// -----------------
//

Book.description = {
    "name": "Book",
    "remarks": [
        "Book",
    ],
    "properties": {
        "children": {
            "book": "book element"
        }
    }
};


// Example Section Metadata
// -----------------
//

Book.example = {
    "id": "book_1",
    "type": "book",

    "children": {
        "book":"book_id"}
};

Book.Prototype = function() {

    this.getChildrenIds = function() {
        return this.properties.children;
    };

};

Book.Prototype.prototype = Composite.prototype;
Book.prototype = new Book.Prototype();
Book.prototype.constructor = Book;

Document.Node.defineProperties(Book);

module.exports = Book;
