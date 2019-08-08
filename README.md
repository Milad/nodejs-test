# Books API

## Requirements
- Nodejs 10.x. this is application is written to work with the current LTS version of node.
- MySQL server.
    - For the purpose of this test, we are going to use docker to run a quick version of MySQL.
    - Then you can connect to the MySQL server using `milad` as a username and `my-secret-pw` as a password.
    - PS: In the real world, I don't commit passwords or secrets to git repositories.
- `docker-compose` to run the previous MySQL server.

## Installation
- Clone the repository `git clone git@github.com:Milad/nodejs-test.git`
- Install dependencies `npm i`
- Run `docker-compose up` to start up the MySQL server.
- Copy `.env.example` to `.env` and fill the appropriate configurations.
- Run `npm run db:migrate` migrations to create the table(s) .
- Run `npm run db:seed` to seed the initial data.
- Run the application `npm start`

## Note about Sequelize
The task says that we shouldn't use an ORM or a Query Builder. The usage of Sequelize is only to make it easier to run migrations and seeds. Sequelize itself is not used in the app.

## Code Style
The applications uses [JavaScript Standard Style](https://standardjs.com/).

## Example Requests
The application features a simple RESTFUL API to expose books data to the clients.
### Adding a book
```http request
POST /books HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Accept: application/json

{
  "title": "Where the Crawdads Sing",
  "release_date": "2018-08-14",
  "author": "Delia Owens",
  "description": "https://www.goodreads.com/book/show/36809135-where-the-crawdads-sing",
  "image": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1524102644l/36809135.jpg"
}
```
### Updating a book
Update the book, whose id is 99, with new author information.
Any property of the book can be updated this way.
```http request
PUT /books/99 HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Accept: application/json

{
  "author": "Delia Owens"
}
```

## Todo
In a real-world application, I'd also do these:
- Client authentication and authorization.
- Create automated tests (unit tests & integration tests) for the application.
- Create Swagger documentation.
