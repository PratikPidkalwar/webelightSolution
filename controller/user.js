const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const bcrypt=require("bcrypt");

const {
    isValid,
    isValidRequestBody,
    isValidName,
    isvalidEmail,
    moblieRegex,
    isValidObjectId,
    isValidPassword,
  } = require("../utils/util");

  
const userRegister = async function (req, res) {
    try {
  
      let userDetails = req.body;
      let { fname, lname, email, phone, password, city } = userDetails;
  
      if (!isValidRequestBody(userDetails)) {
        return res
          .status(400)
          .send({ status: false, message: "please provide user Details" });
      }
  
      if (!isValid(fname)) {
        return res
          .status(400)
          .send({ status: false, message: "first name is required" });
      }
  
      if (!isValidName(fname))
        return res
          .status(400)
          .send({ status: false, message: "Name must contain only alphabates" });
  
      if (!isValid(lname)) {
        return res
          .status(400)
          .send({ status: false, message: "last name is required" });
      }
  
      if (!isValidName(lname))
        return res.status(400).send({
          status: false,
          message: "Last Name must contain only alphabates",
        });
  
      if (!isValid(email)) {
        return res
          .status(400)
          .send({ status: false, message: "Email-ID is required" });
      }
  
      if (!isvalidEmail(email))
        return res.status(400).send({
          status: false,
          message: "Invalid Email id. Ex: example12@gmail.com",
        });
  
      const checkEmailFromDb = await userModel.findOne({ email: email });
  
      if (checkEmailFromDb) {
        return res.status(400).send({
          status: false,
          message: `emailId already Exists. Please try another email Id.`,
        });
      }
  
      if (!isValid(phone)) {
        return res
          .status(400)
          .send({ status: false, message: "phone number is required" });
      }
  
      if (!moblieRegex(phone))
        return res.status(400).send({
          status: false,
          message: "Phone number must be a valid Indian number .",
        });
  
      const checkPhoneFromDb = await userModel.findOne({ phone: phone });
  
      if (checkPhoneFromDb) {
        return res.status(400).send({
          status: false,
          message: `${phone} is already in use, Please try a new phone number.`,
        });
      }
  
      if (!isValid(password)) {
        return res
          .status(400)
          .send({ status: false, message: "password is required" });
      }
  
      if (password.length < 8 || password.length > 15) {
        return res
          .status(400)
          .send({ status: false, message: "Password must be of 8-15 letters." });
      }
      if (!isValidPassword(password))
        return res.status(400).send({
          status: false,
          message: `Password ${password}  must include atleast one special character[@$!%?&], one uppercase, one lowercase, one number and should be mimimum 8 to 15 characters long for Example:Password@123`,
        });
  
      if (!isValid(city))
        return res
          .status(400)
          .send({ status: false, message: "city is a mandatory field" });
  
    
/********************************************** Create Phase **********************************************/
  
     
      const hashedPassword = await bcrypt.hash(password, 10);
  
     
      password = hashedPassword;
  
      const userData = {
        city,
        fname,
        lname,
        email,
        phone,
        password,
      };
  
      const saveUserInDb = await userModel.create(userData);
  
      return res.status(201).send({
        status: true,
        message: "user created successfully!!",
        data: saveUserInDb,
      });
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  };
  
  //<<================================= User Login ============================>>//
  
  const loginUser = async function (req, res) {
    try {
      let body = req.body;
      const { email, password } = body;
  
      if (!isValidRequestBody(body))
        return res
          .status(400)
          .send({ status: false, message: "Body Should not be empty" });
  
      if (!email)
        return res
          .status(400)
          .send({ status: false, message: "Please enter email" });
  
      if (!isValid(email))
        return res
          .status(400)
          .send({ status: false, message: "email should not be empty" });
  
      if (!isvalidEmail(email))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid email" });
  
      if (!password)
        return res
          .status(400)
          .send({ status: false, message: "Please enter password" });
  
      if (!isValid(password))
        return res
          .status(400)
          .send({ status: false, message: "Password should not be empty" });
  
      let user = await userModel.findOne({ email: email });
  
      if (!user)
        return res
          .status(401)
          .send({ status: false, message: "Please use valid credentials" });
  
      bcrypt.compare(password, user.password, function (err, result) {
        hasAccess(result);
      });
  
      function hasAccess(result) {
        if (result) {
          // insert login code here
          console.log("Access Granted!");
          let token = jwt.sign(
            {
              userId: user._id.toString(),
              Project: "Product Management",
              
            },
            "project-webelight",
            { expiresIn: "24h" }
          );
          // res.setHeader("x-api-key", token);
          res.setHeader("Authorization", "Bearer", token);
  
          return res.status(201).send({
            status: true,
            message: "Successfully loggedin",
            userId: user._id,
            data: token,
          });
        } else {
          // insert access denied code here
          console.log("Access Denied!");
          return res.status(401).send({
            status: false,
            message: "login denied ",
          });
        }
      }
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  };
  
 
  
  module.exports = { userRegister, loginUser };
