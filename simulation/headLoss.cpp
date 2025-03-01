#include <iostream>
#include <string>
#include <cmath>
#include <vector>
#include "pressureSource.cpp"
#include <math.h>
#include <numbers>


double const g = 9.8;
double pi = 3.14159265358979323846;

class Initial{
    public:
    std::string nodeType;
    int size;
    int diameter; 
    std::string material; 
    int length;

    Initial(std::string nodeType, int size, int diameter, std::string material, int length) : nodeType(nodeType), size(size), diameter(diameter), material(material), length(length){}
};

class UserInput{
    public:
    std::string fluid;
    double velocity;
    std::string component;
    std::string pipeShape;

    UserInput( std::string fluid,double velocity, std::string component,std::string pipeShape) : fluid(fluid), velocity(velocity), component(component), pipeShape(pipeShape){} 
};

struct FluidProperties {
    double density;
    double viscosity;
};

struct PipeProperties{
    double roughnessHeight;
    double initialArea;
    double finalArea;
    double initialHeight;
    double pumpEnergy;
    double drop;
};



int main(){

    PressureSource* sourcePtr = new PressureSource(50, 5000, 0);
    double initialPressure = sourcePtr->getPressure();

    //testing numbers- normally these would all be collected from the user..somehow..
    Initial initialTest = Initial("tbd", 1, 10, "plastic", 20);
    UserInput userTest = UserInput("coolant concentration 50%", 1, "gate valve, fully open", "straight");

    PipeProperties pipeTest;
    double finalArea;
    if(userTest.pipeShape == "straight"){
        pipeTest  = {2, (pi * (initialTest.diameter / 2)), (pi * (initialTest.diameter / 2)), 5,3};
         finalArea = pipeTest.initialArea;
    };

    FluidProperties fluidTest;

    if(userTest.fluid == "water"){
        fluidTest = {998.2, 0.0010016};
    };

    if(userTest.fluid == "coolant concentration 50%"){
        fluidTest = {1077.1, 0.00429};
    };

    double k;
    if(userTest.component == "gate valve, fully open"){
        k = 0.15;
       };
    

    double Re = (initialTest.diameter * userTest.velocity * fluidTest.density) / fluidTest.viscosity;

    double f, x;
    int a;
    if(Re < 2000){ //Laminar
        f = 64/Re;
        a = 2;
    }
    else if(Re > 4000){ //Turbulent
        x = ((pipeTest.roughnessHeight / initialTest.diameter) / 3.7) + (5.74 / (pow(Re, 0.9)));
        f = 0.25 / pow(log10(x), 2);
        a = 1;
    }
    else{ std::cout << "neither /n";
    }

    //3. dw eq
    double majorHeadLoss = f * (initialTest.length / initialTest.diameter) * (pow(userTest.velocity, 2) / (2*g));

    //Minor head loss
    double minorHeadLoss = (k * pow(userTest.velocity, 2)) / (2 * g);

    //Final pressure calculations
           
    double finalVelocity = (pipeTest.initialArea * userTest.velocity) / finalArea;
    double finalHeight = pipeTest.initialHeight + (pipeTest.drop / initialTest.length) * initialTest.length;

    double y = fluidTest.density * ((a * 0.5 * pow(userTest.velocity, 2)) - (a * 0.5 * pow(finalVelocity, 2)) + (g * (finalHeight -pipeTest.initialHeight))  + pipeTest.pumpEnergy);
     double finalPressure =  initialPressure + y;


    //Setting for next node
    sourcePtr->setPressure(finalPressure);
    userTest.velocity = finalVelocity;

    std::cout << "Major head loss: " << majorHeadLoss << std::endl;
    std::cout << "Minor head loss: " << minorHeadLoss << std::endl;
    std::cout << "Total head loss: " << majorHeadLoss + minorHeadLoss<< std::endl;
    std::cout << "Final pressure: " <<finalPressure << std::endl;


return 0;
}
