#/bin/sh
npm i -D sqlite3 && rm -rf node_modules && npm install && npm rebuild
npm i --save-dev sequelize-cli &&
npx sequelize-cli db:migrate
