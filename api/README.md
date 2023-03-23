

## Create a environnement file here `/api/.env` with this content for exemple

```bash
PORT=3000

# Token
SHA_TOKEN_KEY=
JWT_TEMP_SECRET_KEY=YOUR_JWT_SECRET_HERE
JWT_SECRET_KEY=


# Password database
DB_NAME=
DB_USER=
DB_PASS=
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
```


You can change all elements except
- the `PORT` that is configured with the front end
- the `JWT_TEMP_SECRET_KEY` which is a vulnerability

It is necessary to put strong keys (min 16 char) for : `SHA_TOKEN_KEY`, `JWT_SECRET_KEY` and `DB_PASS`
