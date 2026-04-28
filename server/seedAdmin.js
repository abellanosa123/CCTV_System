const bcrypt = require('bcryptjs');
const fs = require('fs');

const hash = bcrypt.hashSync('madein03132026', 10);
const usersJsonPath = 'c:/Users/User/OneDrive/Desktop/CDRRMO_Project/CCTV_System/server/data/users.json';
let users = [];

if (fs.existsSync(usersJsonPath)) {
  try {
    users = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
  } catch (e) {
    users = [];
  }
}

const adminIndex = users.findIndex(u => u.username === 'Admin Carl');
const adminData = {
  _id: "admin1",
  name: "Admin Carl",
  username: "Admin Carl",
  password: hash,
  role: "admin",
  status: "approved",
  createdAt: new Date().toISOString()
};

if (adminIndex > -1) {
  users[adminIndex] = { ...users[adminIndex], ...adminData };
} else {
  users.push(adminData);
}

fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2));
console.log('Successfully updated admin user in users.json');
