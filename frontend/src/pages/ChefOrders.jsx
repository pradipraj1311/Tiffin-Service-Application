import { useEffect, useState } from "react";
import { getChefOrders, updateOrderStatus } from "../services/orderService";

export default function ChefOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getChefOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching incoming orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      let otp = null;
      if (newStatus === "Delivered") {
        otp = window.prompt(
          "To complete delivery, enter the 4-digit OTP provided by the Customer:"
        );
        if (!otp) return;
      }

      await updateOrderStatus(orderId, newStatus, otp);

      setOrders(
        orders.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );
      alert(`Order successfully marked as ${newStatus}`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "orange";
      case "Preparing":
        return "#17a2b8";
      case "Out for Delivery":
        return "#007bff";
      case "Delivered":
        return "#28a745";
      case "Cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="container">
      <h2>Incoming Orders Dashboard</h2>

      <div className="card-grid">
        {orders.length === 0 ? (
          <p>No incoming orders yet.</p>
        ) : (
          orders.map((order) => {
            const customer = order.CustomerId;
            return (
              <div
                key={order._id}
                className="card"
                style={{
                  borderTop: `4px solid ${getStatusColor(order.status)}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <strong>{order.post_MenuId?.MealTypes?.join(", ")}</strong>
                  <span style={{ color: "gray", fontSize: "12px" }}>
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "10px",
                    borderRadius: "6px",
                    marginBottom: "15px",
                  }}
                >
                  <p style={{ margin: "0 0 5px 0" }}>
                    <strong>Customer:</strong> {customer?.name}
                  </p>
                  <p style={{ margin: "0 0 5px 0" }}>
                    <strong>Phone:</strong> {customer?.PhoneNumber}
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
                    <strong>Address:</strong> {customer?.address?.Street},{" "}
                    {customer?.address?.City}
                  </p>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <label style={{ fontWeight: "bold" }}>Status:</label>
                  <select
                    value={order.status || "Pending"}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    style={{ marginBottom: 0, padding: "8px", flex: 1 }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}