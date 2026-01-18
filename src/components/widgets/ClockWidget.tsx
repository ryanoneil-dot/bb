import React, { useEffect, useState } from "react";
import styles from "../dashboard.module.css";

export default function ClockWidget() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hours = now.getHours().toString().padStart(2, "0");
  const mins = now.getMinutes().toString().padStart(2, "0");
  const day = now.toLocaleDateString(undefined, { weekday: "short" });
  const date = now.getDate();
  const month = now.toLocaleDateString(undefined, { month: "short" });

  return (
    <div className={styles.widget}>
      <div className={styles.widgetClock}>
        <div className={styles.time}>{hours}:{mins}</div>
        <div className={styles.date}>{day} • {month} {date}</div>
      </div>
    </div>
  );
}
