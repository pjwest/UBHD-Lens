"use strict";
var _ = require("underscore");
var NodeView = require('../../../node_modules/lens/article/nodes/node/index').View;
var CompositeView = require("../../../node_modules/lens/article/nodes/composite/index").View;
var $$ = require("../../../node_modules/lens/substance/application/index").$$;

// Lens.BookMeta.View
// ==========================================================================

var bookMetaView = function (node, viewFactory) {
    CompositeView.call(this, node, viewFactory);
};

bookMetaView.Prototype = function () {
    this.render = function () {
        var node = this.node;
        this.content = document.createElement("div");

        var authors = $$('.authors', {
            children: _.map(node.getAuthors(), function(authorPara) {
                var paraView = this.viewFactory.createView(authorPara);
                var paraEl = paraView.render().el;
                this.content.appendChild(paraEl);
                return paraEl;
            }, this)
        });

        authors.appendChild($$('.content-node.text.plain', {
            children: [
                $$('.content', {text: this.node.document.on_behalf_of})
            ]
        }));
        this.content.appendChild(authors);


        var abstract = $$('.abstract', {
            children: _.map(node.getAbstract(), function(authorPara) {
                var paraView = this.viewFactory.createView(authorPara);
                var paraEl = paraView.render().el;
                this.content.appendChild(paraEl);
                return paraEl;
            }, this)
        });
        if (node.properties.abstract.length > 0) {
            this.content.appendChild(abstract);
        }

        this.el.appendChild(this.content);
        return this;
    };
};

bookMetaView.Prototype.prototype = CompositeView.prototype;
bookMetaView.prototype = new bookMetaView.Prototype();

module.exports = bookMetaView;
