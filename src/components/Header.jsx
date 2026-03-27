// Header Component
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Header({ showNav = true }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <header className="header">
            <Link to="/" className="header-logo">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#FAF7F2" stroke="#5D6E4E" strokeWidth="2" />
                    <circle cx="20" cy="20" r="4" fill="#D4A574" />
                    <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" />
                    <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" transform="rotate(60 20 20)" />
                    <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" transform="rotate(120 20 20)" />
                    <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" transform="rotate(180 20 20)" />
                    <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" transform="rotate(240 20 20)" />
                    <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" transform="rotate(300 20 20)" />
                </svg>
                AYURWELL
            </Link>

            {showNav && (
                <nav className="header-nav">
                    {user ? (
                        <>
                            <Link to="/predict">Predict</Link>
                            <Link to="/chatbot">Chatbot</Link>
                            <Link to="/herbal-remedies">Herbal Remedies</Link>
                            <Link to="/medical-analyzer">Report Analyzer</Link>
                            <Link to="/user-dashboard">Dashboard</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/about">About</Link>
                            <Link to="/login">Login</Link>
                        </>
                    )}
                </nav>
            )}

            {user && (
                <div className="header-user">
                    <Link to="/profile" className="header-avatar" title="Profile">
                        {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </Link>
                    <button className="btn btn-ghost" onClick={handleSignOut}>
                        Sign Out
                    </button>
                </div>
            )}

            <button
                className="mobile-menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
            </button>
        </header>
    );
}

export default Header;
