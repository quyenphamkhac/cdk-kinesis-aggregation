#!/usr/bin/env bash
if [[ $# -ge 1 ]]; then
    if [ $1 == "Dev" ] || [ $1 == "Prod" ];then
        export STAGE=$1
        npx cdk destroy "AbcsBackend-$STAGE"
    else
        echo 1>&2 "Invalid stage. Please input 'Dev' or 'Prod'."
        exit 1
    fi
else
    echo 1>&2 "Provide enviroment stage as the first argument."
    exit 1
fi