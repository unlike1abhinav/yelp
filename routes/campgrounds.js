const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer  = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage })

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post( isLoggedIn,upload.array('image'),validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(isLoggedIn, catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, upload.array('image'), catchAsync(campgrounds.updateCampground))
    .delete(catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, catchAsync(campgrounds.editCampground))

module.exports = router;