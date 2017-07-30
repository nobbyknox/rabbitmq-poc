#!/bin/bash

################################################################################
# TL;DR
#
# Copy this script to the project root and rename to "worker-private.sh".
# Configure to your liking and run.
################################################################################

export RABBIT_URL=amqp://admin:admin@172.0.0.20
export PUBLISH=false
export CONSUME=true

clear
node lib/reconnect.js
