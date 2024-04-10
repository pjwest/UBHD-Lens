"use strict";

var _ = require("underscore");
var LensConverter = require('lens/converter');

var LensArticle = require("lens/article");
var CustomNodeTypes = require("./nodes");

var BitsConverter = function (options) {
  LensConverter.call(this, options);
};

BitsConverter.Prototype = function () {

  this.test = function (xmlDoc) {
console.log("bitsConverter test called");
    // check  NLM BITS elements
    var book = xmlDoc.querySelector("book");
    if ( book != null) {
console.log("bitsConverter test found a book!!");
      return true;
    }
    return false;
  }

  // Override document factory so we can create a customized Lens article,
  // including overridden node types
  this.createDocument = function () {
    var doc = new LensArticle({
      nodeTypes: CustomNodeTypes
    });

    return doc;
  };

  this.captionNew = function (state, caption) {
    var doc = state.doc;
    var captionNode = {
      "id": state.nextId("caption"),
      "source_id": caption.getAttribute("id"),
      "type": "caption",
      "title": "",
      "children": []
    };
    // Titles can be annotated, thus delegate to paragraph
    var title = caption.querySelector("title");
    if (title) {
      // Resolve title by delegating to the paragraph
      var node = this.paragraph(state, title);
      if (node) {
        captionNode.title = node.id;
      }
    }
    var children = [];
    var paragraphs = caption.querySelectorAll("p");
    _.each(paragraphs, function (p) {
      // Only consider direct children
      if (p.parentNode !== caption) return;
      var node = this.paragraph(state, p);
      if (node) children.push(node.id);
    }, this);
    captionNode.children = children;
    doc.create(captionNode);
    return captionNode;
  };

  this.sanitizeXML = function (xmlDoc) {
    var paragraphs = xmlDoc.querySelectorAll("p");
    for (var i = 0; i < paragraphs.length; i++) {
      var paragraph = paragraphs[i];
      var parentNode = paragraph.parentNode;
      if (paragraph !== undefined && paragraph.innerHTML === "" && parentNode.tagName == "caption")
        paragraph.innerHTML = ".";

    }

    var figures = xmlDoc.querySelectorAll("fig");

    for (var i = 0; i < figures.length; i++) {
      var figure = figures[i];
      var hasCaption = false;
      for (var j = 0; j < figure.children.length; j++) {
        var child = figure.children[j];
        if (child.tagName === "caption") {
          hasCaption = true;
        }
      }
      if (hasCaption===false) {
        var caption = document.createElement("caption");
        var element = document.createElement("p");
        var content = document.createTextNode(".");
        element.appendChild(content);
        element.style.visibility = "hidden";
        caption.appendChild(element);
        figure.appendChild(caption);

      }
    }

    return xmlDoc;
  };


  // Resolve figure urls
  // --------
  //
  /*

    this.enhanceFigure = function(state, node, element) {
      var graphic = element.querySelector("graphic");
      var url = graphic.getAttribute("xlink:href");
      node.url = this.resolveURL(state, url);
    };

  */

  // Example url to JPG: http://cdn.elifesciences.org/elife-articles/00768/svg/elife00768f001.jpg
  /*
    this.resolveURL = function(state, url) {
      console.log(url);
    // Use absolute URL
    if (url.match(/http[s]:\/\//)) return url;

    // Look up base url
    var baseURL = this.getBaseURL(state);

    if (baseURL) {
      return [baseURL, url].join('');
    } else {
        // Use special URL resolving for production articles
        return [
            "http://cdn.elifesciences.org/elife-articles/",
            state.doc.id,
            "/jpg/",
            url,
            ".jpg"
        ].join('');
    }
  };
  */


  // bookIds: array of <book-id> elements
  this.bookIds = function(state, bookIds) {
    var doc = state.doc;

    // Note: Substance.Article does only support one id
    if (bookIds.length > 0) {
      doc.id = bookIds[0].textContent;
    } else {
      // if no id was set we create a random one
      doc.id = util.uuid();
    }
  };


  this.extractBookMeta = function(state, book) {
    var bookMeta = book.querySelector("book-meta");
    if (!bookMeta) {
      throw new ImporterError("Expected element: 'book-meta'");
    }

    // <book-id> Book Identifier, zero or more
    var bookIds = bookMeta.querySelectorAll("book-id");
    this.bookIds(state, bookIds);

    // <title-group> Title Group, zero or one
    var titleGroup = bookMeta.querySelector("book-title-group");
    if (titleGroup) {
        this.titleGroup(state, titleGroup);
    }

    // <pub-date> Publication Date, zero or more
    var pubDates = bookMeta.querySelectorAll("pub-date");
    this.pubDates(state, pubDates);

    // Not supported yet:
  };



  // Book
  // --------
  // Does the actual conversion.
  //
  // Note: this is implemented as lazy as possible (ALAP) and will be extended as demands arise.
  //
  // If you need such an element supported:
  //  - add a stub to this class (empty body),
  //  - add code to call the method to the appropriate function,
  //  - and implement the handler here if it can be done in general way
  //    or in your specialized importer.

  this.book = function(state, book) {
    var doc = state.doc;
console.log("bitsConverter book called");

console.log("bitsConverter found a book");
    var bookId = book.querySelector("book-id");
    if (bookId) {
      doc.id = bookId.textContent;
    } else {
      // if no id was set we create a random one
      doc.id = util.uuid();
    }

    // Extract Processing-Meta
    this.extractBookMeta(state, book);

    // Extract Collection-Meta
    this.extractBookMeta(state, book);

    // Extract Book-Meta
    this.extractBookMeta(state, book);

    // Extract Front-Matter
    this.extractBookMeta(state, book);

    // Extract Book-Body
    this.extractBookMeta(state, book);

    // Extract Book-Back
    this.extractBookMeta(state, book);


    // Extract glossary
    this.extractDefinitions(state, book);

    // Extract authors etc.
    this.extractAffilitations(state, book);
    this.extractContributors(state, book);

    // Same for the citations, also globally
    this.extractCitations(state, book);

    // Extract footnotes
//    this.extractFootnotes(state, article);

    // Make up a cover node
//    this.extractCover(state, article);

    // Extract ArticleMeta
//    this.extractArticleMeta(state, article);

    // Populate Publication Info node
//    this.extractPublicationInfo(state, article);

    var body = book.querySelector("body");
    if (body) {
      this.body(state, body);
    }

    //this.extractFigures(state, body);
    this.enhanceArticle(state, body);

  };

  this.document = function(state, xmlDoc) {
    var doc = state.doc;
    var book = xmlDoc.querySelector("book");
    if (!book) {
      throw new ImporterError("Expected to find a 'book' element.");
    }
    // recursive-descent for the main body of the book
console.log("bits_converter document called calling book");

    this.book(state, book);
    this.postProcess(state);
    // Rebuild views to ensure consistency
    _.each(doc.containers, function(container) {
      container.rebuild();
    });
    return doc;
  };



};


BitsConverter.Prototype.prototype = LensConverter.prototype;
BitsConverter.prototype = new BitsConverter.Prototype();
BitsConverter.prototype.constructor = BitsConverter;

module.exports = BitsConverter;
