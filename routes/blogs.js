const { Blog } = require('../models/blog');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) =>{
    const blogList = await Blog.find().select('');

    if(!blogList) {
        res.status(500).json({success: false})
    } 
    res.send(blogList);
})

router.get(`/:id`, async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        res.status(500).json({ success: false });
    }
    res.send(blog);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let blog = new Blog({
        name: req.body.name,
        description: req.body.description,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
    });

    blog = await blog.save();

    if (!blog) return res.status(500).send('The blog cannot be created');

    res.send(blog);
});


router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Blog Id');
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(400).send('Invalid Blog!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image: imagepath,
        },
        { new: true }
    );

    if (!updatedBlog)
        return res.status(500).send('the blog cannot be updated!');

    res.send(updatedBlog);
});

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((blog) => {
            if (blog) {
                return res
                    .status(200)
                    .json({
                        success: true,
                        message: 'the blog is deleted!',
                    });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'blog not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get(`/get/count`, async (req, res) => {
    const blogCount = await Blog.countDocuments((count) => count);

    if (!blogCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        blogCount: blogCount,
    });
});


router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Blog Id');
        }
        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }

        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!blog)
            return res.status(500).send('the gallery cannot be updated!');

        res.send(blog);
    }
);

module.exports = router;