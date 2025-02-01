import math
#Using metric system

g = 9.8

#testing:
velocity = 1
pipeLength = 20
pipeDiameter = 10
fluid = "coolant concentration 50%"
roughnessHeight = 2

#Function to take the user input and store it in variables
def user_control(velocity, pipeLength, pipeDiameter, fluid):
    self.velocity = velocity
    self.pipeLength = pipeLength
    self.pipeDiameter = pipeDiameter
    self.fluid = fluid 

#1. Renoylds Number

# ASSUMING THAT THE TEMP STAYS AT 20 DEGREES CELSIUIS
#the following density/viscosity numbers are from (https://wiki.anton-paar.com/be-en/water/, https://wiki.anton-paar.com/us-en/automotive-antifreeze/ and converted to proper SI units)

if fluid == "water":
        fluidDensity = 998.2 
        fluidViscosity = 0.0010016
if fluid == "coolant concentration 50%":
        fluidDensity = 1077.1
        fluidViscosity = 0.00429
Re = (fluidDensity * velocity * pipeDiameter) / fluidViscosity

#2. Friction factor 
if Re < 2000: #Laminar
       f = 64/Re
        
elif Re > 4000: #Turbulent
        x = ((roughnessHeight / pipeDiameter) / 3.7) + (5.74 / (math.pow(Re, 0.9)))
        f = 0.25 / math.pow(math.log(x), 2)
else: print("neither")

#3. dw eq

majorHeadLoss = f * (pipeLength / pipeDiameter) * (math.pow(velocity, 2) / (2*g))

print(Re)
print(f)
print(majorHeadLoss)
