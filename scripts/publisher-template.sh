#!/bin/bash

################################################################################
# TL;DR
#
# Copy this script to the project root and rename to "publisher-private.sh".
# Configure to your liking and run.
################################################################################

export RABBIT_URL=amqp://admin:admin@127.0.0.1
export PUBLISH=true
export CONSUME=false

clear
node lib/reconnect.js
