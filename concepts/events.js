var events = require("events");
var eventEmitter = new events.EventEmitter();

var listener1 = function listener1() {
  console.log("listner1 executed.");
}

var listener2 = function listener2() {
  console.log("listner2 executed.");
}

eventEmitter.on("connection", listener1);
eventEmitter.on("connection", listener2);

var eventListeners = events.EventEmitter.listenerCount(eventEmitter, "connection");
console.log(eventListeners + " Listener(s) listening to connection event.");

eventEmitter.emit("connection");

eventEmitter.removeListener("connection", listener1);
console.log("listener1 will not listen now.");

eventEmitter.emit("connection");

eventListeners = events.EventEmitter.listenerCount(eventEmitter, "connection");
console.log(eventListeners + " Listener(s) listening to connection event.");

console.log("Program Ended.");
