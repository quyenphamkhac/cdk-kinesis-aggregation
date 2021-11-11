#!/usr/bin/env bash
if [[ $# -ge 1 ]]; then
    if [ $1 == "Dev" ];then
        export PROJECT_NAME="Abcs"
        export USER_TABLE_ARN="arn:aws:dynamodb:us-east-1:820710015775:table/UserModel-rb6txpzx2fertjokgntdmthpqi-dev"
        export USER_STREAM_ARN="arn:aws:dynamodb:us-east-1:820710015775:table/UserModel-rb6txpzx2fertjokgntdmthpqi-dev/stream/2021-11-09T04:59:00.701"
        export STAGE=$1
        npx cdk deploy "AbcsBackend-$STAGE"
    elif [ $1 == "Prod" ]; then
        echo 1>&2 "Prod enviroment will coming soon."
        exit 0
    else
        echo 1>&2 "Invalid stage. Please input 'Dev' or 'Prod'."
        exit 1
    fi
else
    echo 1>&2 "Provide enviroment stage as the first argument."
    exit 1
fi