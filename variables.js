export function updateVariables(instance) {
  let variables = [];

  variables.push(
    {
      name: "Socket 1 Power State",
      variableId: "p1",
    },
    {
      name: "Socket 2 Power State",
      variableId: "p2",
    },
    {
      name: "Socket 3 Power State",
      variableId: "p3",
    },
    {
      name: "Socket 4 Power State",
      variableId: "p4",
    },
    {
      name: "Socket 1 Name",
      variableId: "p1_name",
    },
    {
      name: "Socket 2 Name",
      variableId: "p2_name",
    },
    {
      name: "Socket 3 Name",
      variableId: "p3_name",
    },
    {
      name: "Socket 4 Name",
      variableId: "p4_name",
    }
  );

  this.setVariableDefinitions(variables);
  this.setVariableValues({
    p1: "?",
    p2: "?",
    p3: "?",
    p4: "?",
    p1_name: "S1",
    p2_name: "S2",
    p3_name: "S3",
    p4_name: "S4",
  });
}
