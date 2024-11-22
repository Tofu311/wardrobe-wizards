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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";

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

const emailRecoverySchema = z.object({
  username: z.string().min(1, { message: "Please enter your username." }),
});

const passwordRecoverySchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Invalid email address." }),
});

// Infer types from the schemas
type LoginSchema = z.infer<typeof loginSchema>;
type SignUpSchema = z.infer<typeof signUpSchema>;
type EmailRecoverySchema = z.infer<typeof emailRecoverySchema>;
type PasswordRecoverySchema = z.infer<typeof passwordRecoverySchema>;

function LoginPage() {
  const [error, setError] = useState<string>("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [showEmailRecovery, setShowEmailRecovery] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveredEmail, setRecoveredEmail] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  const loginDefaults: LoginSchema = {
    username: "",
    password: "",
  };

  const signUpDefaults: SignUpSchema = {
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    email: "",
  };

  const emailRecoveryDefaults: EmailRecoverySchema = {
    username: "",
  };

  const passwordRecoveryDefaults: PasswordRecoverySchema = {
    email: "",
  };

  const form = useForm<LoginSchema | SignUpSchema>({
    resolver: zodResolver(isLogin ? loginSchema : signUpSchema),
    defaultValues: isLogin ? loginDefaults : signUpDefaults,
  });

  const emailRecoveryForm = useForm<EmailRecoverySchema>({
    resolver: zodResolver(emailRecoverySchema),
    defaultValues: emailRecoveryDefaults,
  });

  const passwordRecoveryForm = useForm<PasswordRecoverySchema>({
    resolver: zodResolver(passwordRecoverySchema),
    defaultValues: passwordRecoveryDefaults,
  });

  async function registerUser() {
    try {
      const formData = form.getValues() as SignUpSchema;
      const { first_name, last_name, ...rest } = formData;

      const data = {
        name: { first: first_name, last: last_name },
        ...rest,
      };

      const response = await fetch(`${API_ROOT}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 201 || response.status === 200) {
        response.json().then((data) => {
          localStorage.setItem("token", data.token);
        });
        setShowVerificationAlert(true);
        console.log("User registered successfully.");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to register user.");
      }
    } catch (error) {
      console.error("Failed to register user: ", error);
      setError("An error occurred during registration.");
    }
  }

  async function loginUser() {
    try {
      const data = form.getValues() as LoginSchema;

      const response = await fetch(`${API_ROOT}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 201 || response.status === 200) {
        response.json().then((data) => {
          localStorage.setItem("token", data.token);
        });
        setTimeout(() => {
          navigate("/closet");
        }, 500);
        console.log("User logged in successfully.");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to login.");
      }
    } catch (error) {
      console.error("Failed to login user: ", error);
      setError("An error occurred during login.");
    }
  }

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

  async function recoverEmail(data: EmailRecoverySchema) {
    try {
      const response = await fetch(`${API_ROOT}/users/recover-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 200) {
        const responseData = await response.json();
        setRecoveredEmail(responseData.email);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to recover email.");
        setRecoveredEmail(null);
      }
    } catch (error) {
      console.error("Failed to recover email: ", error);
      setError("An error occurred during email recovery.");
      setRecoveredEmail(null);
    }
  }

  async function recoverPassword(data: PasswordRecoverySchema) {
    try {
      const response = await fetch(`${API_ROOT}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 200) {
        setRecoverySuccess(
          "A password reset link has been sent to your email."
        );
        setShowPasswordRecovery(false);
        passwordRecoveryForm.reset();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to initiate password recovery.");
      }
    } catch (error) {
      console.error("Failed to recover password: ", error);
      setError("An error occurred during password recovery.");
    }
  }

  // const toggleForm = () => {
  //   setIsLogin((prev) => !prev);
  //   form.reset(isLogin ? signUpDefaults : loginDefaults);
  // };

  useEffect(() => {
    form.reset(isLogin ? loginDefaults : signUpDefaults);
    setShowPassword(false);
    setError("");
    setRecoverySuccess(null);
  }, [isLogin, form]);

  return (
    <div className="min-h-screen w-full bg-[#1a237e] bg-[url('/assets/images/star-background.jpeg')] bg-cover bg-center flex items-center justify-center p-4 overflow-x-hidden">
      <div className="w-full max-w-4xl flex rounded-lg overflow-hidden">
        {/* Sign Up Form */}
        {!isLogin ? (
          <>
            <div className="w-[50%] bg-[#73628A] p-6 rounded-l-lg">
              <h2 className="text-2xl font-bold text-white mb-3">Sign Up</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your First Name"
                            className="bg-white text-black placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your Last Name"
                            className="bg-white text-black placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your username"
                            className="bg-white text-black placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="bg-white text-black placeholder:text-gray-500 pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {showPassword
                                  ? "Hide password"
                                  : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-white text-black placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-[25%] mt-4">
                    Sign Up
                  </Button>
                </form>
              </Form>
              {error && (
                <div className="mt-4 text-red-500 text-center">{error}</div>
              )}
              <p className="mt-4 text-center text-white">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                  className="text-blue-300 hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
            <div className="w-[50%] bg-[#CBC5EA] p-6 rounded-r-lg flex flex-col items-center justify-center space-y-4">
              <h1 className="text-4xl font-bold text-black">Welcome to</h1>
              <img
                src="/assets/images/Vector.png"
                alt="App Logo"
                className="w-[70%] h-auto"
              />
              <h1 className="text-4xl font-bold text-black">Wardrobe Wizard</h1>
            </div>
          </>
        ) : (
          <>
            {/* Login Form */}
            <div className="w-[50%] bg-[#CBC5EA] p-6 rounded-l-lg flex flex-col items-center justify-center space-y-4">
              <h1 className="text-4xl font-bold text-black">Welcome to</h1>
              <img
                src="/assets/images/Vector.png"
                alt="App Logo"
                className="w-[70%] h-auto"
              />
              <h1 className="text-4xl font-bold text-black">Wardrobe Wizard</h1>
            </div>
            <div className="w-[50%] bg-[#73628A] p-6 min-h-[500px] rounded-r-lg">
              <h2 className="text-2xl font-bold text-white mb-6">Login</h2>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your username"
                            className="bg-white text-black placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="bg-white text-black placeholder:text-gray-500 pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {showPassword
                                  ? "Hide password"
                                  : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </form>
              </Form>
              {error && (
                <div className="mt-4 text-red-500 text-center">{error}</div>
              )}
              {recoverySuccess && (
                <div className="mt-4 text-green-500 text-center">
                  {recoverySuccess}
                </div>
              )}
              <p className="mt-4 text-center text-white">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                  className="text-blue-300 hover:underline"
                >
                  Sign Up
                </button>
              </p>
              <div className="mt-4 text-center space-x-4">
                <button
                  onClick={() => setShowEmailRecovery(true)}
                  className="text-blue-300 hover:underline"
                >
                  Forgot Email
                </button>
                <button
                  onClick={() => setShowPasswordRecovery(true)}
                  className="text-blue-300 hover:underline"
                >
                  Forgot Password
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Email Verification Alert Dialog */}
      <AlertDialog
        open={showVerificationAlert}
        onOpenChange={setShowVerificationAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verification Email Sent</AlertDialogTitle>
            <AlertDialogDescription>
              A verification email has been sent to your email address. Please
              check your inbox and follow the instructions to verify your
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowVerificationAlert(false);
                setIsLogin(true);
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Recovery Dialog */}
      <AlertDialog open={showEmailRecovery} onOpenChange={setShowEmailRecovery}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-between">
              <AlertDialogTitle>Recover Email</AlertDialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setShowEmailRecovery(false);
                  setRecoveredEmail(null);
                  setError("");
                  emailRecoveryForm.reset();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDialogHeader>
          <Form {...emailRecoveryForm}>
            <form
              onSubmit={emailRecoveryForm.handleSubmit(recoverEmail)}
              className="space-y-3"
            >
              <FormField
                control={emailRecoveryForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {recoveredEmail ? (
                <div className="mt-4 text-center">
                  <p className="font-semibold">Your email address is:</p>
                  <p className="text-blue-600">{recoveredEmail}</p>
                </div>
              ) : (
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setShowEmailRecovery(false);
                      setError("");
                      emailRecoveryForm.reset();
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction type="submit">
                    Recover Email
                  </AlertDialogAction>
                </AlertDialogFooter>
              )}
            </form>
          </Form>
          {error && (
            <div className="mt-4 text-red-500 text-center">{error}</div>
          )}
          {recoveredEmail && (
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setShowEmailRecovery(false);
                  setRecoveredEmail(null);
                  setError("");
                  emailRecoveryForm.reset();
                }}
              >
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Recovery Dialog */}
      <AlertDialog
        open={showPasswordRecovery}
        onOpenChange={setShowPasswordRecovery}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-between">
              <AlertDialogTitle>Recover Password</AlertDialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowPasswordRecovery(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDialogHeader>
          <Form {...passwordRecoveryForm}>
            <form
              onSubmit={passwordRecoveryForm.handleSubmit(recoverPassword)}
              className="space-y-3"
            >
              <FormField
                control={passwordRecoveryForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit">
                  Recover Password
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default LoginPage;
