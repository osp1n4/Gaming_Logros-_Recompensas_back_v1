#!/bin/sh
# wait-for-it.sh: Wait for a service to be available

TIMEOUT=60
WAIT_HOST=$1
WAIT_PORT=$2
shift 2
CMD="$@"

echo "Waiting for $WAIT_HOST:$WAIT_PORT..."

for i in $(seq $TIMEOUT); do
  nc -z $WAIT_HOST $WAIT_PORT > /dev/null 2>&1
  result=$?
  if [ $result -eq 0 ]; then
    echo "$WAIT_HOST:$WAIT_PORT is available"
    exec $CMD
  fi
  echo "Waiting... ($i/$TIMEOUT)"
  sleep 1
done

echo "Timeout waiting for $WAIT_HOST:$WAIT_PORT"
exit 1
