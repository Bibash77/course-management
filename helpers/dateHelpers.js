const moment = require('moment');

module.exports = (Handlebars) => {
  // Helper to format the due date
  Handlebars.registerHelper('formatDate', function (date) {
    return moment(date).format('ddd, MMM D, YYYY'); // Formats date like 'Fri, Mar 07, 2025'
  });

  // Helper to calculate the number of days left
  Handlebars.registerHelper('daysLeft', function (dueDate) {
    const today = moment().startOf('day'); // Get today's date, starting from midnight
    const due = moment(dueDate).startOf('day'); // Get the due date starting from midnight
    const daysRemaining = due.diff(today, 'days'); // Get the difference in days
    return daysRemaining;
  });

  // Helper to calculate the average score
  Handlebars.registerHelper('average', function(assignments) {
    if (!assignments || assignments.length === 0) return "N/A";
    let sum = 0;
    assignments.forEach(a => sum += a.score);
    return (sum / assignments.length).toFixed(2);
  });
};
