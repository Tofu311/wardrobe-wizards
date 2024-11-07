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
import styles from "./stylesheets/LoginPage.module.css";
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

// Infer types from the schemas
type LoginSchema = z.infer<typeof loginSchema>;
type SignUpSchema = z.infer<typeof signUpSchema>;

function LoginPage() {
  const [error, setError] = useState<string>("");
  const [isLogin, setIsLogin] = useState(true);

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

  const form = useForm<LoginSchema | SignUpSchema>({
    resolver: zodResolver(isLogin ? loginSchema : signUpSchema),
    defaultValues: isLogin ? loginDefaults : signUpDefaults,
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
        navigate("/closet");
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
        navigate("/closet");
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

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    form.reset(isLogin ? signUpDefaults : loginDefaults);
  };

  useEffect(() => {
    form.reset(isLogin ? loginDefaults : signUpDefaults);
  }, [isLogin, form]);

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
                        <FormLabel className={styles.labels}>
                          First Name
                        </FormLabel>
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
                        <FormLabel className={styles.labels}>
                          Last Name
                        </FormLabel>
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
                <div className="errorMessage mt-4 text-center">{error}</div>
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
        {isLogin && (
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
                <div className="errorMessage mt-4 text-center">{error}</div>
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
