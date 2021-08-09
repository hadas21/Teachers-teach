//requirements
const express = require('express')
const router = express.Router()

//passport
const passport = require('passport')
const requireToken = passport.authenticate('bearer', { session: false })

//costum errors
const { handle404, requireOwnership } = require('../../lib/custom_errors')

//middleware 
const removeBlanks = require('../../lib/remove_blank_fields')

//model
const Lesson = require('../models/lesson')

//create
router.post('/lessons', requireToken, (req, res, next) => {
    //connect user to lesson
    req.body.lesson.owner = req.user._id
    const lessonData = req.body.lesson
        //create lesson
    Lesson.create(lessonData)
        .then(lesson => {
            res.status(201).json({ lesson })
        })
        .catch(next)
})

//index all users
router.get('/all', (req, res, next) => {
    console.log('hey')
    Lesson.find()

    // .then(lessons => {
    //         return lessons.map(lesson => lesson.toObject())
    //     })
    .then(lessons => res.status(200).json({ lessons }))
        .catch(next)
})

//index user
router.get('/lessons', requireToken, (req, res, next) => {
    Lesson.find({ owner: req.user.id })

    .then(lessons => {
            res.status(200).json({ lessons })
        })
        .catch(next)
})



//update
router.patch('/lessons/:id', requireToken, removeBlanks, (req, res, next) => {
    // if the client attempts to change the `owner` property by including a new
    // owner, prevent that by deleting that key/value pair
    delete req.body.lesson.owner

    Lesson.findById(req.params.id)
        .then(handle404)
        .then(lesson => {
            // pass the `req` object and the Mongoose record to `requireOwnership`
            // it will throw an error if the current user isn't the owner
            requireOwnership(req, lesson)

            // pass the result of Mongoose's `.update` to the next `.then`
            return lesson.updateOne(req.body.lesson)
        })
        // if that succeeded, return 204 and no JSON
        .then(lesson => {
            res.status(204).json({ lesson })
        })
        // if an error occurs, pass it to the handler
        .catch(next)
})

//delete
router.delete('/lessons/:id', requireToken, (req, res, next) => {
    Lesson.findById(req.params.id)
        .then(handle404)
        .then(lesson => {
            // throw an error if current user doesn't own `example`
            requireOwnership(req, lesson)
                // delete the example ONLY IF the above didn't throw
            lesson.deleteOne()
        })
        // send back 204 and no content if the deletion succeeded
        .then(() => res.sendStatus(204))
        // if an error occurs, pass it to the handler
        .catch(next)
})


module.exports = router