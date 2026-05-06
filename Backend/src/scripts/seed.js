import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

async function run() {
  await connectDB(process.env.MONGODB_URI);

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
  ]);

  const password = await bcrypt.hash('password123', 10);
  const [admin, alice, bob] = await User.create([
    { name: 'Admin User', email: 'admin@demo.com', passwordHash: password, role: 'admin' },
    { name: 'Alice', email: 'alice@demo.com', passwordHash: password, role: 'member' },
    { name: 'Bob', email: 'bob@demo.com', passwordHash: password, role: 'member' },
  ]);

  const website = await Project.create({
    name: 'Website Redesign',
    description: 'Refresh the marketing site.',
    createdBy: admin._id,
    members: [admin._id, alice._id, bob._id],
  });

  const mobile = await Project.create({
    name: 'Mobile App',
    description: 'Build the v1 iOS/Android app.',
    createdBy: admin._id,
    members: [admin._id, alice._id],
  });

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Task.create([
    { project: website._id, title: 'Design hero section', status: 'in_progress',
      assignee: alice._id, createdBy: admin._id, dueDate: nextWeek },
    { project: website._id, title: 'Set up CI/CD', status: 'todo',
      assignee: bob._id, createdBy: admin._id, dueDate: yesterday },
    { project: website._id, title: 'Write copy for About page', status: 'done',
      assignee: alice._id, createdBy: admin._id },
    { project: mobile._id, title: 'Wire up authentication', status: 'todo',
      assignee: alice._id, createdBy: admin._id, dueDate: nextWeek },
    { project: mobile._id, title: 'Push notifications spike', status: 'in_progress',
      assignee: null, createdBy: admin._id },
  ]);

  console.log('Seed complete:');
  console.log('  admin@demo.com / password123  (admin)');
  console.log('  alice@demo.com / password123  (member)');
  console.log('  bob@demo.com   / password123  (member)');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
