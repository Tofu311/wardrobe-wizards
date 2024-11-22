import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

// const API_ROOT = "http://localhost:3000/api"; // local
const API_ROOT = "https://api.wardrobewizard.fashion/api"; // prod

// Define the schema for login form validation
const loginSchema = z.object({
  username: z.string().min(1, { message: "Please enter your username." }),
  password: z.string().min(1, { message: "Please enter your password." }),
});

// Define the schema for registration form validation
const signUpSchema = z.object({
  first_name: z.string().min(1, { message: "Please enter your first name." }),
  last_name: z.string().min(1, { message: "Please enter your last name." }),
  username: z
    .string()
    .min(1, { message: "Please enter a username." })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Username can only contain letters (A-Z) and numbers (0-9).",
    }),
  password: z
    .string()
    .min(1, { message: "Please enter a password." })
    .regex(/(?=.*\d)(?=.*[A-Z]).{8,}/, {
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter and one digit.",
    }),
  email: z
    .string()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Invalid email address." }),
});

// Define the schema for email recovery
const emailRecoverySchema = z.object({
  username: z.string().min(1, { message: "Please enter your username." }),
});

// Define the schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().min(1, { message: "Please enter your email." }).email({
    message: "Invalid email address.",
  }),
});

// Infer types from the schemas
type LoginSchema = z.infer<typeof loginSchema>;
type SignUpSchema = z.infer<typeof signUpSchema>;
type EmailRecoverySchema = z.infer<typeof emailRecoverySchema>;
type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

function LoginPage() {
  const [error, setError] = useState<string>("");
  const [infoMessage, setInfoMessage] = useState<string>(""); // Informational messages
  const [isLogin, setIsLogin] = useState(true);
  const [showEmailRecovery, setShowEmailRecovery] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const navigate = useNavigate();

  // Form defaults
  const loginDefaults: LoginSchema = { username: "", password: "" };
  const signUpDefaults: SignUpSchema = {
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    email: "",
  };

  // Form hooks
  const form = useForm<LoginSchema | SignUpSchema>({
    resolver: zodResolver(isLogin ? loginSchema : signUpSchema),
    defaultValues: isLogin ? loginDefaults : signUpDefaults,
  });

  const emailRecoveryForm = useForm<EmailRecoverySchema>({
    resolver: zodResolver(emailRecoverySchema),
    defaultValues: { username: "" },
  });

  const forgotPasswordForm = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Register user
  async function registerUser() {
    try {
      const formData = form.getValues() as SignUpSchema;
      const { first_name, last_name, ...rest } = formData;

      const data = { name: { first: first_name, last: last_name }, ...rest };

      const response = await fetch(`${API_ROOT}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.status === 201 || response.status === 200) {
        setInfoMessage("Registration successful. Check your email to verify your account.");
        setError("");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to register user.");
      }
    } catch (error) {
      console.error("Failed to register user: ", error);
      setError("An error occurred during registration.");
    }
  }

  // Login user
  async function loginUser() {
    try {
      const data = form.getValues() as LoginSchema;

      const response = await fetch(`${API_ROOT}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.status === 201 || response.status === 200) {
        response.json().then((data) => {
          localStorage.setItem("token", data.token);
        });
        navigate("/closet");
        console.log("User logged in successfully.");
        setError("");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to login.");
      }
    } catch (error) {
      console.error("Failed to login user: ", error);
      setError("An error occurred during login.");
    }
  }

  // Recover email
  async function recoverEmail() {
    try {
      const { username } = emailRecoveryForm.getValues();

      const response = await fetch(`${API_ROOT}/users/recover-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (response.status === 200) {
        const data = await response.json();
        setInfoMessage(`The email associated with this username is: ${data.email}`);
        setError("");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to recover email.");
      }
    } catch (error) {
      console.error("Failed to recover email: ", error);
      setError("An error occurred during email recovery.");
    }
  }

  // Forgot password
  async function forgotPassword() {
    try {
      const { email } = forgotPasswordForm.getValues();

      const response = await fetch(`${API_ROOT}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.status === 200) {
        setInfoMessage("Password recovery email sent. Please check your email.");
        setError("");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to send password recovery email.");
      }
    } catch (error) {
      console.error("Failed to send forgot password request: ", error);
      setError("An error occurred during forgot password.");
    }
  }

  // Handle submit
  async function onSubmit() {
    try {
      if (isLogin) {
        await loginUser();
      } else {
        await registerUser();
      }
    } catch (error) {
      console.error("Failed to submit data: ", error);
    }
  }

  useEffect(() => {
    form.reset(isLogin ? loginDefaults : signUpDefaults);
  }, [isLogin, form]);

  return (
    <div className="min-h-screen w-full bg-[#1a237e] bg-[url('/assets/images/star-background.jpeg')] bg-cover bg-center flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-auto flex">
        {showEmailRecovery ? (
          <div className="w-full bg-[#73628A] p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-3">Recover Email</h2>
            <Form {...emailRecoveryForm}>
              <form onSubmit={emailRecoveryForm.handleSubmit(recoverEmail)} className="space-y-3">
                <FormField
                  control={emailRecoveryForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" className="bg-white text-black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Recover Email
                </Button>
              </form>
            </Form>
            {infoMessage && <div className="mt-4 text-green-500 text-center">{infoMessage}</div>}
            {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
            <Button onClick={() => setShowEmailRecovery(false)} className="mt-4 w-full bg-red-500">
              Back to Login
            </Button>
          </div>
        ) : showForgotPassword ? (
          <div className="w-full bg-[#73628A] p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-3">Forgot Password</h2>
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(forgotPassword)} className="space-y-3">
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" className="bg-white text-black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Reset Password
                </Button>
              </form>
            </Form>
            {infoMessage && <div className="mt-4 text-green-500 text-center">{infoMessage}</div>}
            {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
            <Button onClick={() => setShowForgotPassword(false)} className="mt-4 w-full bg-red-500">
              Back to Login
            </Button>
          </div>
        ) : (
          // Existing Login/Sign-Up Form Here
          <div>/* Your Existing Login/Sign-Up Code */</div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
