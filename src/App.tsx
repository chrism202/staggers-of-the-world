import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

const FERRY_TIMES = ["7:55", "10:40", "13:25", "16:15", "18:55"];

function App() {
  const [selectedAttendeeId, setSelectedAttendeeId] =
    useState<Id<"attendees"> | null>(null);

  const attendees = useQuery(api.attendees.list);
  const carsWithAttendees = useQuery(api.cars.listWithAttendees);

  const seedData = useMutation(api.seed.seedData);
  const assignToCar = useMutation(api.attendees.assignToCar);
  const removeFromCar = useMutation(api.attendees.removeFromCar);
  const assignFerryTime = useMutation(api.cars.assignFerryTime);
  const clearFerryTime = useMutation(api.cars.clearFerryTime);

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

      <div className="user-selection">
        <label htmlFor="attendee-select">Who are you?</label>
        <select
          id="attendee-select"
          value={selectedAttendeeId ?? ""}
          onChange={(e) =>
            setSelectedAttendeeId(
              e.target.value ? (e.target.value as Id<"attendees">) : null
            )
          }
        >
          <option value="">Select your name...</option>
          {attendees.map((attendee) => (
            <option key={attendee._id} value={attendee._id}>
              {attendee.name}
            </option>
          ))}
        </select>
      </div>

      {selectedAttendee && (
        <div className="current-assignment">
          <strong>{selectedAttendee.name}</strong>
          {currentCar ? (
            <span>
              {" "}
              - You're in <strong>{currentCar.ownerName}'s car</strong>
              {currentCar.ferryTime && ` (${currentCar.ferryTime} ferry)`}
              <button className="leave-button" onClick={handleLeaveCar}>
                Leave Car
              </button>
            </span>
          ) : (
            <span> - Not assigned to any car yet</span>
          )}
        </div>
      )}

      <div className="cars-grid">
        {carsWithAttendees.map((car) => (
          <div
            key={car._id}
            className={`car-card ${currentCar?._id === car._id ? "current" : ""}`}
          >
            <h2>{car.ownerName}'s Car</h2>

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

            {selectedAttendeeId && currentCar?._id !== car._id && (
              <button
                className="join-button"
                onClick={() => handleJoinCar(car._id)}
              >
                Join this car
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
