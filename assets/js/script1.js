//Grab references to the important DOM elements.
const modalEl = $('#formModal');
//const projectDisplayEl = $('#project-display');
const taskNameInputEl = $('#task-title');
const taskDescriptionInputEl = $('#task-description');
const taskDateInputEl = $('#taskDueDate');

//Store to local storage
// Read tasks from local storage and returns array of task objects
function readTasksFromStorage() {
  let tasks = JSON.parse(localStorage.getItem('tasks'));
  if (!tasks) {
    tasks = [];
  }
  return tasks;
}
// Function to stringify the array of tasks, and saves them in localStorage.
function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
// create a function to handle adding a new task
// Adds a task to local storage and prints the task data
function handleAddTask(event) {
  event.preventDefault();
  // Read user input from the form
  const taskName = taskNameInputEl.val().trim();
  const taskDate = taskDateInputEl.val();
  const taskDescription = taskDescriptionInputEl.val();
  //Define the new task as a array and set the status to 'to-do'
  const newTask = {
    name: taskName,
    description: taskDescription,
    dueDate: taskDate,
    status: 'to-do',
  };
  //Pull the tasks from localStorage and push the new task to the array
  const tasks = readTasksFromStorage();
  tasks.push(newTask);
  // Save the updated tasks array to localStorage
  saveTasksToStorage(tasks);
  // Print task data back to the screen
  printTaskData();
  //Clear the form inputs
  taskNameInputEl.val('');
  taskDateInputEl.val('');
  taskDateInputEl.val('');
}
// Retrieve tasks and nextId from localStorage
//let taskList = JSON.parse(localStorage.getItem("tasks"));
//let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
//function generateTaskId() {

//}
// create a function to create a task card
function createTaskCard(task) {
//create elements for Task card
const taskCard = $('<div>')
   .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  //Delete button
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTasks);

  // Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
    // If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }
  // Append the elements to the card body and card body to the card
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);
  //  Return the card
  return taskCard;
}
// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const projects = readTasksFromStorage();
  // Empty existing project cards out of the lanes
  const todoList = $('#todo-cards');
  todoList.empty();
  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();
  const doneList = $('#done-cards');
  doneList.empty();

  // Loop through tasks and create task cards for each status
  for (let task of tasks) {
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inTaskList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createProjectCard(task));
    }
  }
  // Use JQuery UI to make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}
// Todo: create a function to handle deleting a task
function handleDeleteTask() {
  const taskId = $(this).attr('data-task-id');
  const tasks = readTasksFromStorage();
  //Remove a project from the array
  tasks.forEach((task) => {
    if (task.id === taskId) {
      tasks.splice(tasks.indexOf(task), 1);
    }
  });
  //Save remaining tasks to the localStorage
  saveTasksToStorage(tasks);
  // Print remaining tasks back on the screen after removing that particular task
  printTaskData();
}
// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const tasks = readTasksFromStorage();
  //Get the task id from the event
  const taskId = ui.draggable[0].dataset.taskId;
  // Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;
  for (let task of tasks) {
    // Find the task card by the `id` and update the project status.
    if (task.id === taskId) {
      task.status = newStatus;
    }
  }
  //Save the updated tasks array to localStorage and render the new task data to the screen.
  localStorage.setItem('tasks', JSON.stringify(tasks));
  printTaskData();
}
formButtonEl.on('click', handleAddTask);
//modalEl.on('submit', handleAddTask);
//projectDisplayEl.on('click', '.btn-delete-project', handleDeleteTask);
// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  //Date Picker Widget
  $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });
  // ? Make lanes droppable
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });
});

