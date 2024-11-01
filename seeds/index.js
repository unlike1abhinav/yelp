const mongoose = require("mongoose");
const cities = require('./cities.js');
const { places, descriptors } = require('./seedhelpers');
const Campground = require('../models/campground')

mongoose.connect('mongodb://127.0.0.1:27017/yelpCampground')
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch(() => {
        console.log("Mongo Error")
    })

const sample = (array) => array[Math.floor(Math.random() * (array.length))]

const seedDB = async (request, response) => {
    await Campground.deleteMany({});
    for (let index = 0; index < 300; index++) {
        const random = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 15000)
        const camp = new Campground({
            author: '67184ac9366573fcfe35b33d',
            location: `${cities[random].city}, ${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/daburf8ec/image/upload/v1730266764/Yelpcamp/pirg5fivbjphfaem5xaz.jpg',
                    filename: 'Yelpcamp/pirg5fivbjphfaem5xaz'
                },
                {
                    url: 'https://res.cloudinary.com/daburf8ec/image/upload/v1730266764/Yelpcamp/f2memiv2usxy32aibutn.jpg',
                    filename: 'Yelpcamp/f2memiv2usxy32aibutn',
                },
                {
                    url: 'https://res.cloudinary.com/daburf8ec/image/upload/v1730266765/Yelpcamp/zbokwrnyb1okudwtuz7v.jpg',
                    filename: 'Yelpcamp/zbokwrnyb1okudwtuz7v',
                }
            ],
            geometry: {
                type: 'Point',
                coordinates: [cities[random].longitude, cities[random].latitude]
            },
            description: 'This is description for Campground',
            price: price
        })
        await camp.save();
    }
}

seedDB()
    .then(() => {
        console.log("Seeding complete!");
    })
    .catch((err) => {
        console.error("Error during seeding:", err);
    })
    .finally(() => {
        mongoose.connection.close();
    });