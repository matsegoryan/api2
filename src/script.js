let map;
let markers = [];
let userLocation;

ymaps.ready(init);

function init() {
    map = new ymaps.Map("map", {
        center: [55.7558, 37.6173],
        zoom: 12,
        controls: ['routePanelControl', 'zoomControl', 'searchControl', 'rulerControl']
    });

    loadMarkers();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation = [position.coords.latitude, position.coords.longitude];
            map.setCenter(userLocation);
            new ymaps.Placemark(userLocation, {
                balloonContent: "Ваше местоположение"
            });
            fetchWeather(userLocation);
        });
    } else {
        alert("Геолокация не поддерживается вашим браузером.");
    }
}

document.getElementById("locateBtn").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLocation = [position.coords.latitude, position.coords.longitude];
            map.setCenter(userLocation);
            new ymaps.Placemark(userLocation, {
                balloonContent: "Ваше местоположение"
            })

            fetchWeather(userLocation);
        }, (error) => {
            console.error("Ошибка получения местоположения:", error);
            alert("Не удалось определить местоположение.");
        });
    } else {
        alert("Геолокация не поддерживается вашим браузером.");
    }
});

document.getElementById("addMarkerBtn").addEventListener("click", () => {
    let position;
    const marker = new ymaps.Placemark(
        position = map.getCenter(),
        {
            balloonContent: "Новый маркер"
        });

    markers.push(position);
    map.geoObjects.add(marker);
    saveMarkers();
});

function saveMarkers() {
    localStorage.setItem("markers", JSON.stringify(markers));
}

function loadMarkers() {
    const markerPositions = JSON.parse(localStorage.getItem("markers")) || [];
    markerPositions.forEach(position => {
        const marker = new ymaps.Placemark(position, {
            balloonContent: "Сохраненный маркер"
        });
        markers.push([...position]);
        map.geoObjects.add(marker);
    });
}

async function fetchWeather(location) {
    const [latitude, longitude] = location;
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Ошибка при получении данных о погоде");
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error("Ошибка:", error);
        document.getElementById("weather").innerText = "Не удалось получить данные о погоде.";
    }
}

function getWeatherDescription(code) {
    const descriptions = {
        0: "Ясно",
        1: "Небольшая облачность",
        2: "Облачно",
        3: "Дождь",
        4: "Снег",
    };
    return descriptions[code] || "Неизвестно";
}

function displayWeather(data) {
    const temperature = data.current_weather.temperature;
    const weatherDescription = data.current_weather.weathercode;
    const weatherConditions = getWeatherDescription(weatherDescription);
    document.getElementById("weather").innerText = `Температура: ${temperature}°C, Погода: ${weatherConditions}`;
}