import math
#Using metric system

g = 9.8

#testing:
velocity = 1
fluid = "coolant concentration 50%"
roughnessHeight = 2
component = "gate valve, fully open"
pipeShape = "straight"

#Function to take the user input and store it in variables
def user_control(velocity, pipeShape, fluid, component):
        self.velocity = velocity
        self.fluid = fluid 
        self.component = component

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
