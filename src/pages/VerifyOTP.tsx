import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { email, role } = location.state || {};

    useEffect(() => {
        if (!email || !role) {
            toast.error('Session expired. Please start over.');
            navigate('/forgot-password');
        }
    }, [email, role, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.AUTH_VERIFY_OTP, { email, otp, role });
            toast.success(response.data.message || 'OTP verified');
            navigate('/reset-password', { state: { email, otp, role } });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Verification failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_15%)] opacity-20 blur-3xl pointer-events-none" />

            <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl relative z-10 shadow-2xl">
                <CardHeader className="space-y-4 pb-8">
                    <div className="flex justify-center mb-2">
                        <img src="/webfloralogo.png" alt="Webflora" className="h-16 object-contain" />
                    </div>
                    <CardTitle className="text-2xl text-center">Verify OTP</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Enter the 6-digit code sent to <span className="text-primary font-medium">{email}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                disabled={isLoading}
                                className="bg-background/50 border-white/10 text-center text-2xl tracking-[0.5em] font-mono"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full premium-gradient font-bold" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                        <Button
                            variant="ghost"
                            type="button"
                            className="w-full text-xs"
                            onClick={() => navigate('/forgot-password')}
                        >
                            Resend Code
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyOTP;
