### Passport setup from

https://medium.com/@brianalois/build-a-rest-api-for-node-mysql-2018-jwt-6957bcfc7ac9

### Start MySQL

`brew services start mysql`

### Reset DB

You can reset the database with `sequelize`
`sequelize db:drop && sequelize db:create && sequelize db:migrate && sequelize db:seed:all`
Or run `yarn reset-db`

### Access DB command line

`yarn db-dev-prompt`
