import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, LogIn } from 'lucide-react';
import cccLogo from '../assets/ccc-logo.png';
import cctvLogo from '../assets/CCTVUnit_logo.png'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [isLoaded, setIsLoaded] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const user = await login(formData.username, formData.password);
        toast.success(`Welcome back, ${user.name}`);
        navigate('/cctvsystem/');
      } else {
        const user = await register(formData.name, formData.username, formData.password);
        if (user.status === 'pending') {
          toast.info('Registration successful. Your account is pending admin approval.', { autoClose: 5000 });
          sessionStorage.removeItem('cctv_token');
          setIsLogin(true);
        } else {
          toast.success('Registration successful. Welcome!');
          navigate('/cctvsystem/');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="login-wrapper">
      <div className={`login-container ${isLoaded ? 'loaded' : ''}`}>

        {/* Left Side - Branding/Info */}
        <div className="login-visual">
          <div className="visual-content">
            <div className="visual-logo-stack">
              <img src={cccLogo} alt="CCC" className="floating-logo" />
            </div>
            <h1>CDRRMO</h1>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '2px',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginTop: '-8px'
            }}>CCC-CCTV</h2>
            <p>Intelligence, Surveillance, and Response Integration System</p>
            <div className="visual-features">
              <div className="v-feature">
                <ShieldCheck size={18} />
                <span>Secure Multi-Agency Coordination</span>
              </div>
              <div className="v-feature">
                <LogIn size={18} />
                <span>Real-time Incident Monitoring</span>
              </div>
            </div>
          </div>
          <div className="visual-overlay"></div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-area">
          <div className="form-card">
            <div className="form-header">
              <img src={cctvLogo} alt="CCTV Unit Logo" className="form-logo" />
              <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{isLogin ? 'Enter your credentials to access the system' : 'Register for access to the monitoring platform'}</p>
            </div>

            <form onSubmit={handleSubmit} className="premium-form">
              {!isLogin && (
                <div className="input-group">
                  <UserIcon className="input-icon" size={20} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="premium-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="input-group">
                <UserIcon className="input-icon" size={20} />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="premium-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="premium-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="login-submit-btn">
                <span>{isLogin ? 'Sign In' : 'Register Now'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="form-footer">
              <button onClick={() => setIsLogin(!isLogin)} className="toggle-auth-btn">
                {isLogin ? (
                  <>Don't have an account? <span>Request Access</span></>
                ) : (
                  <>Already have an account? <span>Sign In</span></>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #060410;
          padding: 20px;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .login-wrapper::before {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          top: -200px;
          right: -200px;
          z-index: 0;
        }

        .login-container {
          width: 100%;
          max-width: 1000px;
          height: 640px;
          background: rgba(26, 21, 48, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          display: flex;
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px) scale(0.98);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          z-index: 1;
        }

        .login-container.loaded {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .login-visual {
          flex: 1.1;
          position: relative;
          background: #13102a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          overflow: hidden;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .visual-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
          z-index: 1;
        }

        .visual-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 400px;
        }

        .visual-logo-stack {
          margin-bottom: 30px;
          display: flex;
          justify-content: center;
        }

        .floating-logo {
          height: 120px;
          filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.4));
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .visual-content h1 {
          font-size: 42px;
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #fff 0%, #a78bcc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .visual-content p {
          color: #a78bcc;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 40px;
          font-weight: 300;
        }

        .visual-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }

        .v-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f0e6ff;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.03);
          padding: 10px 20px;
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          width: fit-content;
        }

        .v-feature svg {
          color: #8b5cf6;
        }

        .login-form-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: rgba(13, 10, 26, 0.2);
        }

        .form-card {
          width: 100%;
          max-width: 360px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 35px;
        }

        .form-logo {
          height: 70px;
          margin-bottom: 20px;
          filter: drop-shadow(0 0 15px rgba(255, 120, 0, 0.7)) drop-shadow(0 0 5px rgba(255, 200, 0, 0.5));
          animation: eyeGlow 3s ease-in-out infinite alternate;
        }

        @keyframes eyeGlow {
          0% {
            filter: drop-shadow(0 0 12px rgba(255, 110, 0, 0.5)) drop-shadow(0 0 4px rgba(255, 200, 0, 0.3));
          }
          100% {
            filter: drop-shadow(0 0 25px rgba(255, 110, 0, 0.9)) drop-shadow(0 0 12px rgba(255, 200, 0, 0.6)) brightness(1.2);
          }
        }

        .form-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .form-header p {
          color: #6b5b8a;
          font-size: 14px;
        }

        .premium-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .input-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #4c3d70;
          transition: color 0.3s;
        }

        .premium-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          background: #0f0c1e;
          border: 1px solid #2a2045;
          border-radius: 14px;
          color: #fff;
          font-size: 15px;
          transition: all 0.3s;
          outline: none;
        }

        .premium-input:focus {
          border-color: #8b5cf6;
          background: #151030;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .premium-input:focus + .input-icon {
          color: #8b5cf6;
        }

        .login-submit-btn {
          margin-top: 10px;
          height: 52px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 20px -5px rgba(139, 92, 246, 0.4);
        }

        .login-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -5px rgba(139, 92, 246, 0.5);
          filter: brightness(1.1);
        }

        .login-submit-btn:active {
          transform: translateY(1px);
        }

        .form-footer {
          margin-top: 25px;
          text-align: center;
        }

        .toggle-auth-btn {
          background: none;
          border: none;
          color: #6b5b8a;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.3s;
        }

        .toggle-auth-btn span {
          color: #8b5cf6;
          font-weight: 600;
        }

        .toggle-auth-btn:hover {
          color: #a78bcc;
        }

        @media (max-width: 900px) {
          .login-visual {
            display: none;
          }
          .login-container {
            max-width: 500px;
            height: auto;
            padding: 20px 0;
          }
        }
      `}</style>
    </div>
  );
}
