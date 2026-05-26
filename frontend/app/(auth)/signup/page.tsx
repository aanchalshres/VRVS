"use client";

import Navbar from "@/app/components/Navbar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";
import { User, Building2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

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

      <div className="container mx-auto flex items-center justify-center py-8 sm:py-16 lg:py-20 px-3 sm:px-4">
        <Card className="w-full max-w-md shadow-xl border border-[#CACDD3] rounded-xl bg-white">
          
          {/* HEADER */}
          <CardHeader className="text-center space-y-3 px-4 sm:px-6 pt-6">
            <div className="flex justify-center">
              <img src="/logo1.png" alt="Logo" className="h-20 w-20 object-contain" />
            </div>

            <CardTitle className="text-2xl font-bold text-[#111827]">
              Create Account
            </CardTitle>

            <p className="text-sm text-[#6B7280]">
              Join Sahayogi and start making an impact
            </p>
          </CardHeader>

          {/* BODY */}
          <CardContent className="space-y-4 px-4 sm:px-6 pb-6">

            {/* ROLE SELECT */}
            {!role ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-center text-[#111827]">
                  I want to join as:
                </p>

                <button
                  onClick={() => setRole("volunteer")}
                  className="flex w-full items-center gap-4 rounded-xl border-2 border-[#CACDD3] p-4 hover:border-[#4F46C8] hover:bg-[#4F46C8]/10"
                >
                  <User className="text-[#4F46C8]" />
                  <div>
                    <p className="font-semibold">Volunteer</p>
                    <p className="text-sm text-gray-500">
                      Find opportunities and make a difference
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setRole("ngo")}
                  className="flex w-full items-center gap-4 rounded-xl border-2 border-[#CACDD3] p-4 hover:border-[#7683D6] hover:bg-[#7683D6]/10"
                >
                  <Building2 className="text-[#7683D6]" />
                  <div>
                    <p className="font-semibold">Organization (NGO)</p>
                    <p className="text-sm text-gray-500">
                      Post opportunities and find volunteers
                    </p>
                  </div>
                </button>
              </div>
            ) : (

              /* FORM */
              <form onSubmit={handleSubmit} className="space-y-4">

                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="text-sm text-[#4F46C8] hover:underline"
                >
                  ← Change role
                </button>

                {/* NAME */}
                <div>
                  <Label>{role === "ngo" ? "Contact Person Name" : "Full Name"}</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* PHONE (FOR BOTH) */}
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* NGO FIELDS */}
                {role === "ngo" && (
                  <>
                    <div>
                      <Label>Organization Name</Label>
                      <Input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required />
                    </div>

                    <div>
                      <Label>Registration No.</Label>
                      <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required />
                    </div>

                    <div>
                      <Label>PAN No.</Label>
                      <Input value={panNumber} onChange={(e) => setPanNumber(e.target.value)} required />
                    </div>

                    <div>
                      <Label>Office Location</Label>
                      <Input value={officeLocation} onChange={(e) => setOfficeLocation(e.target.value)} required />
                    </div>

                    <div>
                      <Label>Registration Certificate</Label>
                      <Input type="file" onChange={(e) => setRegistrationFile(e.target.files?.[0] || null)} required />
                    </div>

                    <div>
                      <Label>PAN Certificate</Label>
                      <Input type="file" onChange={(e) => setPanFile(e.target.files?.[0] || null)} required />
                    </div>

                    <div>
                      <Label>Letterhead (Optional)</Label>
                      <Input type="file" onChange={(e) => setLetterhead(e.target.files?.[0] || null)} />
                    </div>

                    <p className="text-xs text-gray-500">
                      Upload clear documents for verification
                    </p>
                  </>
                )}

                {/* VOLUNTEER */}
                {role === "volunteer" && (
                  <div>
                    <Label>Location</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
                  </div>
                )}

                {/* PASSWORD */}
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
  type="submit"
  className="w-full bg-[#4F46C8] hover:bg-[#4338CA] text-white rounded-full transition-all duration-200"
  disabled={loading}
>
  {loading ? "Creating..." : "Create Account"}
</Button>
              </form>
            )}

            {/* FOOTER */}
            <div className="border-t pt-4">
              <p className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600">
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