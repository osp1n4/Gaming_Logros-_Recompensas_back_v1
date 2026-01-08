#!/bin/sh
# wait-for-it.sh: Wait for a service to be available

TIMEOUT=60
HOST=$1
WAIT_PORT=$2
shift 2
CMD="$@"

echo "Waiting for $HOST:$WAIT_PORT..."

for i in $(seq $TIMEOUT); do
  nc -z $HOST $WAIT_PORT > /dev/null 2>&1
  result=$?
  if [ $result -eq 0 ]; then
    echo "$HOST:$WAIT_PORT is available"
    exec $CMD
  fi
  echo "Waiting... ($i/$TIMEOUT)"
  sleep 1
done

echo "Timeout waiting for $HOST:$WAIT_PORT"
exit 1
