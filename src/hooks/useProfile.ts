import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { employeeApi } from '@/services/api/employees';
import { internApi } from '@/services/api/additional';

export const useProfile = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user) throw new Error('Not authenticated');

            if (user.role === 'employee') {
                return employeeApi.getProfile();
            } else if (user.role === 'intern') {
                return internApi.getProfile();
            }

            throw new Error('Profile access not supported for this role');
        },
        enabled: !!user && (user.role === 'employee' || user.role === 'intern'),
    });
};
