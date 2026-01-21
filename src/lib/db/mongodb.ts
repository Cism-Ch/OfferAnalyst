import { MongoClient, Db } from "mongodb";

/**
 * MongoDB client singleton utility.
 *
 * Ensures a single connection pool is reused across the application,
 * following the standard Next.js singleton pattern to prevent
 * connection exhaustion during development.
 */

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/placeholder";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Get the database instance.
 *
 * @param dbName Optional database name, defaults to the one in the connection string
 * @returns Promise resolving to the MongoDB Db instance
 */
export async function getDb(dbName?: string): Promise<Db | null> {
  if (!process.env.MONGODB_URI) {
    return null;
  }
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

// Export the promise for advanced use cases if needed
export default clientPromise;
