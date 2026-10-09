#!/bin/bash

npx typeorm migration:run -d ./dist/database/AppDataSource.js
npm run start