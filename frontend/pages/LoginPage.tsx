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
import styles from "./stylesheets/LoginPage.module.css"; // Import the styles

const API_ROOT = 'http://localhost:3000/api'; // local
// const API_ROOT//"http://api.wardrobewizard.com/api"; // prod

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

// Get user location in order to send to backend weather api
const getUserLocation = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) =>
          reject(new Error("Unable to retrieve location: " + error.message))
      );
    }
  });
};
function LoginPage() {
  const [error, setError] = useState(""); // State to store error messages
  const [isLogin, setIsLogin] = useState(true); // State to track the current form

  const loginDefaults = {
    username: "",
    password: "",
  };
  const signUpDefaults = {
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    email: "",
  };

  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : signUpSchema),
    defaultValues: isLogin ? loginDefaults : signUpDefaults,
  });

  async function registerUser() {
    try {
      // Get user's location
      const { latitude, longitude } = await getUserLocation();
      const {first_name, last_name, ...rest} = form.getValues();
      const data = {
        name: {first: first_name, last: last_name},
        ...rest,
        geolocation: { coordinates: [latitude, longitude] },
      };

      const response = await fetch(`${API_ROOT}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.status === 201) {
        console.log("User registered successfully.");
      } else {
        let data = await response.json();
        setError(data.message || "Failed to register user.");
      }

    } catch (error) {
      console.error("Failed to register user: ", error);
      setError("An error occured during registration.");
    }
  }

  async function loginUser() {
    try {
      // Get user's location
      const { latitude, longitude } = await getUserLocation();
      const data = {
        ...form.getValues(),
        geolocation: { coordinates: [latitude, longitude] },
      };

      const response = await fetch(`${API_ROOT}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        console.log("User logged in successfully.");
      } else {
        let data = await response.json();
        setError(data.message || "Failed to login.");
      }
    } catch (error) {
      console.error("Failed to login user: ", error);
      setError("An error occured during login.");

    }
  }

  // Define the submit handler
  async function onSubmit() {
    try {
      if (isLogin) {
        // Login
        await loginUser();
      } else {
        // Register
        await registerUser();
      }
    } catch (error) {
      console.error("Failed to submit data: ", error);
    }
  }

  // Function to toggle between login and registration
  const toggleForm = () => {
    setIsLogin((prev) => !prev); // Toggle the state
    form.reset(isLogin ? signUpDefaults : loginDefaults); // Reset the form with appropriate default values
  };

  useEffect(() => {
    form.reset(isLogin ? loginDefaults : signUpDefaults);
  }, [isLogin]);


  return (
    <div className={styles.backgroundContainer}>
      <div className={styles.outerContainer}>


        {/* Sign Up Form */}
        {!isLogin && (
          <div
            className={`absolute w-full transition-transform duration-500 ${
              isLogin ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <div className={`${styles.formContainer} ${styles.roundedLeft}`}>
              <h2 className="text-xl font-bold mb-6">Sign Up</h2>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={styles.labels}>First Name</FormLabel>
                        <FormControl>
                          <Input
                            className={styles.inputField}
                            placeholder="Enter your First Name"
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
                        <FormLabel className={styles.labels}>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            className={styles.inputField}
                            placeholder="Enter your Last Name"
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
                        <FormLabel className={styles.labels}>
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={styles.inputField}
                            placeholder="Enter your username"
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
                        <FormLabel className={styles.labels}>
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={styles.inputField}
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
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
                        <FormLabel className={styles.labels}>Email</FormLabel>
                        <FormControl>
                          <Input
                            className={styles.inputField}
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Sign Up</Button>
                </form>
              </Form>

              {error && (
                <div className="errorMessage mt-4 text-center">
                  {error}
                </div>
              )}

              <p className="mt-4 text-center">
                Already have an account?{" "}
                <span
                  onClick={() => {
                    toggleForm();
                    setError(""); // Clear the error message
                    }}
                  
                  className="text-blue-500 cursor-pointer hover:underline ml-1"
                >
                  Sign In
                </span>
              </p>
            </div>
          </div>
        )}


        {/* Hide Login */}
        {!isLogin && (
          <div className={`${styles.welcomeContainer}  ${styles.roundedRight}`}>
            <h1 className="text-4xl font-bold mb-6">Welcome to</h1>
            <img
              src="/assets/images/Vector.png"
              alt="App Logo"
              className={`${styles.loginLogo}`}
            />
            <h1>Wardrobe Wizard</h1>
          </div>
        )}

        {/* Hide SignUp */}
        {isLogin && (
          <div className={`${styles.welcomeContainer} ${styles.roundedLeft}`}>
            <h1 className="text-4xl font-bold mb-6">Welcome to </h1>
            <img
              src="/assets/images/Vector.png"
              alt="App Logo"
              className={`${styles.loginLogo}`}
            />
            <h1 className="text-4xl font-bold mb-6">Wardrobe Wizard</h1>
          </div>
        )}
        
        {/* Login Form */}
        {isLogin && 
        (
          <div
            className={`absolute w-full transition-transform duration-500 ${
              isLogin ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className={`${styles.formContainer} ${styles.roundedRight}`}>
              <h2 className="text-xl font-bold mb-6">Login</h2>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={styles.labels}>
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={styles.inputField}
                            placeholder="Enter your username"
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
                        <FormLabel className={styles.labels}>
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={styles.inputField}
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Sign In</Button>
                </form>
              </Form>

              {error && (
                <div className="errorMessage mt-4 text-center">
                  {error}
                </div>
              )}

              <p className="mt-4 text-center">
                Don't have an account?{" "}
                <span
                  onClick={() => {
                  toggleForm();
                  setError(""); // Clear the error message
                  }}
                  className="text-blue-500 cursor-pointer hover:underline ml-1"
                >
                  Sign Up
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
