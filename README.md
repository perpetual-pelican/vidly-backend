# vidly-backend
Node-based backend api for video rental processing - built with Express and MongoDB/Mongoose
 - based on The Complete Node.js Course by Mosh Hamedani

## Setup
### Install Node.js
 - https://nodejs.org/en/download/

### Install MongoDB Community Edition
 - https://docs.mongodb.com/manual/installation/
 - Add MongoDB binaries folder to PATH
 - By default, the MongoDB data is stored locally
   - in C:\ProgramFiles\MongoDB\4.4\Server (for version 4.4) on Windows
   - in /var/lib/mongodb on Linux
   - in /etc/mongo/data/db on Mac ( or /usr/local/var/mongodb using homebrew)

### Install Dependencies
1. Clone the repository
2. Open a terminal in the repository directory
3. Run `npm ci` to install all dependencies

### Start DB
 - Use the command `npm run db` to start the database
 - A few messages will be displayed, indicating that a replica set is being started
 - After several seconds, the database will be ready when it says "Connected to oplog"
 - Once the database is running, everything else can be done in one terminal

### Run Tests
 - Open up a new terminal and use `npm test` to run all tests
 - They should all pass if the project has been set up successfully

### Prepare Environment Variables
 - Set `vidly_jwtPrivateKey` using a private key of your choice. This is used for authentication
 - If you wish, set `PORT` to specify a port for the server, otherwise port 3000 will be used

### Populate DB
 - Use `npm run seed` to fill the database with some basic data

### Start Server
 - Run `npm start` to start the server
 - Two info messages should be displayed, indicating successful database connection and server startup

### Check It Out
 - Open http://localhost:3000 or `http://localhost:[PORT]` in a browser
 - Here, you should see "Home Page" displayed in plain text, indicating a successful response from the server
 - You should also be able to see some unformatted genre and movie data if you go to these two pages
   - http://localhost:3000/api/genres
   - http://localhost:3000/api/movies
 - Beyond this, it is best to use something like Postman to test http requests on the various routes available
 
### URL Route Structure
    http://localhost:[PORT]/
      api/
        login
        users/
          me
        customers/
          customerId
        genres/
          genreId
        movies/
          movieId
        rentals/
          rentalId
        returns
