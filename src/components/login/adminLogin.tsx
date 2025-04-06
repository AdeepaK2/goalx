import React, { useState, FormEvent } from 'react';

interface AdminLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string): boolean => {
    const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const valid = regex.test(email);
    setEmailError(valid ? '' : 'Please enter a valid email address');
    return valid;
  };

  const validatePassword = (password: string): boolean => {
    const valid = password.length >= 6;
    setPasswordError(valid ? '' : 'Password must be at least 6 characters');
    return valid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (isEmailValid && isPasswordValid) {
      await onLogin(email, password);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Admin Login</h1>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateEmail(email)}
              placeholder="Enter your email"
              style={styles.input}
            />
            {emailError && <p style={styles.error}>{emailError}</p>}
          </div>
          
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validatePassword(password)}
              placeholder="Enter your password"
              style={styles.input}
            />
            {passwordError && <p style={styles.error}>{passwordError}</p>}
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: {[key: string]: React.CSSProperties} = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#1e0fbf',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    boxSizing: 'border-box' as 'border-box',
    transition: 'border-color 0.2s ease',
    outline: 'none',
  },
  error: {
    color: '#ff3333',
    fontSize: '12px',
    marginTop: '5px',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#1e0fbf',
    background: 'linear-gradient(45deg, #1e0fbf, #6e11b0)',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.2s',
  },
};

export default AdminLogin;