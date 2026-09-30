import { useEffect, useState } from "react";
import { getUserOrders, cancelOrder } from "../services/orderService";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getUserOrders();
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedData);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelOrder(orderId);
      setOrders(orders.filter((order) => order._id !== orderId));
      alert("Order cancelled successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const mealType = order.post_MenuId?.MealTypes?.join(", ") || "";
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mealType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#f0ad4e";
      case "Preparing":
        return "#17a2b8";
      case "Out for Delivery":
        return "#007bff";
      case "Delivered":
        return "#28a745";
      case "Cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  if (loading) return <div className="container">Loading your orders...</div>;

  return (
    <div className="container" style={{ maxWidth: "900px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <h2 style={{ margin: 0 }}>Your Orders</h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flex: "1",
            minWidth: "300px",
            justifyContent: "flex-end",
          }}
        >
          <input
            type="text"
            placeholder="Search all orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              marginBottom: 0,
              padding: "10px",
              flex: "2",
              maxWidth: "300px",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              marginBottom: 0,
              padding: "10px",
              flex: "1",
              maxWidth: "150px",
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "white",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <h3 style={{ color: "gray" }}>No orders found.</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filteredOrders.map((order) => {
            const menu = order.post_MenuId;
            const isCancellable = order.status === "Pending";

            return (
              <div
                key={order._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "white",
                }}
              >
                <div
                  style={{
                    background: "#f0f2f2",
                    padding: "15px 20px",
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "15px",
                  }}
                >
                  <div style={{ display: "flex", gap: "30px" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#555",
                          textTransform: "uppercase",
                          display: "block",
                        }}
                      >
                        Order Placed
                      </span>
                      <span style={{ fontSize: "14px", color: "#333" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#555",
                          textTransform: "uppercase",
                          display: "block",
                        }}
                      >
                        Total
                      </span>
                      <span style={{ fontSize: "14px", color: "#333" }}>
                        ₹{order.orderQuantity * (menu?.price || 150)}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#555",
                        textTransform: "uppercase",
                        display: "block",
                      }}
                    >
                      Order # {order._id.substring(0, 10).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: "2", minWidth: "250px" }}>
                    <h3 style={{ margin: "0 0 10px 0", fontSize: "20px" }}>
                      {menu?.MealTypes?.join(", ") || "Tiffin Meal"}
                    </h3>
                    <p style={{ margin: "0 0 5px 0", color: "#555" }}>
                      <strong>Delivery Date:</strong>{" "}
                      {menu?.deliveryDate
                        ? new Date(menu.deliveryDate).toLocaleDateString(
                            "en-GB",
                          )
                        : "N/A"}
                    </p>
                    <p style={{ margin: "0 0 5px 0", color: "#555" }}>
                      <strong>Quantity:</strong> {order.orderQuantity}
                    </p>

                    <div
                      style={{
                        display: "inline-block",
                        marginTop: "10px",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "white",
                        background: getStatusColor(order.status || "Pending"),
                      }}
                    >
                      {order.status || "Pending"}
                    </div>
                  </div>

                  <div
                    style={{
                      flex: "1",
                      minWidth: "150px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    {order.status !== "Delivered" &&
                      order.status !== "Cancelled" && (
                        <div
                          style={{
                            background: "#f8f9fa",
                            border: "2px dashed #007185",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            textAlign: "center",
                            width: "100%",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              color: "gray",
                              display: "block",
                              textTransform: "uppercase",
                            }}
                          >
                            Delivery OTP
                          </span>
                          <strong
                            style={{
                              fontSize: "24px",
                              letterSpacing: "4px",
                              color: "#333",
                            }}
                          >
                            {order.deliveryOTP}
                          </strong>
                        </div>
                      )}
                    {isCancellable && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        style={{
                          width: "100%",
                          background: "white",
                          color: "#d50000",
                          border: "1px solid #d50000",
                          padding: "10px",
                          borderRadius: "20px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}