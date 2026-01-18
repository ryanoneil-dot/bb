import React, { useEffect, useState } from "react";
import styles from "../dashboard.module.css";

type ForecastDay = { date: string; tempMax: number; tempMin: number };

export default function WeatherWidget() {
  const [loading, setLoading] = useState(false);
  const [temp, setTemp] = useState<number | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);

  useEffect(() => {
    // try fetching simple weather for a default location (NYC lat/lon) via Open-Meteo
    async function fetchWeather() {
      try {
        setLoading(true);
        const lat = 40.7128;
        const lon = -74.006;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await res.json();
        if (data.current_weather) setTemp(Math.round(data.current_weather.temperature));
        if (data.daily) {
          const days: ForecastDay[] = (data.daily.time || []).map((d: string, i: number) => ({
            date: d,
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
          }));
          setForecast(days.slice(0, 7));
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  return (
    <div className={styles.widget}>
      <div className={styles.weatherHead}>Weather</div>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div>
          <div className={styles.weatherMain}>{temp !== null ? `${temp}°C` : "—"}</div>
          <details>
            <summary>7-day forecast</summary>
            <div className={styles.forecastList}>
              {forecast.map((f) => (
                <div key={f.date} className={styles.forecastItem}>
                  <div>{f.date}</div>
                  <div>
                    {f.tempMin}° / {f.tempMax}°
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
