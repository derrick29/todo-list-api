class PgDB {
    static db = null;

    constructor() {
        
    }

    getInstance() {
        if(this.db == null) {
            this.db = new PgDB();
        }

        return this.db;
    }
}