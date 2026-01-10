import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBus } from "@fortawesome/free-solid-svg-icons";

export default function BusMarker() {
  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <span className="absolute w-10 h-10 rounded-full bg-primary/30 animate-ping"></span>
      <span className="absolute w-7 h-7 rounded-full bg-primary/40"></span>
      <FontAwesomeIcon icon={faBus} className="text-primary text-xl z-10" />
    </div>
  );
}
