const { MongoClient } = require("mongodb");
const state = { db: null };

module.exports.connect = async function () {
  const url = "mongodb+srv://ajinrajeshhillten:VHRKT9o3NOkANMro@cluster0.wzwl584.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const dbname = "blog";

  try {
    const client = await MongoClient.connect(url);
    state.db = client.db(dbname);
    console.log("Database connected");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
};

module.exports.get = function () {
  return state.db;
};
