import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { ProductModel, OfferModel } from "../server/db/models.js";

async function run() {
  try {
    if (process.loadEnvFile) process.loadEnvFile();
  } catch {}

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No MONGODB_URI found");
    return;
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas!");

  const dbPath = path.resolve(process.cwd(), "data", "database.json");
  if (!fs.existsSync(dbPath)) {
    console.log("data/database.json not found");
    await mongoose.disconnect();
    return;
  }

  console.log("Reading data/database.json...");
  const raw = fs.readFileSync(dbPath, "utf8");
  const data = JSON.parse(raw);

  const products = data.products || [];
  const offers = data.offers || [];

  console.log(`Found ${products.length} products and ${offers.length} offers.`);

  if (products.length > 0) {
    console.log("Upserting products into MongoDB Atlas via bulkWrite in batches of 1000...");
    const batchSize = 1000;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const ops = batch.map((p: any) => ({
        updateOne: {
          filter: { id: p.id },
          update: { $set: p },
          upsert: true,
        },
      }));
      await ProductModel.bulkWrite(ops, { ordered: false });
      console.log(`Synced products ${i + 1} to ${Math.min(i + batchSize, products.length)}`);
    }
  }

  if (offers.length > 0) {
    console.log("Upserting offers into MongoDB Atlas via bulkWrite in batches of 2000...");
    const batchSize = 2000;
    for (let i = 0; i < offers.length; i += batchSize) {
      const batch = offers.slice(i, i + batchSize);
      const ops = batch.map((o: any) => ({
        updateOne: {
          filter: { id: o.id },
          update: { $set: o },
          upsert: true,
        },
      }));
      await OfferModel.bulkWrite(ops, { ordered: false });
      console.log(`Synced offers ${i + 1} to ${Math.min(i + batchSize, offers.length)}`);
    }
  }

  const countP = await ProductModel.countDocuments();
  const countO = await OfferModel.countDocuments();
  console.log(`Successfully synced MongoDB Atlas! Total products: ${countP}, total offers: ${countO}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

run().catch((e) => {
  console.error("Sync error:", e);
  process.exit(1);
});
