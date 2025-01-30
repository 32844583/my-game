// MyRoomState.js
import { Schema, type, MapSchema } from "@colyseus/schema";

export class MyRoomState extends Schema {
  @type({ map: "boolean" })
  playersReady = new MapSchema<boolean>();
}
