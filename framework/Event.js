class Event {

    constructor(client, storeName, name = null) {
        this.client = client;
        this.storeName = this.client.storeManager.getStore(storeName);
        this.name = name;
        this.path = null;
    }

}

module.exports = Event;