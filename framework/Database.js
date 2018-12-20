const { MongoClient } = require("mongodb");
const Stopwatch = require("./Stopwatch.js");

class Database {

	constructor(client) {
		this.client = client;
		this.db = null;
		this._cache = {
			configs: {},
			members: {},
			users: {},
			storage: {}
		};
		this._docs = {
			config: {
				prefix: "cn.",
				language: "en-US",
				commandsDisabled: [],
				welcome: {
					enabled: false,
					welcomeMessage: "Hello **{mention}**, welcome to **{guild}**!",
					leaveMessage: "Just ditch the welcome... **{username}** just left **{guild}**.",
					welcomeChannel: null,
					autoRole: null
				},
				logs: {
					channel: null,
					guild: false,
					channels: false,
					roles: false,
					nicknames: false,
					bans: false,
					joins: false,
					leaves: false,
					warns: false,
					messages: false
				},
				levelsEnabled: false,
				tags: [],
				starboard: { limit: 1, channel: null },
				automod: { invites: false }
			},
			member: {
				coins: 0,
				level: 0,
				lastDaily: Date.now() - 864e5
			},
			user: {
				afk: { isAfk: false, afkMessage: null }
			}
		}
	}

	async start() {
		const mClient = await MongoClient.connect("mongodb://localhost:27017/", { useNewUrlParser: true });
		this.db = mClient.db("chatnoir");
	}

	insert(collection, id, doc) {
		return this.db.collection(collection).insertOne({ _id: id }, doc).catch(() => null);
	}

	update(collection, id, doc) {
		return this.db.collection(collection).updateOne({ _id: id }, { $set: doc });
	}

	delete(collection, id) {
		return this.db.collection(collection).deleteOne({ _id: id });
	}

	async getConfig(id) {
		const [config] = await this.db.collection("configs").find({ _id: id }).toArray();
		if (!config) {
			await this.addConfig(id);
			return (await this.db.collection("configs").find({ _id: id }).toArray())[0];
		}
		return config;
	}

	getConfigSync(id) {
		return this._cache.configs[id] || { _id: id, ...this._docs.config };
	}

	addConfig(id) {
		if (this._cache.configs[id]) return this._cache.configs[id];
		if (!this._cache.configs[id]) this._cache.configs[id] = this._docs.config;
		return this.db.collection("configs").insertOne({ _id: id, ...this._docs.config }).catch(() => null);
	}

	async updateConfig(id, update = {}) {
		if (!this._cache.configs[id]) await this.addConfig(id).catch(() => null);
		await this.db.collection("configs").updateOne({ _id: id }, { $set: update });
		this._cache.configs[id] = (await this.db.collection("configs").find({ _id: id }).toArray())[0];
		return this._cache.configs[id];
	}

	deleteConfig(id) {
		delete this._cache.configs[id];
		return this.db.collection("configs").deleteOne({ _id: id });
	}

	async getMember(guild, id) {
		const [result] = await this.db.collection("members").find({ _id: `${guild}|${id}` }).toArray();
		if (!result) {
			await this.db.collection("members").insertOne({ _id: `${guild}|${id}`, ...this._docs.member }).catch(() => null);
			return (await this.db.collection("members").find({ _id: `${guild}|${id}` }).toArray())[0];
		}
		return result;
	}

	getMemberSync(guild, id) {
		return this._cache.members[`${guild}|${id}`] || { _id: `${guild}|${id}`, ...this._docs.member };
	}

	async updateMember(guild, id, doc = {}) {
		if (!this._cache.members[`${guild}|${id}`]) await this.getMember(guild, id).catch(() => null);
		await this.db.collection("members").updateOne({ _id: `${guild}|${id}` }, { $set: doc });
		this._cache.members[`${guild}|${id}`] = (await this.db.collection("members").find({ _id: `${guild}|${id}` }).toArray())[0];
		return this._cache.members[`${guild}|${id}`];
	}

	async getUser(id) {
		const [user] = await this.db.collection("users").find({ _id: id }).toArray();
		if (!user) {
			await this.db.collection("users").insertOne({ _id: id, ...this._docs.user }).catch(() => null);
			return (await this.db.collection("users").find({ _id: id }).toArray())[0];
		}
		return user;
	}

	getUserSync(id) {
		return this._cache.users[id] || { _id: id, ...this._docs.user };
	}

	async updateUser(id, doc = {}) {
		if (!this._cache.users[id]) await this.getMember(id).catch(() => null);
		await this.db.collection("users").updateOne({ _id: id }, { $set: doc });
		this._cache.users[id] = (await this.db.collection("users").find({ _id: id }).toArray())[0];
		return this._cache.users[id];
	}

	async bulkUpdate(collection, { set, unset } = {}) {
		if (!(await this.db.collections()).some(col => col.collectionName === collection)) throw new Error(`Collection ${collection} does not exist!`);
		const sw = new Stopwatch().start();
		const results = await this.db.collection(collection).find().toArray();
		await Promise.all(results.map(async r => {
			if (Object.keys(set).length > 0 && Object.keys(unset).length > 0)
				await this.db.collection(collection).updateOne({ _id: r._id }, { $set: set, $unset: unset });
			if (Object.keys(set).length > 0) await this.db.collection(collection).updateOne({ _id: r._id }, { $set: set });
			if (Object.keys(unset).length > 0) await this.db.collection(collection).updateOne({ _id: r._id }, { $unset: unset });
		}));
		if (this._cache[collection]) await this.cacheCollection(collection);
		const time = sw.stop();
		return { set, unset, time };
	}

	async createError(command, message, stack) {
		const _id = require("crypto").randomBytes(5).toString("hex");
		const doc = {
			_id,
			command: command.toJSON(),
			guild: message.guild ? message.guild.toJSON() : null,
			member: message.member ? message.member.toJSON() : null,
			author: message.author.toJSON(),
			stack
		};
		await this.db.collection("errors").insertOne(doc).catch(() => null);
		return _id;
	}

	async getErrors() {
		const errors = await this.db.collection("errors").find().toArray();
		if (errors.length < 1) return [];
		return errors;
	}

	async clearErrors() {
		const sw = new Stopwatch().start();
		const cleared = (await this.getErrors()).length;
		await this.db.dropCollection("errors");
		const time = sw.stop();
		return { cleared, time };
	}

	async getError(id) {
		const [error] = await this.db.collection("errors").find({ _id: id }).toArray();
		if (!error) return null;
		return error;
	}

	async cacheConfigs() {
		return await this.cacheCollection("configs");
	}

	async cacheMembers() {
		return await this.cacheCollection("members");
	}

	async cacheUsers() {
		return await this.cacheCollection("users");
	}

	async cacheCollection(collection) {
		const documents = await this.db.collection(collection).find().toArray();
		documents.map(d => this._cache[collection][d._id] = d);
	}

	get totalDocuments() {
		const cacheKeys = Object.keys(this._cache);
		const total = cacheKeys.map(k => Object.keys(this._cache[k]).length).reduce((p, c) => p + c, 0);
		return total;
	}

};

module.exports = Database;