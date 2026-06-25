"use client";

import Navbar from "@/app/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Link from "next/link";
import { User, Building2 } from "lucide-react";

const Signup = () => {
  const router = useRouter();

  const [role, setRole] = useState<"volunteer" | "ngo" | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Volunteer
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  // NGO Fields
  const [organizationName, setOrganizationName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [officeLocation, setOfficeLocation] = useState("");

  // Files
  const [registrationFile, setRegistrationFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [letterhead, setLetterhead] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      (role === "volunteer" && !location) ||
      (role === "ngo" &&
        (!organizationName || !registrationNumber || !panNumber || !officeLocation || !registrationFile || !panFile))
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/, "");

    if (role === "volunteer" && !registrationFile && !panFile && !letterhead) {
      // Send JSON for volunteer
      fetch(`${apiUrl}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role,
          location,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.text().then(text => {
              throw new Error(text || `HTTP ${res.status}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          setLoading(false);
          if (data.access_token || data.token) {
            const token = data.access_token || data.token;
            const user = data.user;
            
            // Set in localStorage
            localStorage.setItem("authToken", token);
            localStorage.setItem("user", JSON.stringify(user));
            
            // IMPORTANT: Also set in cookies so middleware can see it
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7); // 7 days
            document.cookie = `authToken=${encodeURIComponent(token)}; path=/; expires=${expiryDate.toUTCString()}`;
            document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; expires=${expiryDate.toUTCString()}`;
            
            router.replace("/dashboard/volunteer");
          } else {
            setError(data.message || "Registration failed");
          }
        })
        .catch((err) => {
          setLoading(false);
          setError("Network error: " + err.message);
        });
    } else {
      // Send FormData for NGO or if files are present
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone", phone);
      if (role) {
        formData.append("role", role);
      }
      if (role === "volunteer") {
        formData.append("location", location);
      } else if (role === "ngo") {
        formData.append("organizationName", organizationName);
        formData.append("registrationNumber", registrationNumber);
        formData.append("panNumber", panNumber);
        formData.append("officeLocation", officeLocation);
        if (registrationFile) {
          formData.append("registrationFile", registrationFile);
        }
        if (panFile) {
          formData.append("panFile", panFile);
        }
        if (letterhead) {
          formData.append("letterhead", letterhead);
        }
      }
      fetch(`${apiUrl}/api/register`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
        },
        body: formData,
      })
        .then((res) => {
          if (!res.ok) {
            return res.text().then(text => {
              throw new Error(text || `HTTP ${res.status}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          setLoading(false);
          if (data.access_token || data.token) {
            const token = data.access_token || data.token;
            const user = data.user;
            
            // Set in localStorage
            localStorage.setItem("authToken", token);
            localStorage.setItem("user", JSON.stringify(user));
            
            // IMPORTANT: Set cookies for middleware
            document.cookie = `token=${token}; path=/`;
            document.cookie = `role=${user.role}; path=/`;
            
            // Notify AuthProvider of auth change immediately
            window.dispatchEvent(new CustomEvent("auth-updated"));
            
            const redirectPath = role === "volunteer" ? "/dashboard/volunteer" : "/dashboard/ngo";
            
            setTimeout(() => {
              router.replace(redirectPath);
            }, 100);
          } else {
            setError(data.message || "Registration failed");
          }
        })
        .catch((err) => {
          setLoading(false);
          setError("Network error: " + err.message);
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F1F3]">
      <Navbar />

      <div className="container mx-auto flex items-center justify-center px-3 py-8 sm:px-4 sm:py-16 lg:py-20">
        <Card className="w-full max-w-md rounded-xl border border-[#CACDD3] bg-white shadow-xl">
          
          {/* Header */}
          <CardHeader className="space-y-3 px-4 pt-6 text-center sm:px-6">
            <div className="flex justify-center">
              <img
                src="/logo1.png"
                alt="Sahayogi Logo"
                className="h-20 w-20 object-contain"
              />
            </div>

            <CardTitle className="text-2xl font-bold text-[#111827]">
              Create Account
            </CardTitle>

            <p className="text-sm text-[#6B7280]">
              Join Sahayogi and start making an impact
            </p>
          </CardHeader>

          {/* Body */}
          <CardContent className="px-4 pb-6 sm:px-6">
            <p className="mb-6 text-center text-sm font-medium text-[#111827]">
              I want to join as:
            </p>

            <div className="flex flex-col gap-5">
              
              {/* Volunteer */}
              <Link
                href="/signup/volunteer-register"
                className="block"
              >
                <div className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-[#CACDD3] p-5 transition-all duration-200 hover:border-[#4F46C8] hover:bg-[#4F46C8]/10">
                  <User size={24} className="text-[#4F46C8]" />

                  <div>
                    <h3 className="font-semibold text-[#111827]">
                      Volunteer
                    </h3>

                    <p className="text-sm text-gray-500">
                      Find opportunities and make a difference
                    </p>
                  </div>
                </div>
              </Link>

              {/* Divider */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-300" />

                <span className="mx-4 text-xs font-semibold uppercase text-gray-400">
                  OR
                </span>

                <div className="flex-1 border-t border-gray-300" />
              </div>

              {/* NGO */}
              <Link
                href="/signup/ngo-register"
                className="block"
              >
                <div className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-[#CACDD3] p-5 transition-all duration-200 hover:border-[#7683D6] hover:bg-[#7683D6]/10">
                  <Building2 size={24} className="text-[#7683D6]" />

                  <div>
                    <h3 className="font-semibold text-[#111827]">
                      Organization (NGO)
                    </h3>

                    <p className="text-sm text-gray-500">
                      Post opportunities and find volunteers
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Login */}
            <div className="mt-8 border-t pt-4">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;