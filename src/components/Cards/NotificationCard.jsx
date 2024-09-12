import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

export default function NotificationCard({ icon, title, stateValue, onToggle }) {
  const [switchState, setSwitchState] = useState(stateValue);

  useEffect(() => {
    setSwitchState(stateValue);
  }, [stateValue]);

  const handleChange = () => {
    const newState = !switchState;
    setSwitchState(newState);
    onToggle(newState);
  };

  return (
    <div className="flex justify-between items-center gap-4 cardShadow p-4 my-5">
      <div className="icon">
        <img src={icon} alt={icon} />
      </div>
      <div className="flex-1">{title}</div>
      <div className="switch">
        <Switch id="notification-switch" checked={switchState} onCheckedChange={handleChange} />
      </div>
    </div>
  );
}
