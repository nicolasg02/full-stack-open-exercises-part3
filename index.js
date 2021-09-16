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

  if (body.name.length < 3) {
    return response
      .status(400)
      .json({ error: 'Name must have at least 3 characters.' });
  }

  if (body.number.length < 8) {
    return response
      .status(400)
      .json({ error: 'Number must be at least 8 characters long.' });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => {
      response.status(400).send({ error: 'Expected unique name.' });
    });
});

// app.get('/api/persons', (request, response) => {
//   Person.find({}).then(persons => {
//     response.json(persons);
//   });
// });

// get contacts length
app.get('/info', (request, response) => {
  Person.find({}, (err, results) => {
    response.send(
      `<p>Phonebook has info for ${results.length} people</p> ${new Date()}`
    );
  });
});

// single contact url
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(400).end();
      }
    })
    .catch(error => next(error));
});

// PUT
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

// delete contact
app.delete('/api/persons/:id', (request, response) => {
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
