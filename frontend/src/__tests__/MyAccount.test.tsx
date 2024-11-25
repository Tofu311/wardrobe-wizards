import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyAccount from '../pages/MyAccount';

// Create a mock for the toast function
const toastMock = jest.fn();

// Adjust the mock implementation of useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

// Define a mock for API_ROOT
const API_ROOT = 'https://api.wardrobewizard.fashion/api';

// Mock fetch globally
(global.fetch as jest.Mock) = jest.fn();

describe('MyAccount Component', () => {
  const mockUserProfile = {
    name: { first: 'John', last: 'Doe' },
    username: 'johndoe',
    email: 'johndoe@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockReset();
    localStorage.setItem('token', 'mock-token');
  });

  afterEach(() => {
    localStorage.removeItem('token');
  });

  it('fetches and displays user profile data', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockUserProfile),
    });

    render(
      <BrowserRouter>
        <MyAccount />
      </BrowserRouter>
    );

    // Wait for the user profile data to load
    await waitFor(() => {
      expect(screen.getByText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText(/Username/i)).toBeInTheDocument();
      expect(screen.getByText('johndoe')).toBeInTheDocument();
      expect(screen.getByText(/Email/i)).toBeInTheDocument();
      expect(screen.getByText('johndoe@example.com')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(`${API_ROOT}/users/profile`, {
      headers: { Authorization: `Bearer mock-token` },
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('allows editing and updating profile information', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserProfile),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          user: {
            name: { first: 'Jane', last: 'Smith' },
            username: 'janesmith',
            email: 'janesmith@example.com',
          },
        }),
      });

    render(
      <BrowserRouter>
        <MyAccount />
      </BrowserRouter>
    );

    // Wait for profile data to load
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

    // Update form fields
    fireEvent.change(screen.getByPlaceholderText(/Enter your first name/i), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your last name/i), {
      target: { value: 'Smith' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: 'janesmith' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), {
      target: { value: 'janesmith@example.com' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    // Wait for the update to complete
    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('Smith')).toBeInTheDocument();
      expect(screen.getByText('janesmith')).toBeInTheDocument();
      expect(screen.getByText('janesmith@example.com')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(`${API_ROOT}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer mock-token`,
      },
      body: JSON.stringify({
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'janesmith@example.com',
        password: undefined,
      }),
    });
    expect(fetch).toHaveBeenCalledTimes(2); // One for fetch and one for update
  });

  it('displays an error when profile update fails', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserProfile),
      })
      .mockRejectedValueOnce(new Error('Failed to update profile'));

    render(
      <BrowserRouter>
        <MyAccount />
      </BrowserRouter>
    );

    // Wait for profile data to load
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

    // Update form fields
    fireEvent.change(screen.getByPlaceholderText(/Enter your first name/i), {
      target: { value: 'Jane' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    // Wait for the error toast to be called
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('handles fetching user profile error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch user profile'));

    render(
      <BrowserRouter>
        <MyAccount />
      </BrowserRouter>
    );

    // Wait for the error toast to be called
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to fetch user profile. Please try again.',
        variant: 'destructive',
      });
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
