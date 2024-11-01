const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (request, response) => {
    const campground = await Campground.findById(request.params.id);
    const review = new Review(request.body.review);
    review.author = request.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    request.flash('success', 'Created New Review')
    response.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (request, response) => {
    const {id, reviewID} = request.params;
    const toBeDeletedReview = await Review.findById(reviewID)
    if(! toBeDeletedReview.author.equals(request.user.id)){
        request.flash('error', 'You donot have permission to do that')
        response.redirect(`/campgrounds/${id}`);
    }
    await Campground.findByIdAndUpdate(id, { $pull : { reviews : reviewID}});
    await Review.findByIdAndDelete(reviewID);
    request.flash('success', 'Successfully Deleted Review')
    response.redirect(`/campgrounds/${id}`)
}