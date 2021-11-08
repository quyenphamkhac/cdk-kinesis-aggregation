#!/usr/bin/env bash
if [[ $# -ge 1 ]]; then
    export STAGE=$1
    npx cdk deploy "AbcsBackend-$STAGE"
else
    echo 1>&2 "Provide enviroment stage as the first argument."
    exit 1
fi