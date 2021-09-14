const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  )
  process.exit(1)
} else if (process.argv.length === 3) {
  Person.find({}).then(persons => {
    console.log('phonebook:')
    persons.forEach(person => {
      console.log(`
        ${person.name} ${person.number}
      `)
    })
  })

  mongoose.connection.close()
}

// arguments
const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://nicolasg02:${password}@cluster0.enkl8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: name,
  number: number,
})

person.save().then(result => {
  console.log(`added ${name} number ${number} to phonebook`)
  mongoose.connection.close()
})
