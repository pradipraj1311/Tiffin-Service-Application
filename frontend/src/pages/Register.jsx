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
      <form
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
      </form>
    </div>
  );
}
