import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Lock, Skull } from 'lucide-react';
import { API_BASE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { NexusThemeProvider } from '../../context/NexusThemeContext';

const StealthContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: ${props => props.theme.typography.fontFamily};
`;

const TerminalBox = styled.div`
  width: 400px;
  padding: 2rem;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  position: relative;
  
  &::before {
    content: "RESTRICTED AREA // CLASS 4 CLEARANCE";
    position: absolute;
    top: -10px;
    left: 20px;
    background: ${props => props.theme.colors.surface};
    padding: 0 10px;
    color: ${props => props.theme.colors.muted};
    font-size: 0.8rem;
  }
`;

const Input = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.accent};
  font-family: inherit;
  font-size: 1.2rem;
  padding: 10px 0;
  outline: none;
  margin-top: 20px;

  &::placeholder {
    color: ${props => props.theme.colors.muted};
  }
`;

const StatusText = styled.div`
  margin-top: 20px;
  font-size: 0.9rem;
  color: ${props => props.$error ? props.theme.colors.danger : props.theme.colors.muted};
  height: 20px;
`;

const Gatekeeper = () => {
    const { syncUser } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('Awaiting credentials...');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setStatus('Authenticating...');
        setIsError(false);

        try {
            const response = await fetch(`${API_BASE}/admin/auth_nexus.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                // Store in bh_auth format so api.js picks it up automatically
                localStorage.setItem('bh_auth', JSON.stringify({
                    token: data.token,
                    role: data.role,
                    username: username
                }));

                syncUser(); // Update AuthContext state immediately

                setStatus('Access Granted. Welcome, Commander.');
                setTimeout(() => navigate('/nexus/watchtower'), 1000);
            } else {
                throw new Error('Access Denied');
            }
        } catch (err) {
            setStatus('ACCESS DENIED. INCIDENT LOGGED.');
            setIsError(true);
            setPassword('');
        }
    };

    return (
        <StealthContainer>
            <TerminalBox>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <Lock size={24} color="#333" />
                    <Skull size={24} color="#111" />
                </div>

                <form onSubmit={handleLogin}>
                    <Input
                        type="text"
                        placeholder="CODENAME"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ marginBottom: '10px' }}
                    />
                    <Input
                        type="password"
                        placeholder="PASSPHRASE"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" style={{ display: 'none' }} />
                </form>

                <StatusText $error={isError}>
                    {'>'} {status}
                </StatusText>
            </TerminalBox>
        </StealthContainer>
    );
};

const GatekeeperPage = () => (
    <NexusThemeProvider>
        <Gatekeeper />
    </NexusThemeProvider>
);

export default GatekeeperPage;
