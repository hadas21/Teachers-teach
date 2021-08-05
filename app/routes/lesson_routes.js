//requirements
const express = require('express')
const router = express.Router()


//passport
const passport = require('passport')
const requireToken = passport.authenticate('bearer', { session: false })

//costum errors
const { handle404 } = require('../../lib/custom_errors')

//model
const Lesson = require('../models/lesson')

//create
router.post('/lessons', requireToken, (req, res, next) => {
    //connect user to lesson
    req.body.lesson.owner = req.user.id
    const lessonData = req.body.lesson
        //create lesson
    Lesson.create(lessonData)
        .then(lesson => {
            res.status(201).json({ lesson })
        })
        .catch(next)
})

//index
router.get('/lessons', requireToken, (req, res, next) => {
    Lesson.find({ owner: req.user.id })
        .then(handle404)
        // .then(lessons => {
        //     return lessons.map(lesson => lesson.toObject())
        // })
        .then(lessons => {
            res.status(200).json({ lessons })
        })
        .catch(next)
})


module.exports = router