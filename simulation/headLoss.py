import math
import pressureSource

g = 9.8

#testing:
# need to recursively check for source pressure
source = pressureSource.PressureSource(initial_pressure=50, max_pressure=200, min_pressure=0)
initial_pressure = pressureSource.PressureSource.get_pressure()
velocity = 1
fluid = "coolant concentration 50%"
roughnessHeight = 2
component = "gate valve, fully open"
pipeShape = "straight"

class MyObject:
        def __init__(self, nodetype, size, diameter, material, length):
                self.nodetype = nodetype
                self.size = size
                self.diameter = diameter
                self.material = material
                self.length = length

# Function to take the user input and store it in variables
def user_control(self, velocity, pipeShape, fluid, component):
        self.velocity = velocity
        self.fluid = fluid
        self.component = component
        self.pipeShape = pipeShape

if fluid == "water":
        fluidDensity = 998.2
        fluidViscosity = 0.0010016
if fluid == "coolant concentration 50%":
        fluidDensity = 1077.1
        fluidViscosity = 0.00429
if component == "gate valve, fully open": #for minor loss coefficient k, which depends on the component used (from https://www.engineeringtoolbox.com/minor-loss-coefficients-pipes-d_626.html)
        k = .15
if pipeShape == "straight":
        pipeLength = 20
        pipeDiameter = 10
        initialArea = math.pi * (pipeDiameter / 2)

# need to figure out how to do this? I create the class already buy how do we constantly check this? Should we move to c++?
# if we look in test.py we see that the graph is used to recursively update the code and even has a pause timer. This is a principle
# that would also be beneficial for our code and I'm wondering how we can also implement it.
for i in numberOfNodes: #For each node (of which each an increment value keeps track of each one placed), calculate the head loss and final pressure

        #Renoylds Number
        # ASSUMING THAT THE TEMP STAYS AT 20 DEGREES CELSIUIS
        #the following density/viscosity numbers are from (https://wiki.anton-paar.com/be-en/water/, https://wiki.anton-paar.com/us-en/automotive-antifreeze/ and converted to proper SI units)

        Re = (fluidDensity * velocity * pipeDiameter) / fluidViscosity

        #2. Friction factor
        if Re < 2000: #Laminar
                f = 64/Re
                a = 2
        elif Re > 4000: #Turbulent
                x = ((roughnessHeight / pipeDiameter) / 3.7) + (5.74 / (math.pow(Re, 0.9)))
                f = 0.25 / math.pow(math.log(x), 2)
                a = 1
        else: print("neither")

        #3. dw eq
        majorHeadLoss = f * (pipeLength / pipeDiameter) * (math.pow(velocity, 2) / (2*g))

        #Minor head loss
        minorHeadLoss = (k * math.pow(velocity, 2)) / (2 * g)

        #Final pressure
        finalVelocity = (initialArea * velocity) / finalArea
        initialPressure = get_pressure()
        y = fluidDensity * ((a * 0.5 * math.pow(velocity, 2)) - (a * 0.5 * math.pow(finalVelocity, 2)) + (g * (finalHeight - initialHeight)) + pumpEnergy)
        finalPressure = initalPressure + y

        #Updating variables for the next node
        set_pressure(initalPressure, finalPressure)
        initialVelocity = finalVelocity

        print("Major head losss: " + majorHeadLoss)
        print("Minor head loss: " + minorHeadLoss)
        print("Final pressure: " + finalPressure)
