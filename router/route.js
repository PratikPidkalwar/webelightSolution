const express = require("express");
const router = express.Router();

//<<<<<============================ Importing Modules ===============================>>>>>>>>//
const {
  userRegister,
  loginUser
} = require("../controller/user");

const {
  createProducts,
  getProduct,
  updateProductbyId,
  deleteProductbyId
} = require("../controller/product");

const { Authentication, Authorization } = require("../middleware/auth");

//<<<<============================ API and Method Routes =================================>>>>>//

//------------------- User APIs ------------------------------//

router.post("/register", userRegister);
router.post("/login", loginUser);

//-------------------------- Product APIs ----------------------//

router.post("/products", Authentication, createProducts);
router.get("/products", Authentication, getProduct);
router.put("/products/:productId",Authentication, Authorization, updateProductbyId);
router.delete("/products/:productId",Authentication, Authorization, deleteProductbyId);


//------------------- Exporting Modules -------------------//

module.exports = router;