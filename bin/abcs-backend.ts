#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { AbcsBackendStack } from "../lib/abcs-backend-stack";

const envSEA = {
  account: "820710015775",
  region: "ap-southeast-1",
};

const app = new cdk.App();
new AbcsBackendStack(app, "AbcsBackend-Dev", {
  env: envSEA,
});

new AbcsBackendStack(app, "AbcsBackend-Prod", {
  env: envSEA,
});
