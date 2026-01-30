import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";
import CalendarTab from "./components/CalendarTab";

const FERRY_TIMES = ["7:55", "10:40", "13:25", "16:15", "18:55"];

const GOLF_ABILITY_OPTIONS = [
  { value: "single_digit", label: "Single digit handicapper" },
  { value: "mid_handicapper", label: "Mid handicapper (<20)" },
  { value: "high_handicapper", label: "High handicapper (>20)" },
  { value: "never_played", label: "Never played" },
] as const;

type GolfingAbility = "single_digit" | "mid_handicapper" | "high_handicapper" | "never_played";

type Tab = "people" | "cars" | "calendar";

function App() {
  const [selectedAttendeeId, setSelectedAttendeeId] =
    useState<Id<"attendees"> | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("people");
  const [newCarName, setNewCarName] = useState("");
  const [editingLeavingFrom, setEditingLeavingFrom] = useState<Id<"cars"> | null>(null);
  const [leavingFromInput, setLeavingFromInput] = useState("");

  const attendees = useQuery(api.attendees.list);
  const carsWithAttendees = useQuery(api.cars.listWithAttendees);

  const seedData = useMutation(api.seed.seedData);
  const assignToCar = useMutation(api.attendees.assignToCar);
  const removeFromCar = useMutation(api.attendees.removeFromCar);
  const updateGolfInfo = useMutation(api.attendees.updateGolfInfo);
  const assignFerryTime = useMutation(api.cars.assignFerryTime);
  const clearFerryTime = useMutation(api.cars.clearFerryTime);
  const addCar = useMutation(api.cars.addCar);
  const removeCar = useMutation(api.cars.removeCar);
  const setLeavingFrom = useMutation(api.cars.setLeavingFrom);

  const selectedAttendee = attendees?.find((a) => a._id === selectedAttendeeId);
  const currentCar = carsWithAttendees?.find(
    (c) => c._id === selectedAttendee?.carId
  );

  const handleJoinCar = async (carId: Id<"cars">) => {
    if (!selectedAttendeeId) return;
    await assignToCar({ attendeeId: selectedAttendeeId, carId });
  };

  const handleLeaveCar = async () => {
    if (!selectedAttendeeId) return;
    await removeFromCar({ attendeeId: selectedAttendeeId });
  };

  const handleFerryTimeChange = async (
    carId: Id<"cars">,
    ferryTime: string
  ) => {
    if (ferryTime === "") {
      await clearFerryTime({ carId });
    } else {
      await assignFerryTime({ carId, ferryTime });
    }
  };

  const handleAddCar = async () => {
    if (!newCarName.trim()) return;
    await addCar({ name: newCarName.trim() });
    setNewCarName("");
  };

  const handleRemoveCar = async (carId: Id<"cars">) => {
    if (confirm("Are you sure you want to remove this car? All passengers will be unassigned.")) {
      await removeCar({ carId });
    }
  };

  const handleLeavingFromSave = async (carId: Id<"cars">) => {
    await setLeavingFrom({ carId, leavingFrom: leavingFromInput.trim() });
    setEditingLeavingFrom(null);
    setLeavingFromInput("");
  };

  const handleStartEditLeavingFrom = (carId: Id<"cars">, currentValue: string | undefined) => {
    setEditingLeavingFrom(carId);
    setLeavingFromInput(currentValue || "");
  };

  const handleCarChange = async (attendeeId: Id<"attendees">, carId: string) => {
    if (carId === "") {
      await removeFromCar({ attendeeId });
    } else {
      await assignToCar({ attendeeId, carId: carId as Id<"cars"> });
    }
  };

  const handleGolfAbilityChange = async (attendeeId: Id<"attendees">, ability: string, currentBringingClubs: boolean | undefined) => {
    await updateGolfInfo({
      attendeeId,
      golfingAbility: ability === "" ? undefined : ability as GolfingAbility,
      bringingClubs: currentBringingClubs,
    });
  };

  const handleBringingClubsChange = async (attendeeId: Id<"attendees">, bringingClubs: boolean, currentAbility: GolfingAbility | undefined) => {
    await updateGolfInfo({
      attendeeId,
      golfingAbility: currentAbility,
      bringingClubs,
    });
  };

  if (attendees === undefined || carsWithAttendees === undefined) {
    return <div className="loading">Loading...</div>;
  }

  if (attendees.length === 0) {
    return (
      <div className="container">
        <h1>Staggers of the World</h1>
        <p>No data found. Click below to initialize the database.</p>
        <button className="seed-button" onClick={() => seedData({})}>
          Initialize Data
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Staggers of the World</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "people" ? "active" : ""}`}
          onClick={() => setActiveTab("people")}
        >
          People
        </button>
        <button
          className={`tab ${activeTab === "cars" ? "active" : ""}`}
          onClick={() => setActiveTab("cars")}
        >
          Cars
        </button>
        <button
          className={`tab ${activeTab === "calendar" ? "active" : ""}`}
          onClick={() => setActiveTab("calendar")}
        >
          Calendar
        </button>
      </div>

      {activeTab === "people" && (
        <div className="tab-content">
          <div className="people-grid">
            {attendees.map((attendee) => (
              <div key={attendee._id} className="person-card">
                <div className="person-header">
                  <h2>{attendee.name}</h2>
                </div>

                <div className="person-field">
                  <label>Car:</label>
                  <select
                    value={attendee.carId ?? ""}
                    onChange={(e) => handleCarChange(attendee._id, e.target.value)}
                  >
                    <option value="">Not assigned</option>
                    {carsWithAttendees.map((car) => (
                      <option key={car._id} value={car._id}>
                        {car.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="person-field">
                  <label>Golf ability:</label>
                  <select
                    value={attendee.golfingAbility ?? ""}
                    onChange={(e) => handleGolfAbilityChange(attendee._id, e.target.value, attendee.bringingClubs)}
                  >
                    <option value="">Not set</option>
                    {GOLF_ABILITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="person-field checkbox-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={attendee.bringingClubs ?? false}
                      onChange={(e) => handleBringingClubsChange(attendee._id, e.target.checked, attendee.golfingAbility)}
                    />
                    Bringing clubs
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "cars" && (
        <div className="tab-content">
          <div className="add-car-section">
            <input
              type="text"
              placeholder="New car name..."
              value={newCarName}
              onChange={(e) => setNewCarName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCar()}
            />
            <button className="add-car-button" onClick={handleAddCar}>
              Add Car
            </button>
          </div>

          <div className="cars-grid">
            {carsWithAttendees.map((car) => (
              <div
                key={car._id}
                className={`car-card ${currentCar?._id === car._id ? "current" : ""}`}
              >
                <div className="car-header">
                  <h2>{car.name}</h2>
                  <button
                    className="remove-car-button"
                    onClick={() => handleRemoveCar(car._id)}
                    title="Remove car"
                  >
                    &times;
                  </button>
                </div>

                <div className="ferry-time">
                  <label>Ferry Time:</label>
                  <select
                    value={car.ferryTime ?? ""}
                    onChange={(e) => handleFerryTimeChange(car._id, e.target.value)}
                  >
                    <option value="">Not set</option>
                    {FERRY_TIMES.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="leaving-from">
                  <label>Leaving from:</label>
                  {editingLeavingFrom === car._id || !car.leavingFrom ? (
                    <input
                      type="text"
                      placeholder="Enter location..."
                      value={editingLeavingFrom === car._id ? leavingFromInput : ""}
                      onChange={(e) => setLeavingFromInput(e.target.value)}
                      onFocus={() => {
                        if (editingLeavingFrom !== car._id) {
                          handleStartEditLeavingFrom(car._id, car.leavingFrom);
                        }
                      }}
                      onBlur={() => handleLeavingFromSave(car._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleLeavingFromSave(car._id);
                        }
                      }}
                    />
                  ) : (
                    <span
                      className="leaving-from-value"
                      onClick={() => handleStartEditLeavingFrom(car._id, car.leavingFrom)}
                    >
                      {car.leavingFrom}
                    </span>
                  )}
                </div>

                <div className="passengers">
                  <h3>Passengers ({car.attendees.length})</h3>
                  {car.attendees.length > 0 ? (
                    <ul>
                      {car.attendees.map((attendee) => (
                        <li
                          key={attendee._id}
                          className={
                            attendee._id === selectedAttendeeId ? "you" : ""
                          }
                        >
                          {attendee.name}
                          {attendee._id === selectedAttendeeId && " (you)"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="empty">No passengers yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "calendar" && <CalendarTab />}
    </div>
  );
}

export default App;
