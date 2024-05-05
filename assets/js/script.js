//Grab references to the important DOM elements.
const taskDisplayEl = $('#task-display');
const modalEl = $('#form');//form elemnt 
//const formButtonEl = $('#add-task-button');
const taskNameInputEl = $('#task-title');
const taskDescriptionInputEl = $('#task-description');
const taskDateInputEl = $('#taskDueDate');

//Store to local storage
// Read tasks from local storage and returns array of task objects
function readTasksFromStorage() {
  //get the task array from the local storage
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
//create a function to create a task card
// Creates a task card from the user inputs
function createTaskCard(task) {
  const taskCard = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  // Sets the card background color based on due date. 
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
  // Append the elements created
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);
  //Return the card so it can be appended to the correct lane.
  return taskCard;
}
//create a function to render the task list and make cards draggable
//read the tasks stored in the localStorage and print it to the screen
function printTaskData() {
  const tasks = readTasksFromStorage();
  //Empty existing task cards out of the lanes
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
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
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
//create a function to handle deleting a task
// Removes a project from local storage and prints the project data back to the page
function handleDeleteTask() {
  const taskId = $(this).attr('data-task-id');
  //get the tasks stored in the local storage and asign it to a variable
  const tasks = readTasksFromStorage();
  // Remove task from the array
  tasks.forEach((task) => {
    //check the id of the task in the array matches the task id that is being removed
    if (task.id === taskId) {
      tasks.splice(tasks.indexOf(task), 1);
    }
  });
  //Save remaining tasks back to the localStorage
  saveTasksToStorage(tasks);
  //Print the remaing tasks back to the screen
  printTaskData();
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
  taskDescriptionInputEl.val('');
}
//create a function to handle dropping a task into a new status lane
//function to drag the task card from one column to another
function handleDrop(event, ui) {
  //Read tasks from localStorage
  const tasks = readTasksFromStorage();
  //get the id of the data card that is being dragged and save it to a variable
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;
  //iterate to each task infoto set the new status to that particular task
  for (let task of tasks) {
    if (task.id === taskId) {
      task.status = newStatus;
    }
  }
  //store the task with the the updated status back to the localStorage
  localStorage.setItem('tasks', JSON.stringify(tasks));
  //print the task back to the screen 
  printTaskData();
}
//formButtonEl.on('click', handleAddTask);
//Call the Add Task function when the Modal form is submitted
modalEl.on('submit', handleAddTask);
//call the delete task button when the display elemnt is on
taskDisplayEl.on('click', '.btn-delete-task', handleDeleteTask);
//when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  //print task data to the screen on page load
  printTaskData();
  //Date Picker Widget
  $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });
  // Make lanes droppable
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });
});