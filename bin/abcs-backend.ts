#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { AbcsBackendStack } from "../stacks/abcs-backend-stack";
import { Tag, Tags } from "@aws-cdk/core";

const envSEA = {
  account: "820710015775",
  region: "ap-southeast-1",
};

const envUS = {
  account: "820710015775",
  region: "us-east-1",
};

const app = new cdk.App();
const devStack = new AbcsBackendStack(app, "AbcsBackend-Dev", {
  env: envUS,
});
Tags.of(devStack).add("ProjectName", process.env.PROJECT_NAME as string);
Tags.of(devStack).add("Environment", process.env.STAGE as string);

const prodStack = new AbcsBackendStack(app, "AbcsBackend-Prod", {
  env: envSEA,
});
Tags.of(prodStack).add("ProjectName", process.env.PROJECT_NAME as string);
Tags.of(prodStack).add("Environment", process.env.STAGE as string);
