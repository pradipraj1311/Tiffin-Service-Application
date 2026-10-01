import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTiffins } from "../services/tiffinService";
import { createOrder } from "../services/orderService";
import { createPayment } from "../services/paymentService";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [tiffins, setTiffins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState("Fetching location...");
  
  const [selectedTiffin, setSelectedTiffin] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("");
      },
      (error) => {
        setLocationStatus("Location access denied. Showing all menus.");
        fetchData(null, null, searchQuery);
      }
    );
  }, []);

  useEffect(() => {
    if (userLocation.lat) {
      fetchData(userLocation.lat, userLocation.lng, searchQuery);
    }
  }, [userLocation, searchQuery]);

  const fetchData = async (lat = null, lng = null, search = "") => {
    try {
      const data = await getAllTiffins({ lat, lng, search });
      setTiffins(data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchAddressFromOSM = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return {
        street: data.address.road || data.address.suburb || '',
        city: data.address.city || data.address.town || data.address.county || '',
        pincode: data.address.postcode || '',
        fullDisplay: data.display_name
      };
    } catch (error) {
      console.error("OSM Geocoding failed", error);
      return null;
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

  const handleInstantOrder = async (tiffin, method) => {
    try {
      const order = await createOrder({
        post_MenuId: tiffin._id,
        orderQuantity: 1,
      });
      const dynamicPrice = tiffin.price * 1;

      if (method === "COD") {
        
        alert("Order placed via Cash on Delivery! Redirecting...");
        navigate("/my-orders");
        return;
      }

      if (method === "Online") {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) return alert("Razorpay SDK failed to load");

        const options = {
          key: "VITE_RAZOR_PAY_KEY",
          amount: dynamicPrice * 100,
          currency: "INR",
          name: tiffin.CustomerId?.businessName || "Tiffin Service",
          description: `Order for ${tiffin.MealTypes.join(", ")}`,
          handler: async function (response) {
            await createPayment({
              order_Id: order._id,
              payment_type: "Online Gateway",
              payment_status: true,
            });
            alert(`Payment Successful! Redirecting...`);
            navigate("/my-orders");
          },
          theme: { color: "#28a745" },
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (error) {
      alert("Failed to process order or payment.");
    }
  };

  const isMenuExpired = (tiffin) => {
    if (!tiffin.deliveryDate || !tiffin.orderCutoff) return false;

    const deliveryDate = new Date(tiffin.deliveryDate);
    const today = new Date();

    // Normalize to midnight for accurate day comparison
    const deliveryDateOnly = new Date(deliveryDate.setHours(0, 0, 0, 0));
    const todayOnly = new Date(new Date().setHours(0, 0, 0, 0));

    // If delivery date is in the past, it's expired
    if (deliveryDateOnly < todayOnly) return true;

    // If delivery is today, check if current time has passed the orderCutoff
    if (deliveryDateOnly.getTime() === todayOnly.getTime()) {
      const [cutoffHour, cutoffMinute] = tiffin.orderCutoff.split(":").map(Number);
      const now = new Date();
      if (
        now.getHours() > cutoffHour ||
        (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute)
      ) {
        return true; 
      }
    }
    return false;
  };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const activeTiffins = tiffins.filter((t) => {
    if (!t.createdAt) return true;
    const isWithin7Days = new Date(t.createdAt) >= sevenDaysAgo;
    const isNotExpired = !isMenuExpired(t);
    return isWithin7Days && isNotExpired;
  });

  if (loading) return <div>Loading nearby tiffins...</div>;

  return (
    <div className="container">
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="🔍 Search for Tiffin Service Name (e.g., Umesh Tiffins) or Cuisine..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "15px",
            borderRadius: "30px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            width: "100%",
            border: "1px solid #ddd"
          }}
        />
        {locationStatus && (
          <small style={{ color: "orange", display: "block", marginTop: "10px", marginLeft: "15px" }}>
            {locationStatus}
          </small>
        )}
      </div>

      <h3>Nearby Tiffin Options</h3>

      <div className="card-grid">
        {activeTiffins.length === 0 ? (
          <p>No tiffins found in your area.</p>
        ) : (
          activeTiffins.map((tiffin) => {
            const ordersLeft = tiffin.capacity - (tiffin.soldOut ? tiffin.capacity : 0);
            const chef = tiffin.CustomerId;

            return (
              <div key={tiffin._id} className="card">
                <div style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "10px" }}>
                  <h3 style={{ margin: 0, color: "#333" }}>
                    {chef?.businessName || chef?.name || "Tiffin Service"}
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "gray" }}>
                    📞 {chef?.PhoneNumber}
                  </p>
                  {typeof tiffin.calculatedDistance === "number" && (
                    <p style={{ margin: 0, fontSize: "13px", color: "#007bff", fontWeight: "bold" }}>
                      📍 {tiffin.calculatedDistance.toFixed(1)} km away
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4>{tiffin.MealTypes.join(", ")}</h4>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#28a745" }}>
                    ₹{tiffin.price || 150}
                  </span>
                </div>

                <p style={{ fontSize: "14px", color: "#007bff", fontWeight: "bold" }}>
                  {tiffin.deliveryDate
                    ? new Date(tiffin.deliveryDate).toLocaleDateString("en-GB")
                    : "N/A"}
                </p>

                {tiffin.MenuList.map((menu, index) => (
                  <div key={index} style={{ margin: "10px 0" }}>
                    <p>
                      <strong>{menu.veg ? "🟢 Veg" : "🔴 Non-Veg"}</strong>
                    </p>
                    <p>{menu.MealNames.join(", ")}</p>
                  </div>
                ))}

                <div style={{ background: "#fff3cd", color: "#856404", padding: "8px", borderRadius: "4px", fontSize: "12px", marginBottom: "15px" }}>
                  <p>Order by: {tiffin.orderCutoff || "10:00 AM"}</p>
                  {ordersLeft <= 5 ? (
                    <p><strong>Hurry! Only {ordersLeft} tiffins left.</strong></p>
                  ) : (
                    <p>{ordersLeft} Tiffins remaining.</p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedTiffin(tiffin)}
                  disabled={ordersLeft <= 0}
                  style={{
                    width: "100%",
                    background: ordersLeft <= 0 ? "gray" : "#ff6b6b",
                    padding: "12px",
                    fontSize: "16px",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: ordersLeft <= 0 ? "not-allowed" : "pointer"
                  }}
                >
                  {ordersLeft <= 0 ? "Sold Out" : "Order Tiffin"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {selectedTiffin && (
       
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Flat / House / Apartment No." required style={{ flex: 1, marginBottom: 0 }} />
                <input type="text" placeholder="Nearest Landmark" required style={{ flex: 1, marginBottom: 0 }} />
              </div>
              <textarea placeholder="Delivery Notes (e.g., Leave with security guard)" rows="2" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}></textarea>
              
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Dietary Restrictions / Allergies:</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Jain', 'Nut Allergy', 'Gluten-Free', 'Vegan'].map(tag => (
                  <label key={tag} style={{ fontSize: '13px', background: '#eee', padding: '5px 10px', borderRadius: '15px', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ marginRight: '5px' }} /> {tag}
                  </label>
                ))}
              </div>

          <div
            style={{
              background: "white", padding: "30px", borderRadius: "12px", width: "90%",
              maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", position: "relative",
            }}
          >
            <button
              onClick={() => setSelectedTiffin(null)}
              style={{
                position: "absolute", top: "15px", right: "15px", background: "transparent",
                color: "#333", border: "none", fontSize: "20px", padding: 0, cursor: "pointer"
              }}
            >
              ✖
            </button>

            <h2 style={{ marginTop: 0, borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
              Order Summary
            </h2>

            <div style={{ margin: "20px 0" }}>
              <p style={{ margin: "5px 0" }}>
                <strong>Service:</strong>{" "}
                {selectedTiffin.CustomerId?.businessName || selectedTiffin.CustomerId?.name}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Meal:</strong> {selectedTiffin.MealTypes.join(", ")}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Type:</strong>{" "}
                {selectedTiffin.MenuList[0]?.veg ? "🟢 Veg" : "🔴 Non-Veg"}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Delivery:</strong>{" "}
                {new Date(selectedTiffin.deliveryDate).toLocaleDateString("en-GB")}
              </p>
            </div>

            <div
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#f8f9fa", padding: "15px", borderRadius: "8px", marginBottom: "25px",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>Total Amount</span>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#28a745" }}>
                ₹{selectedTiffin.price}
              </span>
            </div>

            <h4 style={{ marginBottom: "10px" }}>Select Payment Method</h4>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleInstantOrder(selectedTiffin, "Online")}
                style={{ background: "#28a745", flex: 1, color: "white", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}
              >
                Pay Online
              </button>
              <button
                onClick={() => handleInstantOrder(selectedTiffin, "COD")}
                style={{ background: "#17a2b8", flex: 1, color: "white", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}
              >
                Cash on Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}