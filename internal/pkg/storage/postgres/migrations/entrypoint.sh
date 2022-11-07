#!/bin/sh

/wait
/migrate \
  -path $MIGRATIONS_DIR \
  -database "${DATABASE_URL}" \
  $@
