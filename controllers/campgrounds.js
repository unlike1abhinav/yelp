const Campground = require('../models/campground');
const cloudinary = require('cloudinary').v2;
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (request, response) => {
    response.render('campgrounds/new')
}

module.exports.createCampground = async (request, response, next) => {
    // if(!request.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const geoData = await maptilerClient.geocoding.forward(request.body.campground.location, { limit: 1 });
    const newCampground = new Campground(request.body.campground);
    newCampground.geometry = geoData.features[0].geometry;
    newCampground.images = request.files.map(f => ({ url: f.path, filename: f.filename }))
    newCampground.author = request.user._id
    await newCampground.save();
    request.flash('success', 'Successfully made a new campground');
    response.redirect(`/campgrounds/${newCampground._id}`)
}

module.exports.showCampground = async (request, response) => {
    const { id } = request.params;
    const foundcampground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!foundcampground) {
        request.flash('error', 'Campground Not found');
        return response.redirect('/campgrounds');
    }
    response.render('campgrounds/show', { foundcampground })
}

module.exports.editCampground = async (request, response) => {
    const { id } = request.params;
    const editcampground = await Campground.findById(id);
    if (!editcampground) {
        request.flash('error', 'Campground Not found');
        return response.redirect('/campgrounds');
    }
    const toBeEditedCampground = await Campground.findById(id)
    if (!toBeEditedCampground.author.equals(request.user._id)) {
        request.flash('error', 'You donot have permission to do that')
        response.redirect(`/campgrounds/${id}`);
    }
    response.render('campgrounds/edit', { editcampground })
}

module.exports.updateCampground = async (request, response) => {
    const { id } = request.params;
    const toBeUpdatedCampground = await Campground.findById(id)
    if (!toBeUpdatedCampground.author.equals(request.user.id)) {
        request.flash('error', 'You donot have permission to do that')
        response.redirect(`/campgrounds/${id}`);
    }
    const updatedcampground = await Campground.findByIdAndUpdate(id, { ...request.body.campground }, { runValidators: true, new: true });
    const images = request.files.map(f => ({ url: f.path, filename: f.filename }))
    await updatedcampground.images.push(...images)
    await updatedcampground.save();
    if (request.body.deleteImages) {
        for (let filename of request.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await updatedcampground.updateOne({ $pull: { images: { filename: { $in: request.body.deleteImages } } } })
    }
    request.flash('success', 'Successfully updated campground')
    response.redirect(`/campgrounds/${updatedcampground._id}`)
}

module.exports.deleteCampground = async (request, response) => {
    const { id } = request.params;
    const toBeDeletedCampground = await Campground.findById(id)
    if (!toBeDeletedCampground.author.equals(request.user.id)) {
        request.flash('error', 'You donot have permission to do that')
        response.redirect(`/campgrounds/${id}`);
    }
    await Campground.findOneAndDelete(id);
    request.flash('success', 'Successfully Deleted Campground')
    response.redirect('/campgrounds')
}