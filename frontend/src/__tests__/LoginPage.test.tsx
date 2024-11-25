import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

// Mock `fetch` globally
(global.fetch as jest.Mock) = jest.fn();

describe('LoginPage', () => {
  const validUsername = 'Tofu';
  const validPassword = 'Password123!';
  const validEmail = 'tofu@example.com';
  const invalidEmail = 'invalid-email';
  const invalidPassword = 'short';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('logs in successfully when valid credentials are provided', async () => {
    (fetch as jest.Mock).mockImplementationOnce((_, options) => {
      const { username, password } = JSON.parse(options.body as string);

      if (username === validUsername && password === validPassword) {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ token: 'mocked-token' }),
        });
      }

      return Promise.resolve({
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: validUsername },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: validPassword },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mocked-token');
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://api.wardrobewizard.fashion/api/users/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: validUsername, password: validPassword }),
      }
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('signs up successfully when valid inputs are provided', async () => {
    (fetch as jest.Mock).mockImplementationOnce((_, options) => {
      const { username, password, email, name } = JSON.parse(options.body as string);
    
      if (
        username === validUsername &&
        password === validPassword &&
        email === validEmail &&
        name.first === 'TestFirstName' &&
        name.last === 'TestLastName'
      ) {
        return Promise.resolve({
          status: 201,
          json: () => Promise.resolve({ token: 'mocked-token' }),
        });
      }
    
      return Promise.resolve({
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid sign-up data' }),
      });
    });
    

   render(
     <BrowserRouter>
       <LoginPage />
     </BrowserRouter>
   );

   // Switch to sign-up form
   const dontHaveAccountParagraph = screen.getByText(/Don't have an account\?/, {
     selector: 'p',
   });
   const signUpLink = within(dontHaveAccountParagraph).getByText('Sign Up', {
     selector: 'button',
   });
   fireEvent.click(signUpLink);

   // Wait for the sign-up form to be displayed
   await waitFor(() => {
     expect(
       screen.getByPlaceholderText(/Enter your First Name/i)
     ).toBeInTheDocument();
   });

   // Fill in the form fields
   fireEvent.change(screen.getByPlaceholderText(/Enter your First Name/i), {
     target: { value: 'TestFirstName' },
   });
   fireEvent.change(screen.getByPlaceholderText(/Enter your Last Name/i), {
     target: { value: 'TestLastName' },
   });
   fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
     target: { value: validUsername },
   });
   fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
     target: { value: validPassword },
   });
   fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), {
     target: { value: validEmail },
   });

   // Submit the form
   fireEvent.click(
     screen.getByRole('button', { name: (name) => name === 'Sign Up' })
   );

   await waitFor(() => {
     expect(localStorage.getItem('token')).toBe('mocked-token');
   });

   expect(fetch).toHaveBeenCalledWith(
     'https://api.wardrobewizard.fashion/api/users/register',
     {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         name: { first: 'TestFirstName', last: 'TestLastName' },
         username: validUsername,
         password: validPassword,
         email: validEmail,
       }),
     }
   );
   expect(fetch).toHaveBeenCalledTimes(1);
 });

  it('displays an error when sign-up fails due to invalid data', async () => {
  (fetch as jest.Mock).mockImplementationOnce(() => {
    return Promise.resolve({
      status: 400,
      json: () => Promise.resolve({ message: 'Invalid email or password' }),
    });
  });

  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );

  // Switch to sign-up form
  const dontHaveAccountParagraph = screen.getByText(/Don't have an account\?/, {
    selector: 'p',
  });
  const signUpLink = within(dontHaveAccountParagraph).getByText('Sign Up', {
    selector: 'button',
  });
  fireEvent.click(signUpLink);

  // Wait for the sign-up form to be displayed
  await waitFor(() => {
    expect(
      screen.getByPlaceholderText(/Enter your First Name/i)
    ).toBeInTheDocument();
  });

  // Fill in the form fields with invalid data
  fireEvent.change(screen.getByPlaceholderText(/Enter your First Name/i), {
    target: { value: 'TestFirstName' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Enter your Last Name/i), {
    target: { value: 'TestLastName' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
    target: { value: validUsername },
  });
  fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
    target: { value: invalidPassword },
  });
  fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), {
    target: { value: invalidEmail },
  });

  // Submit the form
  fireEvent.click(
    screen.getByRole('button', { name: (name) => name === 'Sign Up' })
  );

  expect(fetch).toHaveBeenCalledTimes(0);
});
});
