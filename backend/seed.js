const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const password_hash = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      email: 'admin@despensa.com',
      password_hash,
    });

    console.log('Admin user created: admin / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();
