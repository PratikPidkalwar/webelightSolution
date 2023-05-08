const productModel = require("../models/productModel");
const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("../utils/util");

const Authentication = async function (req, res, next) {
    try {
        // const token = req.headers["x-api-key"] || req.headers["x-Api-key"];
        // console.log(token);
        let tokenWithBearer = req.headers["authorization"];

        if (!tokenWithBearer) {
            return res
                .status(400)
                .send({ status: false, message: "token is required" });
        }
        let tokenArray = tokenWithBearer.split(" ");
        let token = tokenArray[1];

        if (!token) {
            return res.status(404).send({ status: false, message: "Invalid Token" });
        }
        const decodedToken = jwt.verify(token, "project-webelight");
        let LoginUserId = decodedToken.userId;
        // console.log(LoginUserId);
        if (!decodedToken) {
            return res
                .status(401)
                .send({ status: false, message: "Warning unauthorized" });
        }

        req["userId"] = LoginUserId;

        next();
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

const Authorization = async function (req, res, next) {
    try {
        let userId = req.userId;
        let productId = req.params.productId;

        if (!isValidObjectId(productId)) {
            return res
                .status(400)
                .send({ status: false, message: `ProductId ${productId} is invalid` });
        }
        const product = await productModel.findOne({ _id: productId });
        if (product.userId != userId)
            return res.status(403).send({ status: false, message: "User Unauthorized" });
        next();
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports = { Authentication, Authorization };