/**
 * Simple React Test Component
 * للتأكد من أن React يعمل بشكل صحيح
 */
import React from 'react';
import { createRoot } from 'react-dom/client';

console.log("[TEST] React imported successfully");
console.log("[TEST] React version:", React.version);

// Simple test component
function TestComponent() {
  console.log("[TEST] TestComponent rendered");
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>✅ React is working!</h1>
      <p>If you see this message, React loaded successfully.</p>
      <p>React version: {React.version}</p>
    </div>
  );
}

// Try to render
try {
  console.log("[TEST] Getting root element...");
  const rootElement = document.getElementById("root");
  console.log("[TEST] Root element:", rootElement);
  
  if (rootElement) {
    console.log("[TEST] Creating React root...");
    const root = createRoot(rootElement);
    console.log("[TEST] Rendering TestComponent...");
    root.render(<TestComponent />);
    console.log("[TEST] Done!");
  } else {
    console.error("[TEST] Root element not found!");
  }
} catch (error) {
  console.error("[TEST] Error:", error);
}
