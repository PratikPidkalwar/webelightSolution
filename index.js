const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const route = require("./router/route");

const app = express();
const testPort = 3000;

app.use(bodyParser.json());


mongoose.connect(
    "mongodb+srv://Mayank:BQLIMbMPNU5zRxJl@cluster0.3iupxhb.mongodb.net/webelight?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is connected!"))
  .catch((err) => console.log(err));

app.use("/", route);
app.use("*", (req, res) => {
  return res.status(400).send({ status: false, message: "Bad Url request!" });
});

app.listen(process.env.PORT || testPort, () => {
  console.log(`Express app running on port ` + (process.env.PORT || testPort));
});