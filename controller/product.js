const productModel = require("../models/productModel");
const {
    isValid,
    isValidObjectId,
    isValidRequestBody,
    validString,
    isValidImg,
    isValidSize,
    isValidTName,
} = require("../utils/util");


//<<============================ Create  Product  ==============================>>//

const createProducts = async function (req, res) {
    try {
        let data = req.body;
        let userId = req.userId
        let {
            title,
            description,
            price,
            currencyId,
            availableSizes,
        } = data;

        if (!isValidRequestBody(data)) {
            return res.status(400).send({
                status: false,
                message: "Provide the data for creating product ",
            });
        }

        if (!isValid(title)) {
            return res
                .status(400)
                .send({ status: false, message: "Provide the title Name " });
        }

        let checkTitle = await productModel.findOne({ title: title.toLowerCase() });
        if (checkTitle) {
            return res.status(400).send({
                status: false,
                message: "Product with this title is already present",
            });
        }
        data.title = title.toLowerCase();

        if (!isValid(description)) {
            return res.status(400).send({
                status: false,
                message: "please write description about product ",
            });
        }

        if (!isValid(price)) {
            return res
                .status(400)
                .send({ status: false, message: "price is required" });
        }

        if (!/\d+(?:[.,]\d{0,2})?/.test(price)) {
            return res
                .status(400)
                .send({ status: false, message: "price Must be in Numbers" });
        }


        if (!isValid(currencyId)) {
            return res
                .status(400)
                .send({ status: false, message: "Provide the currencyId " });
        }

        if (!isValidSize(availableSizes)) {
            return res.status(400).send({
                status: false,
                message: `size should be one these only "S", "XS", "M", "X", "L", "XXL", "XL" `,
            });
        }

        let sizes = availableSizes
            .toUpperCase()
            .trim()
            .split(",")
            .map((e) => e.trim());

        data.availableSizes = sizes;

        data.userId=userId
        const createdProduct = await productModel.create(data);
        return res.status(201).send({
            status: true,
            message: "Success",
            data: createdProduct,
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

//<<============================Get Product By Id ==============================>>//

const getProduct = async function (req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skipIndex = (page - 1) * limit;

        const findProductDb = await productModel.find({
            isDeleted: false,
        }).skip(skipIndex)
            .limit(limit)

        if (!findProductDb) {
            return res.status(404).send({ status: false, message: "Data Not Found" });
        }

        return res.status(200).send({
            status: true,
            message: "Success",
            data: findProductDb,
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};


const updateProductbyId = async function (req, res) {
    try {
        let productId = req.params.productId;
        let userId = req.userId
        // console.log(productId)
        // console.log(userId)
        if (productId.length == 0 || productId == ":productId")
            return res
                .status(400)
                .send({ status: false, message: "Please enter productId in params" });
        if (!isValidObjectId(productId))
            return res
                .status(400)
                .send({ status: false, message: "Enter Id in valid Format" });

        let data = await productModel.findOneAndUpdate({_id:productId,userId:userId},{new:true});
        if (!data)
            return res
                .status(404)
                .send({ status: false, message: "No Data found with this ID" });
        if (data.isDeleted == true) {
            return res
                .status(400)
                .send({ status: false, message: "This product is Deleted" });
        }

        let body = req.body;


        let {
            title,
            description,
            price,
            availableSizes,
            isFreeShipping,
        } = body;

        if ("title" in body) {
            if (!isValid(title))
                return res
                    .status(400)
                    .send({ status: false, message: "Title should not be empty" });
            if (!isValidTName(title))
                return res
                    .status(400)
                    .send({ status: false, message: "Enter Valid Title Name" });

            let istitle = await productModel.findOne({ title: title.toLowerCase() });

            if (istitle)
                return res
                    .status(400)
                    .send({ status: false, message: `${title} is already exists` });

            let title1 = title
                .split(" ")
                .filter((e) => e)
                .join(" ");
            data.title = title1.toLowerCase();
        }

        if ("description" in body) {
            if (!isValid(description))
                return res
                    .status(400)
                    .send({ status: false, message: "Description should not be empty" });
            data.description = description
                .split(" ")
                .filter((e) => e)
                .join(" ");
        }
        if ("price" in body) {
            if (!isValid(price))
                return res
                    .status(400)
                    .send({ status: false, message: "Price should not be empty" });
            if (isNaN(parseInt(price)))
                return res
                    .status(400)
                    .send({ status: false, message: "Price Should Be A Number" });
            data.price = price;
        }

        if ("isFreeShipping" in body) {
            if (!isValid(isFreeShipping))
                return res.status(400).send({
                    status: false,
                    message: "isFreeShipping should not be empty",
                });
            if (
                !(
                    isFreeShipping.toLowerCase() === "true" ||
                    isFreeShipping.toLowerCase() === "false"
                )
            )
                return res.status(400).send({
                    status: false,
                    message: "isFreeShipping should be only True False",
                });
            data.isFreeShipping = isFreeShipping.toLowerCase();
        }

        if ("availableSizes" in body) {
            if (!isValid(availableSizes))
                return res.status(400).send({
                    status: false,
                    message: "AvailableSizes should not be empty",
                });
            let sizes = availableSizes
                .toUpperCase()
                .trim()
                .split(",")
                .map((e) => e.trim());
            for (let i = 0; i < sizes.length; i++) {
                if (!isValidSize(sizes[i]))
                    return res.status(400).send({
                        status: false,
                        message: `This Size ( ${sizes[i]} ) is not from these ['S', 'XS','M','X', 'L','XXL','XL']`,
                    });
            }
            let savedSize = await productModel
                .findById(productId)
                .select({ availableSizes: 1, _id: 0 });
            let value = savedSize["availableSizes"].valueOf();

            let savedata = await productModel.findOneAndUpdate(
                { _id: productId },
                { availableSizes: sizes },
                { new: true }
            );
            data.availableSizes = savedata.availableSizes;
        }
        data.save();
        res.status(200).send({
            status: true,
            message: "Update product details is successful",
            data: data,
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

//<<============================ Delete Product By Id ==============================>>//

const deleteProductbyId = async function (req, res) {
    try {
        let Pid = req.params.productId;

        if (!isValidObjectId(Pid)) {
            return res.status(400).send({
                status: false,
                message: "Invalid Product ID please Provide Valid Credential",
            });
        }

        const findProductDb = await productModel.findOneAndUpdate(
            {
                _id: Pid,
                isDeleted: false,
            },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!findProductDb) {
            return res
                .status(404)
                .send({ status: false, message: "Data Not Found Or Already Deleted" });
        }

        return res.status(200).send({
            status: true,
            message: "Deleted Successfully",
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports = {
    createProducts,
    getProduct,
    updateProductbyId,
    deleteProductbyId,
};
