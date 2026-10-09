import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const line = env.split('\n').find(l => l.startsWith('MONGODB_URI='));
const uri = line.substring('MONGODB_URI='.length).trim();

async function run() {
  await mongoose.connect(uri);
  const hash = bcrypt.hashSync('admin123', 10);
  const res = await mongoose.connection.collection('users').updateOne(
    { email: 'admin@sovga.uz' },
    { $set: { password: hash } }
  );
  console.log('Admin password updated in MongoDB Atlas:', res.modifiedCount);
  await mongoose.disconnect();
}

run();
