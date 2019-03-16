class Errors {

    constructor(type, fileName, method, lineNumber) {
        if (!this[type]) throw [type, fileName, method, lineNumber];
        this[type](fileName, method, lineNumber);
    }

    async username (fN, m, lN) {
        throw new TypeError("Invalid format for lichess username at method " + m + "() ", fN, lN)
    }

}

module.exports = Errors;