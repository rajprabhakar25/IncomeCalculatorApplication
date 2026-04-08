const mongoose = require('mongoose');
const dns = require('dns');

// System DNS blocks SRV queries. We manually resolve the Atlas SRV record
// using Google DNS (8.8.8.8) and build a direct connection string.
function resolveAtlasSRV(mongoUri) {
  return new Promise((resolve) => {
    // Only apply workaround for mongodb+srv:// URIs
    if (!mongoUri.startsWith('mongodb+srv://')) {
      return resolve(mongoUri);
    }

    // Extract host from URI: mongodb+srv://user:pass@host/db?options
    const match = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(.*)/);
    if (!match) return resolve(mongoUri);

    const [, user, pass, srvHost, rest] = match;
    const srvName = `_mongodb._tcp.${srvHost}`;

    // Use Google DNS to resolve the SRV record
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '8.8.4.4']);

    resolver.resolveSrv(srvName, (srvErr, srvRecords) => {
      if (srvErr) {
        console.warn('SRV lookup via Google DNS failed, trying original URI:', srvErr.message);
        return resolve(mongoUri);
      }

      // Also resolve TXT for connection options
      resolver.resolveTxt(srvHost, (txtErr, txtRecords) => {
        const hosts = srvRecords
          .map(r => `${r.name}:${r.port}`)
          .join(',');

        // Parse any TXT record options (authSource, replicaSet, etc.)
        let txtOptions = '';
        if (!txtErr && txtRecords && txtRecords.length > 0) {
          txtOptions = txtRecords.flat().join('&');
        }

        // Build a standard mongodb:// URI (no SRV)
        const dbAndOptions = rest || '/income-assessment';
        const separator = dbAndOptions.includes('?') ? '&' : '?';
        const options = [
          txtOptions,
          'tls=true',
          'authSource=admin',
        ].filter(Boolean).join('&');

        const directUri = `mongodb://${user}:${pass}@${hosts}${dbAndOptions}${separator}${options}`;
        console.log('Using direct MongoDB URI (SRV resolved via Google DNS)');
        resolve(directUri);
      });
    });
  });
}

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || 'mongodb://localhost:27017/income-assessment';
    const uri = await resolveAtlasSRV(rawUri);

    const conn = await mongoose.connect(uri, { family: 4 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error('Server will keep running but API calls will fail until MongoDB is available.');
  }
};

module.exports = connectDB;
