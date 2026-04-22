const apiKey = "605934ae4fd83b5e003d7a680333afbf";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");
const historyList = document.getElementById("historyList");

// Restric the changes after loading webpage
window.onload = function () {
    loadHistory();

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }
};

// Main fetch function
async function getWeather(city) {
    console.log("Start fetching weather...");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        console.log("Response Received");

        const data = await response.json();

        if (
            data.cod !== 200 || 
            !data.name || 
            !data.main ||
            !data.weather ||
            !data.coord ||
            Math.abs(data.coord.lat) < 1 && Math.abs(data.coord.lon) < 1
        ) {
            throw new Error("City not found");
        }

        console.log("Data processed")

        displayWeather(data);
        saveToHistory(city);
    } catch (error) {
        console.log("Error occurred:", error);
        weatherResult.innerHTML = "Error: " + error.message;
    }

    console.log("End of function");
}

// Display weather
function displayWeather(data) {

    const condition = data.weather[0].main.toLowerCase();

    let icon = "☀️"

    if (condition.includes("cloud")) icon = "☁️"
    if (condition.includes("rain")) icon = "🌧️"
    if (condition.includes("haze")) icon = "🌫️"
    if (condition.includes("clear")) icon = "☀️"

    weatherResult.innerHTML = `
        <h2>${data.name}</h2>
        <div class="weather-icon">${icon}</div>
        <p>Temperature: ${data.main.temp} °C</p>
        <p>Condition: ${data.weather[0].main}</p>
    `;

    // 🎨 Change Background based on weather
    changeBackground(data.weather[0].main);
}

function changeBackground(condition) {
    const body = document.body;

    if (document.body.classList.contains("dark")) return;

    // Reset first
    body.classList.remove("clear", "clouds", "rain", "haze");

    if (condition.toLowerCase().includes("clear")) {
        body.classList.add("clear");
    } else if (condition.toLowerCase().includes("cloud")) {
        body.classList.add("clouds");
    } else if (condition.toLowerCase().includes("rain")) {
        body.classList.add("rain");
    } else if (condition.toLowerCase().includes("haze")) {
        body.classList.add("haze");
    }
}

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();

    // Empty check
    if (city === "") {
        weatherResult.innerHTML = "Please enter a city name";
        return;
    }

    // Prevent Obvious fake inputs
    if (!/^[a-zA-Z\s]+$/.test(city)) {
        weatherResult.innerHTML = "Invalid city name";
        return;
    }

    getWeather(city);
}); 

// Save city to local storage
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem("cities")) || [];

    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    // Check Case-insensitive Duplicates
    const exists = history.some(
        c => c.toLowerCase() === formattedCity.toLowerCase()
    );

    if (!exists) {
        history.push(formattedCity)
        localStorage.setItem("cities", JSON.stringify(history));
    }

    loadHistory();
}

// Load History on page
function loadHistory() {
    historyList.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("cities")) || [];

    history.forEach((city, index) => {
        const li = document.createElement("li");
        li.classList.add("history-item");

        const citySpan = document.createElement("span");
        citySpan.textContent = city;

        citySpan.addEventListener("click", () => {
            getWeather(city)
        })

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.classList.add("delete-btn");
        
        deleteBtn.addEventListener("click", () => {
            history.splice(index, 1);
            localStorage.setItem("cities", JSON.stringify(history));
            loadHistory();
        });

        li.appendChild(citySpan);
        li.appendChild(deleteBtn);

        historyList.appendChild(li);
    });
}

// Toggle
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    // Save Preference
    if (document.body.classList.contains("dark")) {
        themeToggle.textContent = "☀️";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.textContent = "🌙"
        localStorage.setItem("theme", "light");
    }
});