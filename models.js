const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false, // Toggle logging if needed
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
  
const User = sequelize.define('user', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  phone_number: Sequelize.STRING,
  priority: Sequelize.INTEGER,
});

const Task = sequelize.define('task', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  title: Sequelize.STRING,
  description: Sequelize.STRING,
  due_date: Sequelize.DATE,
  status: Sequelize.STRING,
  deleted_at: Sequelize.DATE,
  priority: Sequelize.INTEGER,
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
});

const SubTask = sequelize.define('sub_task', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  status: Sequelize.INTEGER,
  taskId: {
    type: Sequelize.INTEGER,
    references: {
      model: 'tasks',
      key: 'id',
    },
  },
});

User.hasMany(Task);
Task.belongsTo(User);
Task.hasMany(SubTask);
SubTask.belongsTo(Task);

sequelize.sync({ alter: true });

module.exports = { User, Task, SubTask };
