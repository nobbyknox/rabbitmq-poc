#!/bin/bash

export RABBIT_URL=amqp://admin:admin@172.0.0.20
export PUBLISH=false
export CONSUME=true

clear
node lib/reconnect.js
