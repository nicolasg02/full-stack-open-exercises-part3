// Order:
// 1. express server (app.use(express.json()))
// 2. middleware (app.use(<middleware func>))
// 3. routes

// morgan:
// morgan(format, options)
// format(tokens, req, res)
// tokens: object with all defined tokens
// req: http request
// res: http response
// tiny: :method :url :status :res[content-length] - :response-time ms
// tiny: POST /api/persons 200 54 - 4.385 ms
// tiny manual: POST /api/persons 200 55 - 4.281 ms

const express = require('express');
const morgan = require('morgan');

morgan.token('body', (req, res) => {
  return req.body;
});

const app = express();

app.use(express.json());

app.use(
  morgan((tokens, req, res) => {
    console.log('Method:', tokens.method(req, res));
    console.log('Path:', tokens.url(req, res));
    console.log('Status:', tokens.status(req, res));
    console.log('Content Length:', tokens.res(req, res, 'content-length'));
    console.log('Response Time:', tokens['response-time'](req, res), 'ms');
    console.log('Data:', tokens.body(req, res));
  })
);

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p> ${new Date()}`
  );
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => {
    return person.id === id;
  });

  if (person) {
    response.json(person);
  } else {
    response.status(400).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
});

const generateRandomId = () => {
  return Math.floor(Math.random() * 100);
};

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: 'name is missing',
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number is missing',
    });
  }

  const personAlreadyExists = persons.some(person => person.name === body.name);

  if (personAlreadyExists) {
    return response.status(400).json({
      error: 'name must be unique',
    });
  }

  const person = {
    id: generateRandomId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}..`);
});

// method:  GET
// path:  /api/notes
// body:  {}
// ----
// method:  POST
// path:  /api/notes
// body:  { content: 'VS Code REST client is pretty good', importance: false }
// ----
