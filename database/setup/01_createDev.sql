--  Cria usuário dev no banco de dados com permissões CRUD.

-----------------------------------------------------------------

-- Forma mais rápida de criar um usuário com permissões CRUD.

-- Connect to the database
-- ALTER SESSION SET CONTAINER=ORCLPDB1;

-- Create a user
-- CREATE USER DEV IDENTIFIED BY DevPwd123;

-- Grant ALL privileges to the user
-- GRANT ALL PRIVILEGES TO DEV;

-----------------------------------------------------------------

-- Forma mais correta de criar um usuário com permissões CRUD.

-- Connect to the database
ALTER SESSION SET CONTAINER=ORCLPDB1;

-- Create a user
CREATE USER DEV IDENTIFIED BY DevPwd123;

-- Allow the user to connect to the database
GRANT CREATE SESSION TO DEV;

-- Allow the user to create tables
GRANT CREATE TABLE TO DEV;

-- Allow the user to create indexes
GRANT CREATE INDEX TO DEV;

-- Allow the user to create sequences
GRANT CREATE SEQUENCE TO DEV;

-- Allow the user to create objects without size restrictions.
GRANT UNLIMITED TABLESPACE TO DEV;

-- Grant SELECT privilege on all tables
GRANT SELECT ANY TABLE TO DEV;

-- Grant INSERT privilege on all tables
GRANT INSERT ANY TABLE TO DEV;

-- Grant UPDATE privilege on all tables
GRANT UPDATE ANY TABLE TO DEV;

-- Grant DELETE privilege on all tables
GRANT DELETE ANY TABLE TO DEV;