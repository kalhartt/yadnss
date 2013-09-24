#!/bin/bash

PGUSER=postgres
PGPASSWORD=pass
# PGPASSFILE=~/.pgpass

if [ "$1" == "export" ]; then
    pg_dump -Fc --no-acl --no-owner -h localhost heroku > scripts/heroku.dump
elif [ "$1" == "import" ]; then
    pg_restore --verbose --clean --no-acl --no-owner -h localhost -d heroku scripts/heroku.dump
else
    echo "Unrecognized Option"
fi
