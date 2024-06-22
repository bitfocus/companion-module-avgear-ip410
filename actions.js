export function updateActions() {
  console.log("loaded update actions");
  this.setActionDefinitions({
    getPowerState: {
      name: "Get Power State",
      options: [],
      callback: async () => {
        this.getPowerState();
      },
    },
    setPowerState: {
      name: "Set Power State",
      options: [
        {
          type: "number",
          label: "Socket Number (1-4)",
          id: "socket",
          min: 1,
          max: 4,
          default: 1,
        },
        {
          type: "dropdown",
          label: "Power State",
          id: "state",
          default: "0",
          choices: [
            { id: "0", label: "Off" },
            { id: "1", label: "On" },
          ],
        },
      ],
      callback: async (event) => {
        const { socket, state } = event.options;
        this.setPowerState(socket, state);
      },
    },
    togglePowerState: {
      name: "Toggle Power State",
      options: [
        {
          type: "number",
          label: "Socket Number (1-4)",
          id: "socket",
          min: 1,
          max: 4,
          default: 1,
        },
      ],
      callback: async (event) => {
        const { socket } = event.options;
        this.togglePowerState(socket);
      },
    },
    getSocketNames: {
      name: "Get Socket Names",
      options: [],
      callback: async (event) => {
        this.getSocketNames();
      },
    },
  });
}
