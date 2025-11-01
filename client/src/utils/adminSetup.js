// Utility function to create admin user
export const createAdminUser = async (adminData) => {
  try {
    const response = await fetch('/api/auth/register-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ? data.error.join(', ') : 'Admin registration failed');
    }

    return {
      success: true,
      data: data.data,
      token: data.token,
      message: data.message
    };
  } catch (error) {
    console.error('Admin registration error:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred'
    };
  }
};

// Function to check if admin user exists
export const checkAdminExists = async () => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@nexstepai.com',
        password: 'dummy' // This will fail but tell us if user exists
      }),
    });

    const data = await response.json();
    
    // If we get a 401 with "Invalid credentials", the user exists
    // If we get a different error, the user might not exist
    return response.status === 401 && data.error && data.error.includes('Invalid credentials');
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return false;
  }
};