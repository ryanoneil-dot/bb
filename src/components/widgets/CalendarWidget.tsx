import React from "react";
import styles from "../dashboard.module.css";

function renderMonthGrid(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = [] as number[];
  for (let d = 1; d <= end.getDate(); d++) days.push(d);
  return (
    <div className={styles.calendarGrid}>
      {days.map((d) => (
        <div key={d} className={styles.calendarCell}>
          {d}
        </div>
      ))}
    </div>
  );
}

export default function CalendarWidget() {
  const now = new Date();
  return (
    <div className={styles.widget}>
      <div className={styles.calendarSmall}>
        <div className={styles.calendarHeader}>{now.toLocaleString(undefined, { month: "short", year: "numeric" })}</div>
        {renderMonthGrid(now)}
      </div>
    </div>
  );
}
