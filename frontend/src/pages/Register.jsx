import { useState } from "react";
import { registerUser } from "../services/authService";

export default function Register() {
  const [formData, setFormData] = useState({
    role: "Customer",
    name: "",
    email: "",
    password: "",
    PhoneNumber: "",
    address: { Street: "", City: "" },
    businessName: '', 
    lat: null, 
    lng: null,
     deliveryRadius: ''
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "Street" || name === "City") {
      setFormData({
        ...formData,
        address: { ...formData.address, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser(formData);
      console.log("Registration successful:", data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <select name="role" onChange={handleChange}>
          <option value="Customer">Customer</option>
          <option value="Chef">Chef</option>
        </select>
        
        {/* New Chef specific fields */}
        {formData.role === 'Chef' && (
          <>
            <input type="text" name="businessName" placeholder="Tiffin Service Name (e.g. Umesh Tiffins)" onChange={handleChange} required />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" name="deliveryRadius" placeholder="Max Delivery Radius (km)" onChange={handleChange} required />
              <button 
                type="button" 
                style={{ background: '#007bff' }}
                onClick={() => {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setFormData({...formData, lat: pos.coords.latitude, lng: pos.coords.longitude});
                      alert("Location captured successfully!");
                    },
                    (err) => alert("Failed to get location. Please allow location permissions.")
                  );
                }}
              >
                📍 Get My GPS Location
              </button>
            </div>
            {formData.lat && <small style={{color: 'green'}}>Location Saved: {formData.lat.toFixed(2)}, {formData.lng.toFixed(2)}</small>}
          </>
        )}

        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="number" name="PhoneNumber" placeholder="Phone Number" onChange={handleChange} required />
        <input type="text" name="Street" placeholder="Street Address" onChange={handleChange} required />
        <input type="text" name="City" placeholder="City" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      {/* <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "300px",
          gap: "10px",
        }}
      >
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="Customer">Customer</option>
          <option value="Chef">Chef</option>
        </select>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="PhoneNumber"
          placeholder="Phone Number"
          value={formData.PhoneNumber}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="Street"
          placeholder="Street"
          value={formData.address.Street}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="City"
          placeholder="City"
          value={formData.address.City}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form> */}


    </div>
  );
}
