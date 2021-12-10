# Multilanguage README Pattern
[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README.es.md)

# Farming Application

## Back-end API:

To run the api locally on port 3000: 
```
npm run start
```

For developing, to automatically restart on save, can be run with nodemon:
```
npm run start-dev
```

To run on another port, modify the value of the **port** constant on _index.js_ file to the desired port number.

### Database
Database is generated on **farming.db** file, in _/data_ folder.

To view it I recommend using [SQLiteStudio](https://sqlitestudio.pl/).


## Front-end:

To build and serve, in port 4200: 
```
ng serve
```

To run on another port, modify in _angular.json_ file the value of “port” (inside _projects:front:architect:serve:options:port_) to desired port number.

If the port of the api is changed, modify on the front-end the environment files with the new port number, _environment.ts_ & _environment.prod.ts_ which are in the folder _src>environments_.


## With the app running:

On the home page, there is an **app info** button with brief instructions. For a correct workflow you have to:

1. **Create Tokens**: an existing token name or ticker can't be added to the database.

   **Create Exchanges**: an existing exchange name cannot be added to the database.

   **Create Clientes**: a client that matches in name, surname and email with another existing client in the database can't be added.

2. With added data **create the Pairs**, created tokens and exhanges will be loaded into the list.

3. **Add the created pairs to the pool**, once a pair has been added, it will no longer appear in the option list.

4. **Update the pools** with the daily amounts. This operation can only be done once a day*.

  * _To do tests and to be able to insert more data, you can change all the dates back one day in:_ http://localhost:3000/progress/minusDate


## Used tools

### Back-end
* [Node.Js](https://nodejs.org/)
* [Sequelize](https://sequelize.org/)
* [SQLiteStudio](https://sqlitestudio.pl/)

### Front-end
* [Angular](https://angular.io/)
