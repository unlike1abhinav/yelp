const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users')

router.route('/register')
    .get(users.registerUser)
    .post(catchAsync(users.createUser))

router.route('/login')
    .get(users.loginUser)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (request, response) => {
        request.flash('success', 'Welcome Back');
        const reditrectUrl = response.locals.returnTo || '/campgrounds'
        delete request.session.returnTo
        response.redirect(reditrectUrl)
    })

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});

module.exports = router;