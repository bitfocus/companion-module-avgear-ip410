import { combineRgb } from "@companion-module/base";

async function updateFeedbacks(self) {
  self.setFeedbackDefinitions({
    socket_state: {
      name: "Socket State",
      type: "boolean",
      label: "Socket State",
      description: "Indicates if the socket is on or off",
      defaultStyle: {
        bgcolor: combineRgb(0, 255, 0),
        color: combineRgb(0, 0, 0),
      },
      options: [
        {
          id: "socket",
          type: "number",
          label: "Socket Number",
          default: 1,
          min: 1,
          max: 4,
        },
      ],
      callback: (feedback) => {
        const variableId = `p${feedback.options.socket}`;
        const currentState = self.getVariableValue(variableId);
        self.log(
          "debug",
          `Feedback callback for socket ${feedback.options.socket}, state: ${currentState}`
        );
        //return currentState === '1';
        return currentState === "On";
      },
    },
  });
}

export { updateFeedbacks };
