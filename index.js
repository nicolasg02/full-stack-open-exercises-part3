const express = require('express'); // server
const app = express();
const cors = require('cors');
app.use(cors());
require('dotenv').config();
const Person = require('./models/persons');
const morgan = require('morgan'); // middleware

morgan.token('body', (req, res) => {
  return req.body;
});

const requestLogger = (tokens, req, res) => {
  console.log('Method:', tokens.method(req, res));
  console.log('Path:', tokens.url(req, res));
  console.log('Status:', tokens.status(req, res));
  console.log('Content Length:', tokens.res(req, res, 'content-length'));
  console.log('Response Time:', tokens['response-time'](req, res), 'ms');
};

app.use(express.static('build'));
app.use(express.json());
app.use(morgan(requestLogger));

// get all contacts
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name missing' });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then(savedPerson => {
    response.json(savedPerson);
  });
});

// get contacts length
app.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p> ${new Date()}`
  );
});

// single contact url
app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person);
  });
});

// delete contact
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

const unknownEndPoint = (request, response) => {
  response.status(400).send({ error: 'unknown endpoint' });
};

app.use(unknownEndPoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
