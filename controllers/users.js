const User = require('../models/user');

module.exports.registerUser = (request, response) => {
    response.render('user/register')
}

module.exports.createUser = async (request, response) => {
    try {
        const { email, username, password } = request.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        request.login(registeredUser, error => {
            if (error) return next(error);
            request.flash('success', 'Welcome to Yelp Camp');
            response.redirect('/campgrounds')
        })
    }
    catch (e) {
        request.flash('error', e.message);
        response.redirect('register')
    }
}

module.exports.loginUser = (request, response) => {
    response.render('user/login')
}