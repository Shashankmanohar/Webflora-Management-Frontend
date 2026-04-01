import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import { LoginResponse } from '@/types/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosInstance.post<LoginResponse>(
                API_ENDPOINTS.AUTH_LOGIN,
                { email, password }
            );
            
            const { token, user: userData, admin, employee, intern } = response.data;
            const finalUser = userData || admin || employee || intern;

            if (token && finalUser) {
                login(token, finalUser);
                toast.success('Login successful!');
                navigate('/');
            } else {
                toast.error('Invalid response from server');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.response?.data || 'Login failed. Please try again.';
            toast.error(typeof errorMessage === 'string' ? errorMessage : 'Login failed');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient background effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_15%)] opacity-20 blur-3xl pointer-events-none" />

            <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl relative z-10 shadow-2xl">
                <CardHeader className="space-y-4 pb-8">
                    <div className="flex justify-center mb-2">
                        <img src="/webfloralogo.png" alt="Webflora" className="h-16 object-contain" />
                    </div>
                    <CardDescription className="text-center text-muted-foreground">
                        Sign in to your Webflora account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your.name@webflora.tech"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="bg-background/50 border-white/10"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="bg-background/50 border-white/10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors h-5 w-5 flex items-center justify-center"
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <Button type="submit" className="w-full premium-gradient font-bold" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In Now'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
