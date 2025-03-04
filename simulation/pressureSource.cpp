#include <iostream>
#include <algorithm>

class PressureSource{
    private:

    double currentPressure;
    double maxPressure;
    double minPressure;

    public:

    PressureSource(double initial, double max, double min): currentPressure(initial), maxPressure(max), minPressure(min) {} 

    void increasePressure(int amount){
        currentPressure = std::min(currentPressure + amount, maxPressure);
        std::cout << "Pressure increased to " << currentPressure << std::endl;;
    }

    void decreasePressure(int amount){
        currentPressure = std::max(currentPressure - amount, minPressure);
        std::cout << "Pressure decreased to " << currentPressure << std::endl;;
    }

    void setPressure(double value){
        if(minPressure <= value && maxPressure >= value){
            currentPressure = value;
            std::cout << "Pressure succesfully set to " << currentPressure << std::endl;;
    } else{
       std::cout <<"Error: Pressure must be between " << minPressure << " and " << maxPressure << std::endl;
        };
    }

    double getPressure() const{
        return currentPressure;
    }
};

/* testing numbers, remove comment bars to ensure it works

int main(){
    PressureSource test(50, 200, 0);
    test.increasePressure(30);
    test.decreasePressure(50);
    test.setPressure(150);
    test.setPressure(250);
    std::cout << "Current pressure: " << test.getPressure();

    return 0;
}
*/
