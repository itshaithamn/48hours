class PressureSource:
    # Object has default 0, 100, 0
    def __init__(self, initial_pressure=20, min_pressure=0, max_pressure=100):
        self.pressure = initial_pressure
        self.min_pressure = min_pressure
        self.max_pressure = max_pressure

    def increase_pressure(self, amount):
        self.pressure = min(self.pressure + amount, self.max_pressure)
        print(f"Pressure increased to {self.pressure}")

    def decrease_pressure(self, amount):
        self.pressure = max(self.pressure - amount, self.min_pressure)
        print(f"Pressure decreased to {self.pressure}")

    def set_pressure(self, value):
        if self.min_pressure <= value <= self.max_pressure:
            self.pressure = value
            print(f"Pressure set to {self.pressure}")
        else:
            print(f"Error: Pressure must be between {self.min_pressure} and {self.max_pressure}")

    def get_pressure(self):
        return self.pressure


# test code, must find a way to set source from javascript
if __name__ == "__main__":
    source = PressureSource(initial_pressure=50, max_pressure=200, min_pressure=0)

    source.increase_pressure(30) # increaase to 80
    source.decrease_pressure(50)  # decrease to 30
    source.set_pressure(150)  # set 150
    source.set_pressure(250)  # try to go above 150
    print(f"Current pressure: {source.get_pressure()}")
