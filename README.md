# treez_task

Treez Take-Home interview

See the project description: [click here](https://docs.google.com/document/d/14rhw1-wBinueKyZ-gsqNi4-fzGBe9wizmerc5EO0DrA/edit#)


## Environment requirements

the project uses the following technologies:

* NodeJS (Express)
* Mysql

Please install these software and tools in order to use the service

```
node v10
yarn v1.21 or npm v6.4.1
```

## instalation the libraries & migrate the data

to install the service, run the following code:

```bash
# at the root folder of the project
npm install

# run the migrate
node run migrate
```

## run the service

```bash
# at the root folder of the project
npm start
```

## test the service

```bash
# at the root folder of the project
npm run test
```

## libraries used:

* express - framework for running service
* mysql, mysql2 - library for database connection
* sequelize - ORM library
* lodash
* @hapi/joi - validate input

* nodemon - run NodeJS application in the dev environment
* supertest - make request to node for testing
* jest - test framework
