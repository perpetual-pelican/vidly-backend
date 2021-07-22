# vidly-backend
Node-based backend api for video rental processing - built with Express and MongoDB/Mongoose
 - modified and expanded from code written while following The Complete Node.js Course by Mosh Hamedani

## Setup
### Install Node.js
 - https://nodejs.org/en/download/

### Install MongoDB Community Edition
 - https://docs.mongodb.com/manual/installation/
 - Make sure the MongoDB daemon (mongod) is running or the project won't work

### Install Dependencies
1. Clone the repository
2. Open a terminal in the repository directory
3. Run `npm ci` to install all dependencies

### Run Tests
 - Use `npm test` to run all tests
 - They should all pass if everything has been set up correctly

### Prepare Environment Variables
 - Set `vidly_jwtPrivateKey` using a private key of your choice. This is used for authentication
 - If you wish, set `PORT` to specify a port for the server, otherwise port 4000 will be used

### Start DB
 - Use the command `npm run db` to start the database
 - A few messages will be displayed, indicating that a replica set is being started
 - After several seconds, the database will be ready when it says "Connected to oplog"
 - Once the database is running, open a new terminal for running the remaining commands

### Populate DB
 - Use `npm run seed` to fill the database with some basic dummy data

### Start Server
 - Run `npm start` to start the server
 - Two info messages should be displayed, indicating successful database connection and server startup

### Check It Out
 - Open http://localhost:4000 or `http://localhost:PORT` in a browser
 - Here, you should see "Home Page" displayed in plain text, indicating a successful response from the server
 - You should also be able to see some raw json data for genres and movies if you go to these two pages:
   - http://localhost:4000/api/genres
   - http://localhost:4000/api/movies
 - All the other routes either don't support GET requests or require login (JSON Web Token authentication)
 - If you try to access any other routes that support GET requests, you'll get "Access Denied. No token provided."
 - Beyond this, it is best to use something like Postman to test http requests on the various routes available
 
### URI Route Structure
| ROUTE                         | SUPPORTED REQUESTS |
| ----------------------------- | ------------------ |
|                    /          | GET                |
| &nbsp;             api/       | N/A                |
| &emsp;&nbsp;       login      | POST               |
| &emsp;&nbsp;       users/     | GET, POST          |
| &emsp;&emsp;&ensp; me         | GET                |
| &emsp;&nbsp;       customers/ | GET, POST          |
| &emsp;&emsp;&ensp; customerId | GET, PUT, DELETE   |
| &emsp;&nbsp;       genres/    | GET, POST          |
| &emsp;&emsp;&ensp; genreId    | GET, PUT, DELETE   |
| &emsp;&nbsp;       movies/    | GET, POST          |
| &emsp;&emsp;&ensp; movieId    | GET, PUT, DELETE   |
| &emsp;&nbsp;       rentals/   | GET, POST          |
| &emsp;&emsp;&ensp; rentalId   | GET, DELETE        |
| &emsp;&nbsp;       returns    | POST               |
