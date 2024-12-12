import React, { useState, useEffect } from "react";
import axios from "axios";

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);

  const API_KEY = "bc09cc6af7d66fff9e4388f502906230";

  const fetchWeather = async (city) => {
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=imperial`
      );
      setWeather(weatherResponse.data);
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=imperial`
      );
      setForecast(forecastResponse.data);
      setError(null);
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("City not found");
        }
      setWeather(null);
      setForecast(null);
    }
  };

  useEffect(() => {
    const fetchLocationWeather = async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const locationResponse = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=imperial`
            );
            const cityName = locationResponse.data.name;
            setCity(cityName);
            fetchWeather(cityName);
          } catch (err) {
            setError("Unable to fetch location");
          }
        },
        () => {
          setError("Geolocation is disabled or unavailable.");
        }
      );
    };

    fetchLocationWeather();
  }, []);

  const querySearch = () => {
    if (city) {
      fetchWeather(city);
    }
  };

  return (
    <div>
      <h1>Weather Dashboard</h1>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city"
      />
      <button onClick={querySearch}>Search</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {weather && (
        <div>
          <h2>{weather.name}</h2>
          <p>Temperature: {weather.main.temp}°F</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <p>Description: {weather.weather[0].description}</p>
        </div>
      )}
      {forecast && (
        <div>
          <h2>5-Days Forecast</h2>
          {forecast.list.map((entry, index) => (
            <div key={index} className="forecast">
              <p>Date: {entry.dt_txt}</p>
              <p>Temperature: {entry.main.temp}°F</p>
              <p>Weather: {entry.weather[0].description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Weather;
