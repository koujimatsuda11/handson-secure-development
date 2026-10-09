#!/bin/bash

npx typeorm-ts-node-commonjs migration:run -d ./src/database/AppDataSource.ts
npm run dev
