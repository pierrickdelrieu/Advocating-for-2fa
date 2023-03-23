
## How to run this challenge ?

- Install Docker Compose
- Clone this repository
- Run all containers with `docker-compose up`


## Configuration
- All configuration (flag ...) are in the file `config.js`
- Create `admin` account before the challenge start with a strong password
- Create a environnement file here `.env` with this content for exemple

```bash
MYSQLDB_USER=admin_chall
MYSQLDB_ROOT_PASSWORD=2?pst5quu.kow12yh?!e
MYSQLDB_DATABASE=chall
MYSQLDB_LOCAL_PORT=3306
MYSQLDB_DOCKER_PORT=3306

NODE_LOCAL_PORT=3000
NODE_DOCKER_PORT=3000
```


You can change all elements except
- the `PORT` that is configured with the front end
- the `JWT_TEMP_SECRET_KEY` which is a vulnerability

It is necessary to put strong keys (min 16 char) for : `SHA_TOKEN_KEY`, `JWT_SECRET_KEY` and `DB_PASS`