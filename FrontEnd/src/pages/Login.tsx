import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { user, login, isLoading } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  // Initialize Vanta.js effect with callback ref
  const setVantaRefCallback = React.useCallback((node: HTMLDivElement | null) => {
    if (node && !vantaEffect.current) {
      // Dynamically import Vanta and Three.js
      Promise.all([
        import('vanta/dist/vanta.net.min'),
        import('three')
      ]).then(([VANTA, THREE]) => {
        if (node && !vantaEffect.current) {
          vantaEffect.current = (VANTA as any).default({
            el: node,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x3b82f6,
            backgroundColor: 0x0f172a,
            points: 10.00,
            maxDistance: 20.00,
            spacing: 15.00,
            showDots: true
          });
        }
      }).catch(err => {
        console.error('Failed to load Vanta:', err);
      });
    }
  }, []);

  // Redirect if already logged in
  if (user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginLoading(true);

    try {
      const result = await login(formData);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      // Check if error has retryAfter property
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String(err.message));
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };



  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={setVantaRefCallback} className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-admin-gradient rounded-2xl shadow-medium mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Admin Portal</h1>
          <p className="text-gray-200 drop-shadow-md">University Management System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-medium border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-destructive/20 bg-destructive/5">
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-admin-gradient hover:opacity-90 shadow-soft"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-200 drop-shadow-md">
            Don't have an account?{' '}
            <a 
              href="/signup" 
              className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;