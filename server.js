import express from 'express'
import fetch from 'node-fetch'
import jwt from 'jwt-simple'
import store from 'store'
const app = express()

const clientsAPI = 'http://www.mocky.io/v2/5808862710000087232b75ac'
const policesAPI = 'http://www.mocky.io/v2/580891a4100000e8242b75c5'
const tokenSecret = 'mysecrettoken'

function createToken (user) {
  return jwt.encode(user, tokenSecret)
}

function isAuthenticated (req, res, next) {
  let tokenstored = store.get('token')
  if (tokenstored) {
    return next()
  } else {
    return res.json({'error': 'You have not permission access to this resource, please login in http://localhost:3001/login/<username>'})
  }
}

app.get('/login/:username', (req, res) => {
  let username = req.params.username
  fetch(clientsAPI)
    .then(res => res.json())
    .then(data => {
      let user = data.clients.find(function (user) {
        if (user.name === username && user.role === 'admin') {
          var token = createToken(user)
          store.set('token', token)
          return res.json({'message': 'You have logged in, your user token has been created'})
        }
      })
      if (!user) {
        res.json({'error': `This user: <${username}> is not valid`})
      }
    })
    .catch(err => console.error(err))
})

// Get all the list of clients
app.get('/clients', isAuthenticated, (req, res) => {
  fetch(clientsAPI)
    .then(res => res.json())
    .then(data => res.json(data))
})

// Get a single client by cliend id
app.get('/clients/:id', isAuthenticated, (req, res) => {
  let id = req.params.id
  fetch(clientsAPI)
    .then(res => res.json())
    .then(data => {
      let client = data.clients.find(function (client) {
        if (client.id === id) {
          return true
        }
      })
      res.json(client)
    })
    .catch(err => console.error(err))
})

// Get a client by username
app.get('/client/:username', isAuthenticated, (req, res) => {
  let username = req.params.username
  fetch(clientsAPI)
    .then(res => res.json())
    .then(data => {
      let user = data.clients.find(function (user) {
        if (user.name === username) {
          return res.json(user)
        }
      })
      if (!user) {
        res.json({'error': `It coudn't find <${username}> in our database`})
      }
    })
    .catch(err => console.error(err))
})

// Get all policies related to a username
app.get('/policies/:username', isAuthenticated, (req, res) => {
  let username = req.params.username

  async function getPolices () {
    var users = await fetch(clientsAPI)
      .then(res => res.json())
      .catch(err => console.error(err))
    var data = await fetch(policesAPI)
      .then(res => res.json())
      .catch(err => console.error(err))

    let user = users.clients.find(user => {
      if (user.name === username) {
        return user
      }
    })

    if (!user) {
      return res.json({'error': 'This user does not exists'})
    }

    let policies = data.policies.filter((policy) => {
      if (user.id === policy.clientId) {
        return policy
      }
    })

    if (policies.length === 0) {
      return res.json({'error': 'It could\'nt found policies for this user'})
    } else {
      return res.json(policies)
    }
  }

  getPolices()
})

// Get a user related to a policy id
app.get('/policy/:id/user', (req, res) => {
  let policyId = req.params.id

  async function getUser () {
    var data = await fetch(policesAPI)
      .then(res => res.json())
      .catch(err => console.error(err))
    var users = await fetch(clientsAPI)
      .then(res => res.json())
      .catch(err => console.error(err))

    let policy = data.policies.find((policy) => {
      if (policy.id === policyId) {
        return policy
      }
    })

    if (!policy) {
      return res.json({'error': 'This policy does not exist'})
    }

    users.clients.find((user) => {
      if (policy.clientId === user.id) {
        return res.json(user)
      }
    })
  }

  getUser()
})

const PORT = 3001
app.listen(PORT,
  err => err ? new Error(err) : console.info('Server running on port', PORT)
)
