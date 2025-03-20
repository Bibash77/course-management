const mongoose = require("mongoose");

const connectDatabase = async () => {
  console.log("sdsafdsaf", process.env.DB_URI)
  mongoose.Promise = global.Promise;
  // `mongodb://${dbAddress}:${dbPort}/${dbName}`
 await mongoose
    .connect('mongodb://194.163.40.116:28017/grading_db', {
      user: 'grading_user_new',
      pass: 'Grader@321.#'

    })
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    }).catch((error) => {
      console.log(error);
    });
};

module.exports = connectDatabase;
