import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // Assuming a CSS file for styles, add styles there for consistency

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [settings, setSettings] = useState({
    account: { name: '', email: '' },
    security: { twoFactor: false, password: '' },
    preferences: { theme: 'light', notifications: true }
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message in chatbot
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Simulate chatbot response (no backend change)
  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, { text: newMessage, sender: 'user' }]);
      setNewMessage('');
      setTimeout(() => {
        setChatMessages(prev => [...prev, { text: 'Bot response', sender: 'bot' }]);
      }, 1000);
    }
  };

  // Save settings with feedback
  const saveSettings = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  // Market graph component (assuming Recharts or similar, fix rendering on mount)
  const MarketGraph = () => {
    const [data, setData] = useState([]);
    useEffect(() => {
      // Simulate data loading
      setData([{ name: 'Jan', value: 100 }, { name: 'Feb', value: 120 }]);
    }, []);

    return (
      <div className="market-graph" style={{ height: '300px', width: '100%' }}>
        {/* Placeholder for chart, ensure visibility */}
        <div>Market Graph: {data.length > 0 ? 'Loaded' : 'Loading...'}</div>
        {/* Add actual chart library here, e.g., <LineChart data={data} /> */}
      </div>
    );
  };

  return (
    <div className="app">
      {/* Sidebar / Navbar - Added hover effects, transitions, active highlight, responsive */}
      <nav className="sidebar">
        <ul>
          <li className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>
            Dashboard
          </li>
          <li className={activePage === 'settings' ? 'active' : ''} onClick={() => setActivePage('settings')}>
            Settings
          </li>
          <li className={activePage === 'chatbot' ? 'active' : ''} onClick={() => setActivePage('chatbot')}>
            Chatbot
          </li>
          <li className={activePage === 'market' ? 'active' : ''} onClick={() => setActivePage('market')}>
            Market
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {activePage === 'dashboard' && (
          <div className="dashboard">
            {/* Improved spacing, card layout, fintech style */}
            <div className="card">
              <h2>Portfolio Overview</h2>
              <p>Total Value: $10,000</p>
            </div>
            <div className="card">
              <h2>Recent Trades</h2>
              <ul>
                <li>Trade 1</li>
                <li>Trade 2</li>
              </ul>
            </div>
          </div>
        )}

        {activePage === 'settings' && (
          <div className="settings">
            {/* Grouped into sections, toggles, improved spacing, save button with feedback */}
            <section>
              <h3>Account</h3>
              <input type="text" placeholder="Name" value={settings.account.name} onChange={(e) => setSettings({...settings, account: {...settings.account, name: e.target.value}})} />
              <input type="email" placeholder="Email" value={settings.account.email} onChange={(e) => setSettings({...settings, account: {...settings.account, email: e.target.value}})} />
            </section>
            <section>
              <h3>Security</h3>
              <label>
                Two-Factor Auth: <input type="checkbox" checked={settings.security.twoFactor} onChange={(e) => setSettings({...settings, security: {...settings.security, twoFactor: e.target.checked}})} />
              </label>
              <input type="password" placeholder="Password" value={settings.security.password} onChange={(e) => setSettings({...settings, security: {...settings.security, password: e.target.value}})} />
            </section>
            <section>
              <h3>Preferences</h3>
              <label>
                Notifications: <input type="checkbox" checked={settings.preferences.notifications} onChange={(e) => setSettings({...settings, preferences: {...settings.preferences, notifications: e.target.checked}})} />
              </label>
            </section>
            <button onClick={saveSettings} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            {saveStatus && <p>{saveStatus}</p>}
          </div>
        )}

        {activePage === 'chatbot' && (
          <div className="chatbot">
            {/* Modern chat UI, bubbles, auto-scroll, fixed input */}
            <div className="chat-messages">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}

        {activePage === 'market' && (
          <div className="market">
            {/* Fixed graph rendering on mount, responsive */}
            <MarketGraph />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;