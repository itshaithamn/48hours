import numpy as np
import matplotlib.pyplot as plt
from tqdm import tqdm

N_POINTS = 11
KINEMATIC_VISCOSITY = 0.01
TIME_STEP_LENGTH = 0.2
N_TIME_STEPS = 100

PRESSURE_GRADIENT = np.array([-1.0, 0.0])

def main():
    element_length = 1.0 / (N_POINTS - 1)

    x_range = np.linspace(0.0, 1.0, N_POINTS)
    y_range = np.linspace(0.0, 1.0, N_POINTS)

    coordinates_x, coordinates_y = np.meshgrid(x_range, y_range)

    def central_difference_x_periodic(field):
        diff = (
            (
                np.roll(field, shift=1, axis=1)
                -
                np.roll(field, shift=-1, axis=1)
            ) / (
                2 * element_length
            )
        )
        return diff

    def laplace_periodic(field):
        diff = (
            (
                np.roll(field, shift=1, axis=1)
                +
                np.roll(field, shift=1, axis=0)
                +
                np.roll(field, shift=-1, axis=1)
                +
                np.roll(field, shift=-1, axis=0)
                -
                4 * field
            ) / (
                element_length**2
            )
        )
        return diff

    #Define the initial condition
    velocity_x_prev = np.ones((N_POINTS, N_POINTS))
    velocity_x_prev[0, :] = 0.0
    velocity_x_prev[-1, :] = 0.0

    for iter in tqdm(range(N_TIME_STEPS)):
        convection_x = (
            velocity_x_prev
            *
            central_difference_x_periodic(velocity_x_prev)
        )
        diffusion_x = (
            KINEMATIC_VISCOSITY
            *
            laplace_periodic(velocity_x_prev)
        )
        velocity_x_next = (
            velocity_x_prev
            +
            TIME_STEP_LENGTH
            *
            (
                -
                PRESSURE_GRADIENT[0]
                +
                diffusion_x
                -
                convection_x
            )
        )

        velocity_x_next[0, :] = 0.0
        velocity_x_next[-1, :] = 0.0

        # Advance in time
        velocity_x_prev = velocity_x_next

        #Visualization
        plt.contourf(coordinates_x, coordinates_y, velocity_x_next, levels=50)
        plt.colorbar()
        plt.quiver(coordinates_x, coordinates_y, velocity_x_next, np.zeros_like(velocity_x_next))
        plt.xlabel("Position alongside the pipe")
        plt.ylabel("Position perpendicular to the pipe axis")
        plt.draw()
        plt.pause(0.5)
        plt.clf()

if __name__ == "__main__":
    main()