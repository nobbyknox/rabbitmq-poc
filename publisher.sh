#!/bin/bash

export RABBIT_URL=amqp://admin:admin@172.0.0.20
export PUBLISH=true
export CONSUME=false

clear
node lib/reconnect.js
