import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

// const API_ROOT = "http://localhost:3000/api"; // local
const API_ROOT = "https://api.wardrobewizard.fashion/api"; // prod

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Please enter your first name." }),
  lastName: z.string().min(1, { message: "Please enter your last name." }),
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
    })
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Invalid email address." }),
});

export default function MyAccount() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_ROOT}/users/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const userData = await response.json();
      setUserInfo({
        firstName: userData.name.first,
        lastName: userData.name.last,
        username: userData.username,
        email: userData.email,
      });
      form.reset({
        firstName: userData.name.first,
        lastName: userData.name.last,
        username: userData.username,
        email: userData.email,
        password: "",
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: userInfo?.firstName || "",
      lastName: userInfo?.lastName || "",
      username: userInfo?.username || "",
      email: userInfo?.email || "",
      password: "", // Default to empty for optional password
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Only include password in the request if it's not empty
      const updateData = {
        ...values,
        password: values.password || undefined,
      };

      const response = await fetch(`${API_ROOT}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();

      setUserInfo({
        firstName: updatedUser.user.name.first,
        lastName: updatedUser.user.name.last,
        username: updatedUser.user.username,
        email: updatedUser.user.email,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUserProfile();
  }, [form, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-[url('/assets/images/star-background.jpeg')] bg-cover bg-center">
      {/* Navbar */}
      <nav className="shadow-md w-full bg-[#313D5A] p-2 flex justify-between items-center fixed top-0 left-0 z-50 border-b-2 border-[#183642]">
        <h1 className="text-[#CBC5EA] text-2xl font-bold ml-4">
          Wardrobe Wizard
        </h1>
        <div className="flex space-x-4">
          <Button
            onClick={() => {
              navigate("/outfits");
            }}
          >
            Generate Outfit
          </Button>
          <Button
            onClick={() => {
              navigate("/closet");
            }}
          >
            My Closet
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
          >
            Logout
          </Button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-20">
        <Card className="shadow-md text-[#CBC5EA] w-full max-w-2xl bg-[#313D5A] border border-[#183642]">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription className="text-white">
              View or update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">First Name</h3>
                  <p className="border border-[#183642] text-sm text-white rounded-lg shadow-md p-2 w-1/2 bg-[#CBC5EA] bg-opacity-20">{userInfo.firstName}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Last Name</h3>
                  <p className="border border-[#183642] text-sm text-white rounded-lg shadow-md p-2 w-1/2 bg-[#CBC5EA] bg-opacity-20">{userInfo.lastName}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Username</h3>
                  <p className="border border-[#183642] text-sm text-white rounded-lg shadow-md p-2 w-1/2 bg-[#CBC5EA] bg-opacity-20">{userInfo.username}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Email</h3>
                  <p className="border border-[#183642] text-sm text-white rounded-lg shadow-md p-2 w-1/2 bg-[#CBC5EA] bg-opacity-20">{userInfo.email}</p>
                </div>
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
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
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            type="email"
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
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter new password"
                              type={showPassword ? "text" : "password"}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                        <FormDescription>
                          Leave blank if you don't want to change your password
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex space-x-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Profile"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
