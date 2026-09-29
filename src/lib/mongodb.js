import { MongoClient } from 'mongodb';

const uri =
  process.env.MONGODB_URI ||
  'mongodb://e-commerce-web-db:MWGAsRlFV4ltq3Ef@ac-mmp9lh3-shard-00-00.bljwodf.mongodb.net:27017,ac-mmp9lh3-shard-00-01.bljwodf.mongodb.net:27017,ac-mmp9lh3-shard-00-02.bljwodf.mongodb.net:27017/?ssl=true&replicaSet=atlas-12i85x-shard-0&authSource=admin&appName=Cluster0';

const dbName = process.env.DB_NAME || 'e-commerce-web-data';

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

/**
 * Helper to get active MongoDB database instance
 * @param {string} [name] - Database name override
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDb(name = dbName) {
  const connectedClient = await clientPromise;
  return connectedClient.db(name);
}

/**
 * Helper to get a specific MongoDB collection
 * @param {string} collectionName 
 * @returns {Promise<import('mongodb').Collection>}
 */
export async function getCollection(collectionName) {
  const db = await getDb();
  return db.collection(collectionName);
}

export default clientPromise;
