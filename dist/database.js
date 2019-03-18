"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Database = function Database() {
    _classCallCheck(this, Database);

    if (!Database.instance) {
        this.fileData = [];
        this.fileDict = {};
        Database.instance = this;
    }

    return Database.instance;
};

var instance = new Database();
Object.freeze(instance);

exports.default = instance;