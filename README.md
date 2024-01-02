![Build Badge](https://github.com/technogise/migrations-dynamo-db/actions/workflows/pr.yml/badge.svg)

## Introduction

`migrations-dynamo-db` is a database migration tool with DynamoDb support. It supports generation of migration file with extension `.ts`(TS projects), `.cjs`(CJS type JS projects) or `.mjs`(ESM type JS projects) as per source project language.

This project was forked from [`dynamo-data-migrations`](https://github.com/technogise/dynamo-data-migrations).

It was forked in order to replicate the original functionality, while pointing to a dynamic migration log.

The purpose of this is to fit the use case where you need to execute the same migrations in different environments.


## Installation
```bash
$ npm install -g migrations-dynamo-db
```

## Usage
```
$ migrations-dynamo-db
Usage: migrations-dynamo-db [options] [command]
Options:
  -V, --version                   output the version number
  -h, --help                      display help for command

Commands:
  init                            initialize a new migration project
  create [description]            create a new database migration with the provided description
  up [options]                    run all pending database migrations against a provided profile.
  down [options]                  undo the last applied database migration against a provided profile.
  status [options]                print the changelog of the database against a provided profile
  help [command]                  display help for command
```


## Initialize a new project

1. Initialize a new migrations-dynamo-db project.

    ```bash
    $ migrations-dynamo-db init

    Initialization successful. Please edit the generated config.json file
    ```

## Editing config.json
The `config.json` generated during the `init` phase contains configuration information as required to run the `up`, `down` and `satus` commands. Below is a brief description of the details specified in the file.
   1. `awsConfig`: This section is used to store AWS credentials and region of the AWS account against which you want to execute the up/down/status commands.
       You can specify multiple profiles, if profile is not specified it is considered as `default` profile. **Region is mandatory for each profile**. 
        `accessKeyId` and `secretAccessKey` are optional, if not provided the credentials are loaded from AWS SharedCredentials file or from AWS environment variables. For more information, refer [Setting Credentials in Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html). 
       
   2. `migrationsDir`: This value specifies the directory containing the migration files. By default during `init` phase `migrations` directory is created. If you want to use your own migration directory, specify the path (relative or absolute) in this section and **ensure the directory is created before executing any up/down/status command**.
   3. `migrationType` : Ensure a value from `ts`,`cjs` and `mjs` is provided here, based on which the migration script will be generated.


## Creating a new migration script
To create a new database migration script, just run the ````migrations-dynamo-db create [description]```` command. This will create a file  with the current timestamp prefixed in the filename. The file extension will be determined by the `migrationType` field value in `config.json`. The file will hold the signature of the `up` and `down` where migration details are to be specified.
Templates are at : https://github.com/technogise/migrations-dynamo-db/tree/main/src/templates

````bash
$ migrations-dynamo-db create sample_migration_1
Created: migrations/1674549369392-sample_migration_1.ts
````

### Checking the status of the migrations
At any time, you can check which migrations are applied (or not). Pass the profile option when you want to run the command in specific environments(dev,test etc). Pass the migrationLogTable option when you want to log a specific table (defaults to `MIGRATION_LOG_DB`).

````bash
$ migrations-dynamo-db status --profile dev --migrationLogTable YOUR_DYNAMO_LOG_TABLE

┌─────────────────────────────────────┬────────────┐
│ Filename                            │ Applied At │
├─────────────────────────────────────┼────────────┤
│ 1674549369392-sample_migration_1.ts │ PENDING.   |   
└─────────────────────────────────────┴────────────┘

````

### Migrate up
This command will apply all **pending migrations** in the migrations dir picking up files in ascending order as per the name.
If no profile is passed it will use AWS configuration from `default` profile. Pass the migrationLogTable option when you want to log a specific table (defaults to `MIGRATION_LOG_DB`).
If this is the first time that `up` command is executing against a particular AWS account then it also creates a `MIGRATIONS_LOG` table to hold the migrated entries. 
**If an an error occurred while migrating a particular file, it will stop and won't continue with the rest of the pending migrations.**

Example: For `default` profile
````bash
$  migrations-dynamo-db up --migrationLogTable YOUR_DYNAMO_LOG_TABLE
MIGRATED UP: 1674549369392-sample_migration_1.ts
MIGRATED UP: 1674549369492-sample_migration_2.ts
````
To execute profile `dev`
````bash
$  migrations-dynamo-db up --profile dev --migrationLogTable YOUR_DYNAMO_LOG_TABLE
MIGRATED UP: 1674549369392-sample_migration_1.ts
MIGRATED UP: 1674549369492-sample_migration_2.ts
````

If we check the status again, we can see the all the migrations was successfully applied:
````bash
$ migrations-dynamo-db status --migrationLogTable YOUR_DYNAMO_LOG_TABLE
┌─────────────────────────────────────────┬──────────────────────────┐
│ Filename                                │ Applied At               │
├─────────────────────────────────────────┼──────────────────────────┤
│ 1674549369392-sample_migration_1.ts     │ 2016-06-08T20:13:30.415Z │
│ 1674549369492-sample_migration_2.ts     │ 2016-06-08T20:13:35.415Z │
└─────────────────────────────────────────┴──────────────────────────┘
````
### Migrate down
With this command and without any parameters, migrations-dynamo-db will revert only the last applied migration.
You can also pass the number of downshifts to be done i.e. you can rollback last `n` installed migrations. If you want to rollback all applied migrations pass the `shift` argument wih value `0`. Pass the migrationLogTable option when you want to log a specific table (defaults to `MIGRATION_LOG_DB`).

Below will revert last 2 applied migrations.
````bash
$ migrations-dynamo-db down --shift 2 --migrationLogTable YOUR_DYNAMO_LOG_TABLE
MIGRATED DOWN: 1674549369392-sample_migration_1.ts 
MIGRATED DOWN: 1674549369392-sample_migration_2.ts 
````
