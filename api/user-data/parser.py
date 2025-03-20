# Instead of saving as a string, json files can be used as dictonaries
json_string = {"testTubes": [], "valves": [], "pumps": [{"id": 1742278123743, "position": {"x": 4.59454064265324, "y": 0, "z": 3}}], "pipes": []}

data = json_string

class Node:
      def __init__(self, id, x, y, z):
            roundVal = lambda val: round(val)

            self.x = roundVal(x)
            self.y = roundVal(y)
            self.z = roundVal(z)
            self.id = id

      @property
      def getNode(self) -> (int, int, int, int):
            return self.id, self.x, self.y, self.z

# automate a way to get all the nodes separately by checking their contents

# Need to create If loop to validate initialization
# Need to be able to handle various objects using id
# Need to connect vectors together using adjacency list
pump = data['pumps'][0]
pumpNode = Node(id = pump['id'], x = pump['position']['x'],y = pump['position']['y'],z = pump['position']['z'])
print(pumpNode.getNode)
tupelval = pump.getNode