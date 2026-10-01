import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [fssai, setFssai] = useState(user?.fssai || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put('/users/profile', { fssai, businessName, isProfileComplete: true, verificationStatus: 'Pending' });
      alert("Profile submitted! Awaiting Admin verification.");
      window.location.reload();
    } catch (error) {
      alert("Failed to submit profile.");
    }
  };

  const handleSubscriptionPayment = () => {
    // Razorpay logic goes here (similar to the order payment flow)
    alert("Triggering Razorpay for ₹1999 Premium Subscription...");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '30px' }}>
      <h2>My Profile</h2>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email} {user.isEmailVerified ? <span style={{color: 'green'}}>✓ Verified</span> : <span style={{color: 'red'}}>❌ Unverified</span>}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      {/* CHEF ONBOARDING TRACKER */}
      {user.role === 'Chef' && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Chef Onboarding Tracker</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '30px 0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '4px', background: '#eee', zIndex: 1 }}></div>
            
            {/* Step 1 */}
            <div style={{ zIndex: 2, background: 'white', padding: '0 10px', textAlign: 'center' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: user.isProfileComplete ? '#28a745' : '#007bff', color: 'white', lineHeight: '30px', margin: '0 auto' }}>1</div>
              <small>Complete Profile</small>
            </div>
            
            {/* Step 2 */}
            <div style={{ zIndex: 2, background: 'white', padding: '0 10px', textAlign: 'center' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: user.verificationStatus === 'Approved' ? '#28a745' : (user.verificationStatus === 'Pending' ? '#ffc107' : '#eee'), color: user.verificationStatus === 'Incomplete' ? 'gray' : 'white', lineHeight: '30px', margin: '0 auto' }}>2</div>
              <small>Admin Verification</small>
            </div>

            {/* Step 3 */}
            <div style={{ zIndex: 2, background: 'white', padding: '0 10px', textAlign: 'center' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: user.isSubscribed ? '#28a745' : '#eee', color: user.isSubscribed ? 'white' : 'gray', lineHeight: '30px', margin: '0 auto' }}>3</div>
              <small>Subscription</small>
            </div>
          </div>

          {/* DYNAMIC CONTENT BASED ON STATUS */}
          {!user.isProfileComplete && (
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h4>Step 1: Required Details</h4>
              <input type="text" placeholder="Tiffin Service Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} required style={{ padding: '10px' }} />
              <input type="text" placeholder="14-Digit FSSAI License Number" value={fssai} onChange={e => setFssai(e.target.value)} minLength="14" maxLength="14" required style={{ padding: '10px' }} />
              <button type="submit" style={{ background: '#007bff', color: 'white', padding: '10px', border: 'none', borderRadius: '6px' }}>Submit Profile for Review</button>
            </form>
          )}

          {user.isProfileComplete && user.verificationStatus === 'Pending' && (
            <div style={{ textAlign: 'center', padding: '20px', background: '#fff3cd', color: '#856404', borderRadius: '6px' }}>
              <h4>⏳ Awaiting Admin Verification</h4>
              <p>We are verifying your FSSAI license and details. This usually takes 24 hours.</p>
            </div>
          )}

          {user.verificationStatus === 'Rejected' && (
            <div style={{ textAlign: 'center', padding: '20px', background: '#f8d7da', color: '#721c24', borderRadius: '6px' }}>
              <h4>❌ Verification Failed</h4>
              <p>Your FSSAI or details were invalid. Please contact support.</p>
            </div>
          )}

          {user.verificationStatus === 'Approved' && !user.isSubscribed && (
            <div style={{ textAlign: 'center', padding: '20px', background: '#d4edda', color: '#155724', borderRadius: '6px' }}>
              <h4>✅ Verified! Action Required</h4>
              <p>Your profile is approved. Purchase a Premium Subscription to start publishing menus.</p>
              <button onClick={handleSubscriptionPayment} style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', fontSize: '16px', marginTop: '10px', cursor: 'pointer' }}>
                Pay ₹1999 / Month
              </button>
            </div>
          )}
          
          {user.isSubscribed && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#28a745' }}>
              <h4>🎉 You are all set!</h4>
              <p>Your workspace is unlocked. Head to the Dashboard to manage your menus.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}