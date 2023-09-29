#!/bin/bash

# Check if the server is running
if ! curl -s http://158.180.53.241:3000 >/dev/null; then
    # If the server is not running, start it
    npm run restart &
fi