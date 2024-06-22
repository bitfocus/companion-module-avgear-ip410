export function upgradeScripts() {
  // This function will run during the upgrade process to ensure everything is cleared
  const upgrades = [
    function (context) {
      context.log("info", "Running upgrade script to clear all stored data.");

      // Clear all stored variables
      context.setVariableValues({});

      // Clear all stored configuration settings
      context.setConfig({});

      // Clear all stored states
      if (context.getStates) {
        const states = context.getStates();
        for (const key in states) {
          if (Object.hasOwnProperty.call(states, key)) {
            context.setState(key, undefined);
          }
        }
      }

      // Clear any other module-specific storage if necessary
      // For example, clear feedbacks, subscriptions, etc.

      context.log("info", "All stored data has been cleared.");
      return true;
    },
  ];

  return upgrades;
}
