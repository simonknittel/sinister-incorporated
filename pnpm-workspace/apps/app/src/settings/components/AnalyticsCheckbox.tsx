"use client";

import { useState, type ChangeEventHandler } from "react";

const AnalyticsCheckbox = () => {
  const [value, setValue] = useState(
    localStorage.getItem("va-disable") === "true",
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.checked) {
      localStorage.setItem("va-disable", "true");
    } else {
      localStorage.removeItem("va-disable");
    }

    setValue(e.target.checked);
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        type="checkbox"
        id="va-disable"
        name="va-disable"
        onChange={handleChange}
        defaultChecked={value}
      />

      <label htmlFor="va-disable">Disable</label>
    </div>
  );
};

export default AnalyticsCheckbox;
