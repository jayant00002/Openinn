# Openinn
You have to create following APIs:
1. Create task - input is title, description and due_date with jwt auth token
2. Create sub task - input is task_id
3. Get all user task(with filter like priority, due date and proper pagination etc)
4. Get all user sub tasks (with filter like task_id if passed)
5. Update task- due_date, status-”TODO” or “DONE” can be changed
6. Update subtask - only status can be updated - 0,1
7. Delete task(soft deletion)
8. Delete sub task(soft deletion)

And the following cron jobs
1. Cron logic for changing priority of task based on due_date of task (refer below for priority)
2. Cron logic for voice calling using twilio if a task passes its due_date. Calling should be based on priority of the user, i.e. first the user with priority 0 should be called, then 1 and then 2. The user should only be called if the previous user does not attend the call. This priority should be fetched from the user table.
