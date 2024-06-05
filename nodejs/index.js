// Import required modules
const dotenv = require("dotenv");
const { Pinecone: PineconeClient } = require("@pinecone-database/pinecone");
const axios = require("axios");

// Load environment variables from .env file
dotenv.config();

// Get environment variables
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
console.log(`Index Name: ${pineconeIndexName}`);
const pineconeIndexHost = process.env.PINECONE_INDEX_HOST;
console.log(`Index Host: ${pineconeIndexHost}`);

// Initialize Pinecone client
const pc = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY,
});

const getPineconeIndexWithNamespace = (orgId) => {
  return pc.Index(pineconeIndexName).namespace(orgId);
};

const renderStatsForNamespace = async (orgId) => {
  const pineconeIndex = getPineconeIndexWithNamespace(orgId);

  console.log(`Sample vector data for OrgId: ${orgId}`);
  const listVectorResponse = await pineconeIndex.listPaginated({
    limit: 10,
  });

  const vectors = listVectorResponse.vectors;
  const vectorIds = vectors.map((vector) => vector.id);

  const vectorData = await pineconeIndex.fetch(vectorIds);

  for (const vectorId in vectorData.records) {
    console.log(`VectorId: ${vectorId}`);
    const values = vectorData.records[vectorId];
    const id = values.id;
    const metadata = values.metadata;
    console.log(`Id: ${id}`);
    console.log("\n");
    console.log(`Metadata: ${JSON.stringify(metadata, null, 2)}`);
    console.log(
      "#################################################################################\n"
    );
  }
};

const getStats = async () => {
  // Get index stats
  const { data: indexStats } = await axios.post(
    `${pineconeIndexHost}/describe_index_stats`,
    {},
    {
      headers: { "API-Key": process.env.PINECONE_API_KEY },
    }
  );

  const namespaces = indexStats.namespaces;
  const orgIds = Object.keys(namespaces).sort();
  console.log(`Namespaces/OrgIds: ${orgIds}`);

  await Promise.all(orgIds.map(renderStatsForNamespace));
};

exports.handler = async (event, context) => {
  await getStats();
  return {
    statusCode: 200,
  };
};

// exports.handler();
