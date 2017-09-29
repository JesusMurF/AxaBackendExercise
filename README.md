# AXA Backend exercise

For install the dependencies of the project

> npm install

For start the app

> npm start

## Authentication

Routes are protected by a token and isAuthenticated middleware check if user is logged in.

## Routes

> http://localhost:3001/login/:username

For login with user.

> http://localhost:3001/clients

Returns all the clients.

> http://localhost:3001/clients/:id

Get a single client by user id.

> http://localhost:3001/client/:username

Get a single client by username.

> http://localhost:3001/policies/:username

Get all policies related to an username.

> http://localhost:3001/policy/:id/user

Get an user related to a policy id
