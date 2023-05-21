/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as path from "path";
import * as fs from "fs";
import { IModelHost, IModelHostConfiguration } from "@itwin/core-backend";
import { KnownLocations } from "./KnownLocations";
import { BackendIModelsAccess } from "@itwin/imodels-access-backend";
import { Point3d, Vector3d } from "@itwin/core-geometry";
import { ClientAuthorization } from "./ClientAuthorization";
import { Config } from "./Config";
// import { ServiceAuthorizationClient, ServiceAuthorizationClientConfiguration } from "@itwin/service-authorization"

/** Loads the provided `.env` file into process.env */
function loadEnv(envFile: string) {
  if (!fs.existsSync(envFile))
    return;

  const dotenv = require("dotenv"); // eslint-disable-line @typescript-eslint/no-var-requires
  const dotenvExpand = require("dotenv-expand"); // eslint-disable-line @typescript-eslint/no-var-requires
  const envResult = dotenv.config({ path: envFile });

  if (envResult.error) {
    throw envResult.error;
  }

  dotenvExpand(envResult);
}

export async function startBackend(): Promise<void> {
  loadEnv(path.join(__dirname, "..", ".env"));
  const config = new IModelHostConfiguration();
  // config.concurrentQuery.concurrent = 4; // for test restrict this to two threads. Making closing connection faster
  // NEEDSWORK how do we do this in imodel js V3.x?
  // console.log(`KnownLocations.outputDir => ${KnownLocations.outputDir}`)
  config.cacheDir = KnownLocations.outputDir;

  // config.hubAccess = 
  config.hubAccess = new BackendIModelsAccess();
  // config.authorizationClient = new AgentAuthorizationClient(clientConfig);
  // config.authorizationClient = new ClientAuthorization(Config.connectorArgs.hubArgs.clientConfig.clientId, Config.connectorArgs.hubArgs.clientConfig.clientSecret, Config.connectorArgs.hubArgs.clientConfig.scope)
  console.log(`startBackend config`);
  console.log(config.hubAccess);

  await IModelHost.startup(config);

  console.log("Backend host started")

  // console.log('IModelHost.hubAccess()');
  // console.log(IModelHost);
}

export async function shutdownBackend() {
  await IModelHost.shutdown();
}


export const distanceBetweenPoint = (p: any, q: any) => {
  // console.log('q.X - p.X');
  // console.log(q.X - p.X);
  // console.log('q.Y - p.Y');
  // console.log(q.Y - p.Y);
  // console.log('q.Z - p.Z');
  // console.log(q.Z - p.Z);
  // console.log('Math.pow((q.X - p.X), 2)')
  // console.log(Math.pow((q.X - p.X), 2))
  // console.log('Math.pow((q.Y - p.Y), 2)')
  // console.log(Math.pow((q.Y - p.Y), 2))
  // console.log('Math.pow((q.Z - p.Z), 2)')
  // console.log(Math.pow((q.Z - p.Z), 2))
  // (x2 - x1) +  (y2 - y1) + (z2 -z1) 
  // const formula = (Math.pow(( toNumber(q.X) - toNumber(p.X)), 2)) + (Math.pow( toNumber(q.Z*-1) - toNumber(p.Z * -1), 2) + Math.pow(  toNumber(q.Y) - toNumber(p.Y), 2));
  const formula = (Math.pow((q.X - p.X), 2)) + (Math.pow(q.Y - p.Y, 2) + Math.pow(q.Z - p.Z, 2));
  const result = Math.sqrt(formula);
  // console.log('result');
  // console.log(result);

  return result;
}

export const getSlopeAngle = (s1: any, s2: any) => {
  // (y2 - y1) / (x2 - x1)
  // return Math.atan(( (s2.Z*-1) - (s1.Z * -1)) / (s2.X - s1.X)) * 180 / Math.PI;
  return Math.atan(((s2.Y) - (s1.Y)) / (s2.X - s1.X)) * 180 / Math.PI;
}

export const fromSumOf = (p: Point3d, v: Vector3d, scale: number): Point3d => {
  const result = new Point3d();
  result.x = p.x + v.x * scale;
  result.y = p.y + v.y * scale;
  result.z = p.z + v.z * scale;
  return result;
}


export function toNumber(val: any) {
  let value = 0.0;
  if (val === undefined)
    value = 0.0;
  if (typeof (val) == "number")
    value = val;
  if (typeof (val) == "string")
    value = parseFloat(val);

  return value;
}

export function convertFeetToMeter(val: any): number {
  console.log("++++ inside convertFeetToMeter")
  console.log(typeof (val))
  // let meterUnit = 3.281;
  let meterUnit = 1;
  let value: any = 0.0;
  if (typeof (val) == "number")
    value = val;
  if (typeof (val) == "string")
    value = parseFloat(val);

  console.log(value / meterUnit);
  return value / meterUnit;
  // value = parseFloat("" + value / meterUnit)
  // value = parseFloat("" + value)
  // return value.toFixed(4)*1;


}

export function convertInchToMeter(val: any): number {
  console.log("++++ inside convertInchToMeter")
  console.log(typeof (val))
  // let meterUnit = 39.3701;
  let meterUnit = 1;
  let value: any = 0.0;
  if (typeof (val) == "number")
    value = val;
  if (typeof (val) == "string")
    value = parseFloat(val);

  console.log(value / meterUnit);
  return value / meterUnit;
  // return value;
  // value = parseFloat("" + value / meterUnit)
  // value = parseFloat("" + value)
  // return value.toFixed(4)*1;


}

export function mandateConvertInchToMeter(val: any): number {
  console.log("++++ inside mandateConvertInchToMeter")
  console.log(typeof (val), val)
  let meterUnit = 39.3701;
  // let meterUnit = 1;
  let value: any = 0.0;
  if (typeof (val) == "number")
    value = val;
  if (typeof (val) == "string")
    value = parseFloat(val);

  return parseFloat((value / meterUnit).toFixed(4));
  // value = parseFloat("" + value / meterUnit)
  // value = parseFloat("" + value)
  // return value.toFixed(4)*1;
}

export function mandateConvertFeetToMeter(val: any): number {
  console.log("++++ inside mandateConvertFeetToMeter")
  console.log(typeof (val), val)
  let meterUnit = 3.281;
  // let meterUnit = 1;
  let value: any = 0.0;
  if (typeof (val) == "number")
    value = val;
  if (typeof (val) == "string")
    value = parseFloat(val);

  return parseFloat((value / meterUnit).toFixed(4));
  // value = parseFloat("" + value / meterUnit)
  // value = parseFloat("" + value)
  // return value.toFixed(4)*1;
}


export const convertParseExpotentialToDecimal = (value: any) => {
  return parseFloat(value).toFixed(4);
}


export const transformNodeCoordinates = (node: any) => {
  let attributes = { ...node };
  attributes['X'] = toNumber(convertParseExpotentialToDecimal(node['X']));
  attributes['Y'] = toNumber(convertParseExpotentialToDecimal(node['Z'])) * -1;
  attributes['Z'] = toNumber(convertParseExpotentialToDecimal(node['Y']));

  return attributes;

}

export function convertInchToFeet(val: any): number {
  console.log("++++ inside convertInchToFeet")
  console.log(typeof (val))
  let feetUnit = 12;
  // let feetUnit = 1;
  let value: any = 0.0;
  if (typeof (val) == "number")
    value = val;
  if (typeof (val) == "string")
    value = parseFloat(val);


  console.log(value / feetUnit);
  return value / feetUnit;
  // return value;
  // value = parseFloat("" + value / feetUnit)
  // value = parseFloat("" + value)
  // return value.toFixed(4)*1;
}