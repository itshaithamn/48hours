document.addEventListener("DOMContentLoaded", () => {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.height = "100vh";

    const button = document.createElement("button");
    button.innerText = "Send Data";
    button.style.padding = "10px";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";
    button.addEventListener("click", sendData);

    container.appendChild(button);
    document.body.appendChild(container);
});

const sendData = async () => {
    const data = { key1: "value1", key2: "value2" };  // Example data

    try {
        const response = await fetch('http://127.0.0.1:5000/receive_data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Server Response:", result);
    } catch (error) {
        console.error("Error sending data:", error);
    }
};
