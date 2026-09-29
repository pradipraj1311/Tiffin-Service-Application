import { useEffect, useState } from "react";
import { getUserOrders, cancelOrder } from "../services/orderService";
import { createPayment } from "../services/paymentService";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (order, method) => {
    const dynamicPrice = order.orderQuantity * 150;
    if (method === "COD") {
      try {
        await createPayment({
          order_Id: order._id,
          payment_type: "COD",
          payment_status: false,
        });
        alert("COD Payment selected. Status is Pending.");
      } catch (error) {
        alert("Failed to process COD");
      }
      return;
    }

    if (method === "Online") {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: dynamicPrice * 100,
        currency: "INR",
        name: "Tiffin Service App",
        description: "Payment for your order",
        handler: async function (response) {
          try {
            await createPayment({
              order_Id: order._id,
              payment_type: "Online Gateway",
              payment_status: true,
            });
            alert(
              `Payment Successful! Payment ID: ${response.razorpay_payment_id}`,
            );
          } catch (error) {
            alert("Failed to save payment to database");
          }
        },
        theme: { color: "#3399cc" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <p>
                <strong>Order ID:</strong> {order._id}
              </p>
              <p>
                <strong>Quantity:</strong> {order.orderQuantity}
              </p>
              <p>
                <strong>Total Price :</strong> {order.orderQuantity * 150}
              </p>

              <p>
                <strong>Menu:</strong>
                {order.post_MenuId?.MealTypes?.join(", ")}
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => handlePayment(order, "COD")}
                  style={{ background: "green", color: "white" }}
                >
                  Cash on Delivery
                </button>
                <button
                  onClick={() => handlePayment(order, "Online")}
                  style={{ background: "blue", color: "white" }}
                >
                  Pay Online
                </button>
                <button
                  onClick={() => handleCancel(order._id)}
                  style={{ background: "red", color: "white" }}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
