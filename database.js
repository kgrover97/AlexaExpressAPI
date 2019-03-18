class Database {

    constructor() {
        if (!Database.instance) {
            this.fileData = [];
            this.fileDict = {};
            Database.instance = this;
        }

        return Database.instance;
    }
}

const instance = new Database();
Object.freeze(instance);

export default instance;
