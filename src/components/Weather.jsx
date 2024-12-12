import React, { useState, useEffect } from "react";
import axios from "axios";

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);

  const API_KEY = "bc09cc6af7d66fff9e4388f502906230"; 

  const fetchWeatherData = async (city) => {
    try {
      // First, get the coordinates of the city using the Geocoding API
      const geocodeResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},US&appid=${API_KEY}`
      );
      const { lat, lon } = geocodeResponse.data.coord;

      // using the coordinates to get the weather data
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      );
      setWeather(weatherResponse.data);

      // Fetch the forecast data `
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      );
      const forecastList = forecastResponse.data.list.slice(0, 5); // the next 5 forecasts
      setForecast({ list: forecastList });

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
    // If the user allows location access, fetch their current location's weather
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const locationResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=imperial`
          );
          const cityName = locationResponse.data.name;
          setCity(cityName);
          fetchWeatherData(cityName);
        } catch {
          setError("Unable to get weather for your location.");
        }
      },
      () => {
        setError("Location access denied. Please enter a city.");
      }
    );
  }, []);

  const querySearch = () => {
    if (city) {
      fetchWeatherData(city);
    }
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div>
      <h1>Weather App</h1>
      <div>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city, state code"
          className="city-input"
        />
        <button onClick={querySearch}>
          Search
        </button>
      </div>

      {weather && (
        <div>
          <h2>Current Weather in {weather.name}</h2>
          <p>Temperature: {weather.main.temp}°F</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} mph</p>
          <p>Condition: {weather.weather[0].description}</p>
        </div>
      )}

      {forecast && forecast.list && (
        <div className="forecast-container">
          <h2 style={{textAlign: 'center'}}>Forecast</h2>
          <div className="forecast-cards">
            {forecast.list.map((entry, index) => (
              <div key={index} className="forecast-card">
                <p>Date: {entry.dt_txt}</p>
                <p>Temperature: {entry.main.temp}°F</p>
                <p>Condition: {entry.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Weather;
