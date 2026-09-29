import { useEffect, useState, useContext } from "react";
import { getNotifications } from "../services/notificationService";
import { AuthContext } from "../context/AuthContext";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading alerts...</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Your Notifications</h2>
      {notifications.length === 0 ? (
        <p>No new notifications at this time.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {notifications.map((note) => (
            <div
              key={note._id}
              style={{
                borderLeft: "4px solid #007bff",
                padding: "15px",
                background: "#f8f9fa",
                borderRadius: "4px",
              }}
            >
              {user.role === "Customer" ? (
                <p>
                  New update from <strong>Chef:</strong>{" "}
                  {note.chefId?.userId?.name || "Unknown"}
                </p>
              ) : (
                <p>
                  New activity from <strong>Customer:</strong>{" "}
                  {note.CustomerId?.userId?.name || "Unknown"}
                </p>
              )}
              <small style={{ color: "gray" }}>
                Received on: {new Date(note.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
