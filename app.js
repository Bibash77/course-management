const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const path = require("path");
const connectDatabase = require("./database");
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");
const moment = require("moment");


const app = express();
connectDatabase();


// Register Handlebars helpers
require('./helpers/dateHelpers')(Handlebars);  // Import and apply helpers

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); // Add this to enable JSON parsing


app.engine(
    "handlebars",
    engine({
        defaultLayout: "main",
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        helpers: {
            average(assignments) {
                if (!assignments || assignments.length === 0) return "N/A";
                let sum = 0;
                assignments.forEach(a => sum += a.score);
                return (sum / assignments.length).toFixed(2);
            },

            // Helper to format the due date
            formatDate(date) {
                return moment(date).format('ddd, MMM D, YYYY');  // Formats date like 'Fri, Mar 07, 2025'
            },

            daysLeft(dueDate) {
                const today = moment().startOf('day');  // Get today's date at midnight
                const due = moment(dueDate).startOf('day');  // Get the due date at midnight
                const daysRemaining = due.diff(today, 'days');  // Get the difference in days
            
                if (daysRemaining < 0) return 0; // Return 0 if the due date has already passed
                return daysRemaining;
            },

            // Add comparison helpers
            lt(a, b) {
                return a < b;
            },
            
            gt(a, b) {
                return a > b;
            },

            gte(a, b) {
                return a >= b;
            },
            
            eq(a, b) {
                return a === b;
            },

            truncate(str, length) {
                if (str && str.length > length) {
                    return str.substring(0, length) + '...';
                }
                return str;
            },

            stripTags(str) {
                if (!str) return '';
                return str.replace(/<[^>]*>/g, '');
            }
        }
    })
);
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use("/students", require("./routes/students"));
app.use("/assignments", require("./routes/assignments"));
app.use("/", require("./routes/home"));
app.use("/marks",  require("./routes/marks"));
app.use("/courses", require("./routes/courses"));




app.listen(3000, () => console.log("Server running on port 3000"));
