-- create-schemas.sql

CREATE DATABASE IF NOT EXISTS `sns-api`;
CREATE DATABASE IF NOT EXISTS `sns-api-test`;

GRANT ALL PRIVILEGES ON `sns-api-test`.* TO 'homepage'@'%';
FLUSH PRIVILEGES;