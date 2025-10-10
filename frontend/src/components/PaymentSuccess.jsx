// src/components/PaymentSuccess.jsx
import React, { useEffect } from "react";

export default function PaymentSuccess({ onRedirect }) {
  useEffect(() => {
    // Automatically redirect after 5 seconds
    const timer = setTimeout(() => {
      onRedirect();
    }, 5000);

    // Cleanup timer if component unmounts early
    return () => clearTimeout(timer);
  }, [onRedirect]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>✅ Payment Successful!</h2>
      <p>You will be redirected shortly...</p>
      <p>If not, <button onClick={onRedirect}>Click here</button></p>
    </div>
  );
}
