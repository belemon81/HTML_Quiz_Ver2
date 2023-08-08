const express = require('express');
const mongodb = require('mongodb');
// const QUESTIONS = require('./questions.json');
const cors = require('cors');
const ObjectID = require('mongodb').ObjectId;

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const MONGO_URL = 'mongodb://localhost:27017/wpr-quiz';
let db = null;
async function startServer() {
    const client = await mongodb.MongoClient.connect(MONGO_URL);
    db = client.db();
    console.log('Connected to database wpr-quiz!');

    // const result = db.collection('questions').find();
    // const questions = await result.toArray();
    // if (questions.length === 0) {
    //     for (let i = 0; i < QUESTIONS.length; i++) {
    //         const question = QUESTIONS[i];
    //         const question_data = {
    //             answers: question.answers,
    //             text: question.text,
    //             correctAnswer: question.correctAnswer.$numberInt
    //         }
    //         await db.collection('questions').insertOne(question_data);
    //     }
    // }

    app.listen(3000, async function (res, req) {
        console.log('Listening on port 3000');
    });
}
startServer();

// app.get('/attempts', async function (req, res) {
//     const result = await db.collection('attempts').find();
//     const attempts = await result.toArray();
//     res.json(attempts);
// });

// app.get('/questions', async function (req, res) {
//     const result = await db.collection('questions').find();
//     const questions = await result.toArray();
//     res.json(questions);
// });

app.post('/attempts', async function (req, res) {
    const questions = [];
    const questionCollection = await db.collection('questions').find();
    const question_list = await questionCollection.toArray();
    for (let i = 0; i <= 9; i++) {
        const index = Math.floor(Math.random() * 10);
        const question_data = {
            _id: ObjectID(),
            answers: question_list[index].answers,
            text: question_list[index].text,
        }
        questions.push(question_data);
    }
    const result = await db.collection('attempts').insertOne({
        questions: questions,
        startedAt: Date(),
        completed: false
    });
    const attempt = await db.collection('attempts').findOne({ _id: result.insertedId });
    res.status(201).json(attempt);
});

app.post('/attempts/:id/submit', async function (req, res) {
    const ID = req.params.id;
    const userAnswers = await req.body.userAnswers;

    const questionCollection = await db.collection('questions').find();
    const originQuestions = await questionCollection.toArray();

    const attemptCollection = await db.collection('attempts').findOne({ _id: ObjectID(ID) });
    const takenQuestion = await attemptCollection.questions;

    if (await attemptCollection.completed == false) {
        const correctAnswers = {};
        let score = 0;
        let scoreText = null;
        for (let i = 0; i <= 9; i++) {
            for (let j = 0; j <= 9; j++) {
                if (takenQuestion[i].text == originQuestions[j].text) {
                    correctAnswers[takenQuestion[i]._id] = originQuestions[j].correctAnswer;
                    if (userAnswers[takenQuestion[i]._id] == originQuestions[j].correctAnswer) {
                        score++;
                    }
                    break;
                }
            }
        }
        if (score < 5) scoreText = 'Practice more to improve it :D';
        else if (5 <= score && score < 7) scoreText = 'Good, keep up!';
        else if (7 <= score && score < 9) scoreText = 'Well done!';
        else if (9 <= score && score <= 10) scoreText = 'Perfect!!';
        await db.collection('attempts').updateOne({
            _id: ObjectID(ID)
        }, {
            $set: {
                'userAnswers': userAnswers,
                'correctAnswers': correctAnswers,
                'score': score,
                'scoreText': scoreText,
                completed: true
            },
        });
    }
    const attempt = await db.collection('attempts').findOne({ _id: ObjectID(ID) });
    res.status(200).json(attempt);
});