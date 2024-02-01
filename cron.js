require('dotenv').config();
const cron = require('node-cron');
const Twilio = require('twilio');
const { Task, User } = require('./models'); // Assuming these are your Sequelize models

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const updateTaskPriorities = async () => {
  const now = new Date();
  const tasks = await Task.findAll({
    where: {
      due_date: {
        [Sequelize.Op.lt]: now, // Find tasks with due_date before now
      },
      deleted_at: null, // Exclude soft-deleted tasks
    },
  });

  for (let task of tasks) {
    let priority;
    const dueDate = new Date(task.due_date);
    const diffDays = (dueDate - now) / (1000 * 60 * 60 * 24);

    if (diffDays <= 0) priority = 0; // Due date is today or past
    else if (diffDays <= 2) priority = 1; // Due date is between tomorrow and the day after
    else if (diffDays <= 4) priority = 2; // 3-4 days away
    else priority = 3; // 5+ days away

    task.priority = priority;
    await task.save();
  }
};

// Schedule the task to run at midnight every day
cron.schedule('0 0 * * *', updateTaskPriorities);

// Function to make a call and return a promise that resolves with whether the call was attended
const makeCall = async (user) => {
    try {
      const call = await twilioClient.calls.create({
        url: 'http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient', // Update with your TwiML URL
        to: user.phone_number,
        from: process.env.TWILIO_PHONE_NUMBER,
        //statusCallback: 'http://yourapp.com/call-status', 
        statusCallbackEvent: ['completed'],
        statusCallbackMethod: 'POST',
      });
  
      console.log(`Call initiated to user ${user.id}: ${call.sid}`);
  
      // Placeholder for logic to determine if the call was attended, based on your app's logic
      // This could involve listening for a webhook event on '/call-status'
      return false; // Return true if call was attended, false otherwise
    } catch (error) {
      console.error(`Error calling user ${user.id}: ${error.message}`);
      return false; // Assume call was not attended in case of error
    }
  };
  
  const callUsersForOverdueTasks = async () => {
    const now = new Date();
    const overdueTasks = await Task.findAll({
      where: {
        due_date: { [Sequelize.Op.lt]: now },
        // Add any additional filters for tasks here
      },
      include: [{
        model: User,
        where: { deleted_at: null }, // Assuming soft deletion
      }],
      order: [[User, 'priority', 'ASC']], // Order by user priority
    });
  
    for (let task of overdueTasks) {
      const wasAttended = await makeCall(task.User);
      if (wasAttended) break; // Stop calling if the current call was attended
    }
  };
  
  // Schedule the job to run at a specific time, e.g., every hour ('0 * * * *')
  cron.schedule('1 * * * *', callUsersForOverdueTasks);