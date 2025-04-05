import {
  InstanceBase,
  InstanceStatus,
  runEntrypoint,
} from "@companion-module/base";
import { updateActions } from "./actions.js";
import { updateVariables } from "./variables.js";
import { upgradeScripts } from "./upgrades.js";
import { updateFeedbacks } from "./feedbacks.js";
import got from "got";

class AVGIP410 extends InstanceBase {
  constructor(internal) {
    super(internal);

    this.updateActions = updateActions.bind(this);
    this.updateVariables = updateVariables.bind(this);
    this.updateFeedbacks = updateFeedbacks.bind(this, this);
    this.pollingInterval = null;

    // Logging for debugging
    this.log("info", "AVGIP410 constructor initialized");
  }

  getConfigFields() {
    this.log("info", "Fetching config fields");
    return [
      {
        type: "textinput",
        id: "ip",
        label: "IP Address",
        width: 6,
        regex: this.REGEX_IP,
        required: true,
      },
      {
        type: "textinput",
        id: "username",
        label: "Username",
        width: 6,
        required: true,
      },
      {
        type: "textinput",
        id: "password",
        label: "Password",
        width: 6,
        required: true,
      },
      {
        type: "number",
        id: "pollingInterval",
        label: "Polling Interval (ms)",
        width: 6,
        default: 5000,
        required: true,
      },
      {
        type: "static-text",
        id: "info",
        width: 12,
        label: "Information",
        value:
          "A polling interval of 0 will disable polling. State will be less reliable.",
      },
    ];
  }

  async destroy() {
    debug("destroy", this.id);
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  async init(config) {
    this.log("info", "Initializing module with config:", config);
    this.config = config || {};
    this.updateStatus(InstanceStatus.Disconnected);

    this.updateStatus(InstanceStatus.Ok);
    this.updateActions();
    this.fetchSocketData();
    this.updateVariables();
    this.startPolling();
    this.updateFeedbacks();
  }

  async configUpdated(config) {
    this.log("info", "Config updated:", config);
    this.config = config || {};
    this.updateActions();
    this.fetchSocketData();
    this.updateVariables();
    this.startPolling();
    this.updateFeedbacks();
  }

// Replace getSocketNames and getPowerState calls with fetchSocketData
startPolling() {
  this.log("info", "Starting polling");
  this.updateStatus(InstanceStatus.Connecting);
  if (this.pollingInterval) {
    clearInterval(this.pollingInterval);
  }

  const interval = this.config.pollingInterval || 0; // Default to off if not configured
  if (interval > 0) {
    this.pollingInterval = setInterval(() => {
      this.fetchSocketData();
    }, interval);
  } else {
    this.log("info", "Polling is disabled because the interval is set to 0");
  }
}

 // Consolidated function to fetch and parse socket names and power states
async fetchSocketData() {
  this.log("debug", "Fetching socket data via JSON API!");
  const { ip, username, password } = this.config;
  if (!ip || !username || !password) {
    this.log("error", "IP address, username, or password is not set");
    return;
  }

  const url = `http://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${ip}/json.cmd?getpower`;

  try {
    const response = await got(url, { timeout: { request: 1000 }, responseType: 'json' });
    const data = response.body;

    if (data && data.result && data.result.RL) {
      const variables = {};
      const feedbacks = {};
      this.updateStatus(InstanceStatus.Ok);

      data.result.RL.forEach((socket) => {
        const socketId = `p${socket.id}`;
        variables[`${socketId}_name`] = socket.name;
        variables[socketId] = socket.state === 1 ? "On" : "Off";

        this.log("debug", `Socket ${socket.id}: Name=${socket.name}, State=${variables[socketId]}`);
      });

      this.setVariableValues(variables);
      this.checkFeedbacks("socket_state");
    } else {
      this.log("error", "Invalid JSON response structure");
    }
  } catch (error) {
    if (error.code === "ETIMEDOUT") {
      this.log("error", "IP410 module: " + ip + " is unreachable");
      this.updateStatus(InstanceStatus.ConnectionFailure);
    } else {
      this.log("error", `Error: ${error.message}`);
      this.updateStatus(InstanceStatus.Disconnected);
    }
  }
}

  // Set power state via http then call update status
  async setPowerState(socket, state) {
    this.log("info", `Setting power state for socket ${socket} to ${state}`);
    const { ip, username, password } = this.config;
    if (!ip || !username || !password) {
      this.log("error", "IP address, username, or password is not set");
      return;
    }

    const actualSocket = socket + 60; // Convert 1-4 to 61-64
    const commandValue = state === "On" ? 1 : 0;
    const url = `http://${ip}/set.cmd?user=${encodeURIComponent(username)}+pass=${encodeURIComponent(password)}+cmd=setpower&p${actualSocket}=${commandValue}`;

    this.log("debug", `Constructed URL: ${url}`);  // Log the constructed URL

    try {
      //const options = { method: 'POST' }
      const response = await got(url, { timeout: { request: 1000 } });
      this.log("debug", `Set Power State Response: ${response.body}`);
      this.fetchSocketData(); // Refresh power status after setting
    } catch (error) {
      if (error.code === "ETIMEDOUT") {
        this.log("error", "IP410 module: " + ip + " is unreachable");
        this.updateStatus(InstanceStatus.ConnectionFailure);
      } else {
        this.log("error", `Error: ${error.message}`);
        this.updateStatus(InstanceStatus.Disconnected);
      }
    }
  }

  //Take in current state, invert it, then call set power state
  async togglePowerState(socket) {
    const variableId = `p${socket}`;
    const currentState = await this.getVariableValue(variableId);
    //const newState = currentState === '1' ? '0' : '1'
    const newState = currentState === "On" ? "Off" : "On";

    this.log("info", `Toggling power state for socket ${socket} to` + newState);
    this.setPowerState(socket, newState);
  }
}

runEntrypoint(AVGIP410, []);
